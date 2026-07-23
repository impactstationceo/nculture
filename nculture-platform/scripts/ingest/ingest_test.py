#!/usr/bin/env python
"""1번 기능 인제스트 실측: SRT + OCR -> Gemini -> 구조화 추출

검증 포인트:
  1) Gemini가 지저분한 OCR에서 '화면에 뜬 예시 프롬프트'를 정확히 회수/정제하는가
  2) 학습목표/키워드/레벨별 예시/루브릭을 한국어로 쓸 만하게 뽑는가
  3) 실제 토큰 소비/비용이 추정과 맞는가
"""
import os, sys, json, time, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.abspath(__file__))
ENV = "/Users/impactstation/Documents/work/nculture/nculture-platform/frontend/.env"
MODEL = sys.argv[1] if len(sys.argv) > 1 else "gemini-3.6-flash"
OCR_FILE = sys.argv[2] if len(sys.argv) > 2 else "2-3.ocr.txt"


def load_key():
    for line in open(ENV, encoding="utf-8"):
        if line.strip().startswith("GEMINI_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("GEMINI_API_KEY 없음")


def read(name):
    p = os.path.join(ROOT, name)
    return open(p, encoding="utf-8").read() if os.path.exists(p) else ""


SYSTEM = """너는 AI 크리에이터 교육 플랫폼의 '강의 인제스트 엔진'이다.
강의 음성 전사(SRT)와 화면 OCR 텍스트를 받아 실습용 구조화 데이터를 만든다.

중요 규칙:
- OCR 텍스트에는 워터마크('∩ Culture'), 강사 웹캠 배경, 번인 자막, 재생영상 파편 등
  노이즈가 많다. 이것들은 전부 무시하라.
- OCR에서 '강사가 시연용으로 화면에 띄운 예시 프롬프트'(보통 영어 문장 블록)만 골라
  원문 그대로 정확히 복원하라. 음성에는 없고 화면에만 있는 경우가 많다.
- 예시 프롬프트(example_prompts)는 이 회차 내용에 맞게 초급/중급/고급 3단계로 새로 작성하라.
- rubric은 이 회차 실습 결과물을 채점할 기준이다."""

INSTRUCTION = """아래 회차의 SRT와 OCR을 분석해 JSON으로만 답하라.

출력 JSON 스키마:
{
  "session_title": "회차 제목(한국어 추정)",
  "learning_objectives": ["학습목표 3~5개(한국어)"],
  "key_concepts": ["핵심 키워드 5~8개(한국어)"],
  "on_screen_prompts": [
    {"timecode":"mm:ss(가능하면)", "prompt":"OCR에서 복원한 실제 시연 프롬프트 원문", "lang":"en|ko"}
  ],
  "example_prompts": {
    "beginner":     {"label":"초급", "prompt":"이 회차용 초급 예시 프롬프트"},
    "intermediate": {"label":"중급", "prompt":"..."},
    "advanced":     {"label":"고급", "prompt":"..."}
  },
  "rubric": {
    "focus": "이 회차 채점 초점(한국어)",
    "keywords_expected": ["결과물/프롬프트에서 확인할 키워드"],
    "criteria": [
      {"axis":"프롬프트 품질","weight":30,"check":"무엇을 보는가(한국어)"},
      {"axis":"의도 일치도","weight":40,"check":"..."},
      {"axis":"과제 적합도","weight":20,"check":"..."},
      {"axis":"창의성","weight":10,"check":"..."}
    ]
  }
}"""


def main():
    key = load_key()
    srt = read("2-3.srt")
    ocr = read(OCR_FILE)
    print(f"[입력] SRT {len(srt):,}자, OCR({OCR_FILE}) {len(ocr):,}자  -> 모델 {MODEL}")

    user_text = f"{INSTRUCTION}\n\n===== SRT (음성 전사) =====\n{srt}\n\n===== OCR (화면 텍스트, 노이즈 포함) =====\n{ocr}"

    body = {
        "systemInstruction": {"parts": [{"text": SYSTEM}]},
        "contents": [{"role": "user", "parts": [{"text": user_text}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.3},
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
    req = urllib.request.Request(
        url, data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json", "x-goog-api-key": key},
    )
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            resp = json.load(r)
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode()[:400]); sys.exit(1)
    dt = time.time() - t0

    usage = resp.get("usageMetadata", {})
    pin = usage.get("promptTokenCount", 0)
    pout = usage.get("candidatesTokenCount", 0)
    text = resp["candidates"][0]["content"]["parts"][0]["text"]

    print(f"[응답] {dt:.1f}s  입력토큰={pin:,}  출력토큰={pout:,}")
    # gemini-3.6-flash: $1.50/1M in, $7.50/1M out
    cost = pin/1e6*1.50 + pout/1e6*7.50
    print(f"[비용] 이번 호출 약 ${cost:.4f}\n")

    out_path = os.path.join(ROOT, "2-3.ingest.json")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(text)
    try:
        parsed = json.loads(text)
        print(json.dumps(parsed, ensure_ascii=False, indent=2))
    except Exception:
        print("(JSON 파싱 실패, 원문 출력)\n", text[:2000])
    print(f"\n저장: {out_path}")


if __name__ == "__main__":
    main()
