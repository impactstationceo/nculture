#!/usr/bin/env python
"""강의 인제스트 오케스트레이터 — 임의 강의 영상 하나로 전 파이프라인 실행.

  전사(Whisper) → 키프레임+OCR → Gemini 구조화 추출 → Gemini 추천 생성 → <base>.ingest.json

로컬 무거운 두 단계(전사·OCR)는 검증된 스크립트를 서브프로세스로 재사용하고
(av/cv2 dylib 충돌 회피), Gemini 단계는 여기서 인자화해 인라인 처리한다.

사용법:
  ./.venv/bin/python ingest_lecture.py <video.mp4> [옵션]
    --whisper small        전사 모델 (tiny|base|small|medium|large-v3)
    --threshold 10         OCR 씬체인지 임계값
    --model gemini-3.6-flash   Gemini 모델
    --out DIR              산출물 위치 (기본: 이 스크립트 폴더)
    --copy-to PATH         완성 ingest.json 복사 위치 (예: frontend/lib/ingest/<name>.json)
    --skip-transcribe      이미 <base>.srt 있으면 전사 건너뛰기
    --skip-ocr             이미 <base>.ocr_v2.txt 있으면 OCR 건너뛰기

전제: faster-whisper·opencv·easyocr·numpy 설치된 venv 로 실행. Gemini 키는 frontend/.env 의 GEMINI_API_KEY.
"""
import os, sys, json, time, argparse, subprocess, shutil, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
ENV = os.path.normpath(os.path.join(HERE, "..", "..", "frontend", ".env"))


def log(msg): print(f"\033[36m▶\033[0m {msg}", flush=True)
def ok(msg):  print(f"  \033[32m✓\033[0m {msg}", flush=True)


def load_key():
    if not os.path.exists(ENV):
        sys.exit(f"[에러] .env 없음: {ENV}")
    for line in open(ENV, encoding="utf-8"):
        if line.strip().startswith("GEMINI_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("[에러] GEMINI_API_KEY 없음")


def gemini(key, model, system, user_text, temperature=0.3):
    body = {
        "systemInstruction": {"parts": [{"text": system}]},
        "contents": [{"role": "user", "parts": [{"text": user_text}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": temperature},
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"),
                                 headers={"Content-Type": "application/json", "x-goog-api-key": key})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            resp = json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"[Gemini HTTP {e.code}] {e.read().decode()[:400]}")
    usage = resp.get("usageMetadata", {})
    text = resp["candidates"][0]["content"]["parts"][0]["text"]
    return json.loads(text), usage


# ── Gemini 프롬프트 (ingest_test.py / enrich_recommendations.py 와 동일) ──

EXTRACT_SYSTEM = """너는 AI 크리에이터 교육 플랫폼의 '강의 인제스트 엔진'이다.
강의 음성 전사(SRT)와 화면 OCR 텍스트를 받아 실습용 구조화 데이터를 만든다.

중요 규칙:
- OCR 텍스트에는 워터마크, 강사 웹캠 배경, 번인 자막, 재생영상 파편 등 노이즈가 많다. 무시하라.
- OCR에서 '강사가 시연용으로 화면에 띄운 예시 프롬프트'(보통 영어 문장 블록)만 골라 원문 그대로 정확히 복원하라. 음성에는 없고 화면에만 있는 경우가 많다.
- example_prompts는 이 회차 내용에 맞게 초급/중급/고급 3단계로 새로 작성하라.
- rubric은 이 회차 실습 결과물을 채점할 기준이다."""

EXTRACT_INSTRUCTION = """아래 회차의 SRT와 OCR을 분석해 JSON으로만 답하라. 스키마:
{
  "session_title": "회차 제목(한국어 추정)",
  "learning_objectives": ["학습목표 3~5개(한국어)"],
  "key_concepts": ["핵심 키워드 5~8개(한국어)"],
  "on_screen_prompts": [{"timecode":"mm:ss", "prompt":"OCR에서 복원한 실제 시연 프롬프트 원문", "lang":"en|ko"}],
  "example_prompts": {
    "beginner":{"label":"초급","prompt":"..."},"intermediate":{"label":"중급","prompt":"..."},"advanced":{"label":"고급","prompt":"..."}
  },
  "rubric": {
    "focus":"채점 초점(한국어)","keywords_expected":["확인할 키워드"],
    "criteria":[
      {"axis":"프롬프트 품질","weight":30,"check":"..."},
      {"axis":"의도 일치도","weight":40,"check":"..."},
      {"axis":"과제 적합도","weight":20,"check":"..."},
      {"axis":"창의성","weight":10,"check":"..."}
    ]
  }
}"""

ENRICH_SYSTEM = """너는 AI 콘텐츠 창작 교육 플랫폼의 실습 추천 엔진이다.
강사가 시연한 프롬프트를 보고, 학생이 '직접 연습해볼' 추천 예시 프롬프트를 만든다.
규칙: 같은 기법/개념을 연습하되 소재·시나리오는 반드시 다르게. 베끼지 말 것.
학생이 시연 직후 따라 해볼 수 있는 명확한 프롬프트. 시연이 영어면 영어로, 한국어면 한국어로. 각 시연마다 정확히 2개."""


def run_stage(video, script, args, expected_out, skip):
    """전사/OCR 스크립트를 서브프로세스로 실행하고 산출 파일 경로 반환."""
    if skip and os.path.exists(expected_out):
        ok(f"건너뜀 (이미 존재): {os.path.basename(expected_out)}")
        return expected_out
    cmd = [sys.executable, os.path.join(HERE, script), video] + [str(a) for a in args]
    t0 = time.time()
    r = subprocess.run(cmd, cwd=HERE)
    if r.returncode != 0:
        sys.exit(f"[에러] {script} 실패 (exit {r.returncode})")
    if not os.path.exists(expected_out):
        sys.exit(f"[에러] {script} 산출물 없음: {expected_out}")
    ok(f"{os.path.basename(expected_out)} ({time.time()-t0:.0f}s)")
    return expected_out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--whisper", default="small")
    ap.add_argument("--threshold", default="10")
    ap.add_argument("--min-chars", default="15")
    ap.add_argument("--model", default="gemini-3.6-flash")
    ap.add_argument("--out", default=HERE)
    ap.add_argument("--copy-to", default=None)
    ap.add_argument("--skip-transcribe", action="store_true")
    ap.add_argument("--skip-ocr", action="store_true")
    a = ap.parse_args()

    if not os.path.exists(a.video):
        sys.exit(f"[에러] 영상 없음: {a.video}")
    base = os.path.splitext(os.path.basename(a.video))[0]
    os.makedirs(a.out, exist_ok=True)
    # 하위 스크립트는 자기 폴더(HERE)에 <base>.srt / <base>.ocr_v2.txt 를 쓴다
    srt = os.path.join(HERE, f"{base}.srt")
    ocr = os.path.join(HERE, f"{base}.ocr_v2.txt")
    ingest_out = os.path.join(a.out, f"{base}.ingest.json")
    key = load_key()
    T0 = time.time()

    print(f"\n=== 강의 인제스트: {base} ===\n")

    log("[1/4] 음성 전사 (Whisper)")
    run_stage(a.video, "transcribe.py", [a.whisper], srt, a.skip_transcribe)

    log("[2/4] 키프레임 + OCR")
    run_stage(a.video, "keyframes_ocr_v2.py", [a.threshold, a.min_chars], ocr, a.skip_ocr)

    log("[3/4] Gemini 구조화 추출")
    srt_txt = open(srt, encoding="utf-8").read()
    ocr_txt = open(ocr, encoding="utf-8").read()
    user = f"{EXTRACT_INSTRUCTION}\n\n===== SRT =====\n{srt_txt}\n\n===== OCR (노이즈 포함) =====\n{ocr_txt}"
    data, u1 = gemini(key, a.model, EXTRACT_SYSTEM, user)
    ok(f"제목: {data.get('session_title','')[:40]} · 시연 프롬프트 {len(data.get('on_screen_prompts',[]))}개 "
       f"(입력 {u1.get('promptTokenCount',0)}t)")

    log("[4/4] Gemini 연습 추천 생성")
    prompts = data.get("on_screen_prompts", [])
    lines = [f"강의: {data.get('session_title','')}", f"핵심 개념: {', '.join(data.get('key_concepts',[]))}", "",
             "각 시연 프롬프트에 학생용 연습 추천 2개를 만들어라. JSON: {\"items\":[{\"timecode\":\"...\",\"recommended\":[\"..\",\"..\"]}]}",
             "timecode·순서는 입력과 동일하게.", "", "=== 시연 프롬프트 ==="]
    for p in prompts:
        lines.append(f'- [{p["timecode"]}] ({p.get("lang","")}) {p["prompt"]}')
    rec, u2 = gemini(key, a.model, ENRICH_SYSTEM, "\n".join(lines), temperature=0.7)
    by_tc = {it["timecode"]: it["recommended"][:2] for it in rec.get("items", [])}
    merged = 0
    for p in prompts:
        if p["timecode"] in by_tc:
            p["recommended"] = by_tc[p["timecode"]]; merged += 1
    ok(f"추천 병합 {merged}/{len(prompts)} (출력 {u2.get('candidatesTokenCount',0)}t)")

    json.dump(data, open(ingest_out, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

    cost = ((u1.get('promptTokenCount',0)+u2.get('promptTokenCount',0))/1e6*1.50
            + (u1.get('candidatesTokenCount',0)+u2.get('candidatesTokenCount',0))/1e6*7.50)
    print(f"\n=== 완료 ({time.time()-T0:.0f}s) ===")
    print(f"  결과      : {ingest_out}")
    print(f"  Gemini 비용: 약 ${cost:.3f}  (로컬 전사·OCR = 무료)")

    if a.copy_to:
        os.makedirs(os.path.dirname(a.copy_to), exist_ok=True)
        shutil.copy(ingest_out, a.copy_to)
        print(f"  복사      : {a.copy_to}")


if __name__ == "__main__":
    main()
