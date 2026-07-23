#!/usr/bin/env python
"""수강생 생성물(AI 영상) Gemini 채점 — 정량 지표 + 피드백.
결과를 프론트 평가 카드 스키마로 매핑해 sd2.grade.json 으로 저장.
"""
import os, sys, json, base64, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.abspath(__file__))
ENV = "/Users/impactstation/Documents/work/nculture/nculture-platform/frontend/.env"
MODEL = "gemini-3.6-flash"
VIDEO = "/Users/impactstation/Downloads/sd2.mp4"
OUT = "/Users/impactstation/Documents/work/nculture/nculture-platform/frontend/lib/ingest/sd2.grade.json"


def load_key():
    for line in open(ENV, encoding="utf-8"):
        if line.strip().startswith("GEMINI_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("GEMINI_API_KEY 없음")


SYSTEM = """너는 AI 크리에이터 교육 플랫폼의 'AI 영상 생성물 채점관'이다.
학생이 생성한 AI 영상을 실제로 보고, 영상 생성 품질을 정량 지표로 채점한다.

채점 축(가중치):
- 프롬프트 충실도 35%: 의도한 장면/피사체/스타일이 영상에 제대로 담겼는가
- 시각적 품질 25%: 해상도·디테일·조명·구도·심미성
- 모션 자연스러움 20%: 움직임의 자연스러움, 부자연스러운 왜곡/떨림 없음
- 시간적 일관성 20%: 프레임 간 피사체·배경 일관성, 깜빡임/변형 없음

각 축 0~100점. 관찰한 실제 근거로 코멘트. 아티팩트(손가락 왜곡, 형태 붕괴, 깜빡임 등)가 보이면 명시."""

INSTRUCTION = """이 AI 생성 영상을 보고 채점하라. JSON으로만 답한다. 스키마:
{
  "inferred_prompt": "이 영상을 생성했을 법한 영문 시네마틱 프롬프트",
  "overall_score": 0-100 정수,
  "summary": "한 줄 총평 (한국어)",
  "metrics": [
    {"axis": "프롬프트 충실도", "weight": 35, "score": N, "comment": "한국어 근거"},
    {"axis": "시각적 품질", "weight": 25, "score": N, "comment": "..."},
    {"axis": "모션 자연스러움", "weight": 20, "score": N, "comment": "..."},
    {"axis": "시간적 일관성", "weight": 20, "score": N, "comment": "..."}
  ],
  "strengths": ["강점 1~2개(한국어)"],
  "improvements": ["개선점 1~2개(한국어)"],
  "artifacts": ["감지된 아티팩트(없으면 빈 배열)"]
}"""


def grade_color(score):
    if score >= 90: return 'text-emerald-600 bg-emerald-50 border-emerald-200', 'A'
    if score >= 80: return 'text-indigo-600 bg-indigo-50 border-indigo-200', 'B'
    if score >= 70: return 'text-amber-600 bg-amber-50 border-amber-200', 'C'
    return 'text-red-600 bg-red-50 border-red-200', 'D'


def main():
    key = load_key()
    b64 = base64.b64encode(open(VIDEO, "rb").read()).decode()
    print(f"[입력] 영상 {len(b64)//1024}KB(base64) -> {MODEL}")

    body = {
        "systemInstruction": {"parts": [{"text": SYSTEM}]},
        "contents": [{"role": "user", "parts": [
            {"inlineData": {"mimeType": "video/mp4", "data": b64}, "videoMetadata": {"fps": 3}},
            {"text": INSTRUCTION},
        ]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.3},
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"),
                                 headers={"Content-Type": "application/json", "x-goog-api-key": key})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            resp = json.load(r)
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode()[:500]); sys.exit(1)

    usage = resp.get("usageMetadata", {})
    g = json.loads(resp["candidates"][0]["content"]["parts"][0]["text"])
    score = int(g["overall_score"])
    gcolor, grade = grade_color(score)

    feedbacks = ([{"type": "positive", "text": s} for s in g.get("strengths", [])]
                 + [{"type": "suggestion", "text": s} for s in g.get("improvements", [])]
                 + [{"type": "suggestion", "text": f"아티팩트: {a}"} for a in g.get("artifacts", [])]
                 + [{"type": "tip", "text": g.get("summary", "")}])

    evaluation = {
        "grade": grade, "gradeColor": gcolor, "score": score,
        "focus": g.get("summary", "AI 영상 생성 품질 평가"),
        "criteria": [{"axis": m["axis"], "weight": m["weight"], "score": int(m["score"])} for m in g["metrics"]],
        "feedbacks": feedbacks,
        "matchedKeywords": [],
        "inferred_prompt": g.get("inferred_prompt", ""),
        "metricComments": {m["axis"]: m.get("comment", "") for m in g["metrics"]},
    }
    json.dump(evaluation, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

    print(f"[채점] 총점 {score} ({grade}) · 입력토큰={usage.get('promptTokenCount',0)} 출력={usage.get('candidatesTokenCount',0)}")
    print(f"추정 프롬프트: {g.get('inferred_prompt','')[:80]}")
    for m in g["metrics"]:
        print(f"  {m['axis']} {m['weight']}%: {m['score']}  — {m.get('comment','')[:50]}")
    print(f"강점: {g.get('strengths')}")
    print(f"개선: {g.get('improvements')}  아티팩트: {g.get('artifacts')}")
    print(f"저장: {OUT}")


if __name__ == "__main__":
    main()
