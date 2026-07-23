#!/usr/bin/env python3
"""시연용 비교 페르소나 2명을 DB에 심는다.

인사이트 화면(/insights)이 처음부터 비어 있으면 "사람마다 다르게 쌓인다"를 못 보여준다.
서로 뚜렷하게 다른 학생 2명을 미리 만들어 두고, 대표님이 직접 가입해 클릭하면
세 번째 회원으로 실시간 추가되는 걸 보여주는 구성.

  김지민  입문   · 영상/시네마틱  · 강의 앞부분(10:41·15:31) 체류 · Sora
  박서준  실무자 · 광고쇼츠/빈티지 · 강의 뒷부분(18:53·20:17) 체류 · MiniMax · 채점 이력

사용법:
  python3 scripts/seed_demo_personas.py          # 심기 (기존 시드는 지우고 다시)
  python3 scripts/seed_demo_personas.py --clear  # 시드만 제거

전제: 루트 .env 의 SUPABASE_PROJECT_ID, frontend/.env 의
      NEXT_PUBLIC_COMING_ANALYTICS_KEY / SUPABASE_SERVICE_ROLE_KEY
"""
import argparse
import json
import os
import subprocess
import sys
import urllib.parse
import uuid
from datetime import datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SESSION_ID = "00000000-0000-4000-8000-000000000023"   # 프로토타입 회차(2-3 강의)
SEED_LABELS = ("김지민", "박서준")                      # --clear 대상 식별


def load_env():
    env = {}
    for path in (os.path.join(ROOT, ".env"), os.path.join(ROOT, "..", ".env"),
                 os.path.join(ROOT, "frontend", ".env")):
        p = os.path.normpath(path)
        if not os.path.exists(p):
            continue
        for line in open(p, encoding="utf-8"):
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    missing = [k for k in ("SUPABASE_PROJECT_ID", "NEXT_PUBLIC_COMING_ANALYTICS_KEY",
                           "SUPABASE_SERVICE_ROLE_KEY") if k not in env]
    if missing:
        sys.exit(f"[에러] .env 에 없음: {', '.join(missing)}")
    return env


def curl(url, method="GET", headers=None, body=None, timeout=60):
    """urllib 은 Cloudflare 가 UA 기준으로 막아서 curl 을 쓴다."""
    cmd = ["curl", "-s", "-w", "\n%{http_code}", "-X", method, url, "--max-time", str(timeout)]
    for k, v in (headers or {}).items():
        cmd += ["-H", f"{k}: {v}"]
    tmp = None
    if body is not None:
        tmp = f"/tmp/seed_body_{uuid.uuid4().hex}.json"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(body, f)
        cmd += ["--data-binary", f"@{tmp}"]
    try:
        out = subprocess.run(cmd, capture_output=True, text=True).stdout
    finally:
        if tmp and os.path.exists(tmp):
            os.unlink(tmp)
    text, _, code = out.rpartition("\n")
    try:
        return int(code), (json.loads(text) if text.strip() else None)
    except json.JSONDecodeError:
        return int(code), text


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--clear", action="store_true", help="시드 페르소나만 제거")
    args = ap.parse_args()

    env = load_env()
    base = f"https://{env['SUPABASE_PROJECT_ID']}.supabase.co"
    anon_key = env["NEXT_PUBLIC_COMING_ANALYTICS_KEY"]
    svc = env["SUPABASE_SERVICE_ROLE_KEY"]
    admin_h = {"apikey": svc, "Authorization": f"Bearer {svc}", "Content-Type": "application/json"}

    # ── 기존 시드 제거: label 로 찾아 auth 사용자를 지우면 CASCADE 로 전부 정리된다 ──
    # 한글 라벨은 URL 인코딩해야 PostgREST 필터가 먹는다 (안 하면 조용히 0건)
    q = urllib.parse.quote(",".join(f'"{l}"' for l in SEED_LABELS))
    code, rows = curl(f"{base}/rest/v1/user_persona?label=in.({q})&select=user_id,label", headers=admin_h)
    removed = 0
    for r in (rows or []):
        c, _ = curl(f"{base}/auth/v1/admin/users/{r['user_id']}", method="DELETE", headers=admin_h)
        if c in (200, 204):
            removed += 1
    print(f"기존 시드 제거: {removed}명")
    if args.clear:
        return

    now = datetime.now(timezone.utc)
    def ago(minutes):
        return (now - timedelta(minutes=minutes)).isoformat()

    # ── 페르소나 정의 ──────────────────────────────────────────
    personas = [
        {
            "label": "김지민",
            "seed": {"contentTypes": ["video"], "visualStyles": ["cinematic"],
                     "purpose": "hobby", "experience": "beginner", "skipped": False,
                     "createdAt": ago(52)},
            "events": [
                ("style_select", {"content_types": ["video"], "visual_styles": ["cinematic"],
                                  "purpose": "hobby", "experience": "beginner", "skipped": False}, 52),
                ("dwell", {"section": "01:14", "seconds": 88}, 48),
                ("dwell", {"section": "10:41", "seconds": 143}, 44),
                ("apply_recommendation", {"prompt": "너는 고객 경험(CX) 데이터 분석가야...",
                                          "is_recommendation": True, "timecode": "10:41", "video_time": 700}, 43),
                ("generate", {"service": "sora", "tier": "sora-2", "credits": 16,
                              "resolution": "1080p", "duration": "10초", "audio_on": True,
                              "from_recommendation": True, "timecode": "10:41",
                              "prompt_length": 96, "video_time": 705}, 42),
                ("rate", {"stars": 5, "timecode": "10:41"}, 41),
                ("dwell", {"section": "15:31", "seconds": 121}, 38),
                ("regenerate", {"service": "sora", "tier": "sora-2"}, 36),
                ("generate", {"service": "sora", "tier": "sora-2", "credits": 16,
                              "resolution": "1080p", "duration": "10초", "audio_on": True,
                              "from_recommendation": False, "timecode": "15:31",
                              "prompt_length": 64, "video_time": 950}, 35),
                ("save", {"timecode": "15:31"}, 34),
            ],
            "ratings": [{"stars": 5, "timecode": "10:41",
                         "prompt": "너는 고객 경험(CX) 데이터 분석가야. 신규 앱 서비스의 사용자 리뷰 데이터를 분석하여 주요 불만 사항과 만족 요소를 구분해줘."}],
            "gradings": [],
        },
        {
            "label": "박서준",
            "seed": {"contentTypes": ["ads_shorts"], "visualStyles": ["vintage"],
                     "purpose": "education", "experience": "pro", "skipped": False,
                     "createdAt": ago(26)},
            "events": [
                ("style_select", {"content_types": ["ads_shorts"], "visual_styles": ["vintage"],
                                  "purpose": "education", "experience": "pro", "skipped": False}, 26),
                ("model_select", {"service": "minimax", "tier": "hailuo-2.3"}, 24),
                ("dwell", {"section": "18:53", "seconds": 205}, 22),
                ("apply_recommendation", {"prompt": "이제 너는 감각적이고 혁신적인 UI/UX 디자이너야...",
                                          "is_recommendation": True, "timecode": "18:53", "video_time": 1140}, 20),
                ("generate", {"service": "minimax", "tier": "hailuo-2.3", "credits": 24,
                              "resolution": "720p", "duration": "5초", "audio_on": False,
                              "from_recommendation": True, "timecode": "18:53",
                              "prompt_length": 118, "video_time": 1145}, 19),
                ("rate", {"stars": 4, "timecode": "18:53"}, 18),
                ("dwell", {"section": "20:17", "seconds": 167}, 15),
                ("apply_recommendation", {"prompt": "정리된 타깃 및 페인 포인트를 바탕으로...",
                                          "is_recommendation": True, "timecode": "20:17", "video_time": 1225}, 13),
                ("generate", {"service": "minimax", "tier": "hailuo-2.3", "credits": 24,
                              "resolution": "1080p", "duration": "6초", "audio_on": False,
                              "from_recommendation": True, "timecode": "20:17",
                              "prompt_length": 132, "video_time": 1230}, 12),
                ("rate", {"stars": 4, "timecode": "20:17"}, 11),
                ("publish", {"timecode": "20:17"}, 10),
            ],
            "ratings": [
                {"stars": 4, "timecode": "18:53",
                 "prompt": "이제 너는 감각적이고 혁신적인 UI/UX 디자이너야. 모바일 웰니스 앱의 사용자 경험 컨셉을 도출하기 위해 클라이언트에게 요청해야 할 필수 정보는 무엇일까?"},
                {"stars": 4, "timecode": "20:17",
                 "prompt": "정리된 타깃 및 페인 포인트를 바탕으로, 맞춤형 펫 푸드 브랜드의 패키지 디자인 컨셉 5가지를 제안하고 구체적인 도출 근거를 함께 설명해줘."},
            ],
            "gradings": [
                {"ai_score": 88, "ai_grade": "B", "minutes": 19,
                 "prompt": "빈티지 필름 톤의 펫 푸드 브랜드 광고 컷",
                 "criteria": [{"axis": "프롬프트 충실도", "weight": 35, "score": 90},
                              {"axis": "시각적 품질", "weight": 25, "score": 88},
                              {"axis": "모션 자연스러움", "weight": 20, "score": 85},
                              {"axis": "시간적 일관성", "weight": 20, "score": 87}],
                 "feedback": [{"type": "positive", "text": "빈티지 필름 그레인과 색보정이 브랜드 톤과 잘 맞습니다."},
                              {"type": "suggestion", "text": "제품 클로즈업에서 라벨 텍스트가 일부 뭉갭니다."}]},
            ],
        },
    ]

    for p in personas:
        # 익명 사용자 생성 (실제 수집 경로와 동일한 형태)
        code, res = curl(f"{base}/auth/v1/signup", method="POST",
                         headers={"apikey": anon_key, "Content-Type": "application/json"}, body={})
        uid = (res or {}).get("user", {}).get("id")
        if not uid:
            sys.exit(f"[에러] 익명 사용자 생성 실패: {code} {str(res)[:200]}")

        curl(f"{base}/rest/v1/user_persona", method="POST",
             headers={**admin_h, "Prefer": "resolution=merge-duplicates"},
             body={"user_id": uid, "label": p["label"], "seed": p["seed"],
                   "updated_at": ago(1)})

        curl(f"{base}/rest/v1/learning_events", method="POST", headers=admin_h,
             body=[{"user_id": uid, "session_id": SESSION_ID, "event_type": t,
                    "payload": pl, "created_at": ago(m)} for t, pl, m in p["events"]])

        if p["ratings"]:
            curl(f"{base}/rest/v1/prompt_feedback", method="POST", headers=admin_h,
                 body=[{"user_id": uid, "session_id": SESSION_ID, "timecode": r["timecode"],
                        "prompt": r["prompt"], "stars": r["stars"], "created_at": ago(20)}
                       for r in p["ratings"]])

        if p["gradings"]:
            curl(f"{base}/rest/v1/video_gradings", method="POST", headers=admin_h,
                 body=[{"user_id": uid, "session_id": SESSION_ID, "prompt": g["prompt"],
                        "ai_score": g["ai_score"], "ai_grade": g["ai_grade"],
                        "ai_criteria": g["criteria"], "ai_feedback": g["feedback"],
                        "ai_model": "gemini-3.6-flash", "created_at": ago(g["minutes"])}
                       for g in p["gradings"]])

        print(f"  ✓ {p['label']}  이벤트 {len(p['events'])} · 별점 {len(p['ratings'])} · 채점 {len(p['gradings'])}")

    print("\n완료 — /insights 에서 확인")


if __name__ == "__main__":
    main()
