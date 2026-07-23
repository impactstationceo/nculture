#!/usr/bin/env python
"""인제스트 보강: 각 시연 프롬프트마다 '학생용 연습 추천 예시 2개' 생성.

추천 예시는 시연 프롬프트와 달라야 한다:
  - 같은 기법/개념을 가르치되
  - 다른 소재/시나리오로 (복사 아닌 연습)
결과를 2-3.ingest.json의 각 on_screen_prompt에 recommended[] 로 병합.
"""
import os, sys, json, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.abspath(__file__))
ENV = "/Users/impactstation/Documents/work/nculture/nculture-platform/frontend/.env"
MODEL = "gemini-3.6-flash"
INGEST = os.path.join(ROOT, "2-3.ingest.json")


def load_key():
    for line in open(ENV, encoding="utf-8"):
        if line.strip().startswith("GEMINI_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("GEMINI_API_KEY 없음")


SYSTEM = """너는 AI 콘텐츠 창작 교육 플랫폼의 실습 추천 엔진이다.
강사가 강의에서 시연한 프롬프트를 보고, 학생이 '직접 연습해볼' 추천 예시 프롬프트를 만든다.

규칙:
- 시연 프롬프트와 같은 기법/개념(역할 부여, POV, 페르소나, 이미지 프롬프트 구조 등)을 연습하게 한다.
- 단, 소재·시나리오는 반드시 다르게 한다. 시연 프롬프트를 그대로 베끼거나 살짝만 바꾸지 말 것.
- 학생이 시연 직후 바로 따라 해볼 수 있는, 명확하고 실행 가능한 프롬프트.
- 시연 프롬프트가 영어면 영어로, 한국어면 한국어로 맞춘다.
- 각 시연 프롬프트마다 정확히 2개."""


def build_instruction(prompts, ctx):
    lines = [f"강의: {ctx['title']}", f"핵심 개념: {', '.join(ctx['concepts'])}", "",
             "아래 각 '시연 프롬프트'에 대해 학생용 연습 추천 예시 2개를 만들어라.",
             "JSON으로만 답한다. 스키마:",
             '{ "items": [ { "timecode": "...", "recommended": ["추천1", "추천2"] } ] }',
             "timecode는 입력과 동일하게. items 순서도 입력 순서대로.", "",
             "=== 시연 프롬프트 목록 ==="]
    for p in prompts:
        lines.append(f'- [{p["timecode"]}] ({p.get("lang","")}) {p["prompt"]}')
    return "\n".join(lines)


def main():
    key = load_key()
    data = json.load(open(INGEST, encoding="utf-8"))
    prompts = data["on_screen_prompts"]
    ctx = {"title": data.get("session_title", ""), "concepts": data.get("key_concepts", [])}

    body = {
        "systemInstruction": {"parts": [{"text": SYSTEM}]},
        "contents": [{"role": "user", "parts": [{"text": build_instruction(prompts, ctx)}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.7},
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"),
                                 headers={"Content-Type": "application/json", "x-goog-api-key": key})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            resp = json.load(r)
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode()[:400]); sys.exit(1)

    usage = resp.get("usageMetadata", {})
    text = resp["candidates"][0]["content"]["parts"][0]["text"]
    items = json.loads(text)["items"]
    by_tc = {it["timecode"]: it["recommended"] for it in items}

    merged = 0
    for p in prompts:
        rec = by_tc.get(p["timecode"])
        if rec:
            p["recommended"] = rec[:2]
            merged += 1

    json.dump(data, open(INGEST, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"병합 완료: {merged}/{len(prompts)}개 시연 프롬프트에 추천 2개 추가")
    print(f"토큰 입력={usage.get('promptTokenCount',0)} 출력={usage.get('candidatesTokenCount',0)}")
    # 미리보기
    for p in prompts[:3]:
        print(f"\n[{p['timecode']}] 시연: {p['prompt'][:50]}…")
        for i, r in enumerate(p.get("recommended", []), 1):
            print(f"  추천{i}: {r[:70]}")


if __name__ == "__main__":
    main()
