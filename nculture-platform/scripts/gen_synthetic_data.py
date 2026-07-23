#!/usr/bin/env python3
"""합성 학습 데이터 생성기 — 개인화 알고리즘 개발/평가용.

seed_demo_personas.py 가 '손으로 쓴 데모 2명'이라면, 이 스크립트는
'아키타입 기반 확률 시뮬로 N명을 대량 생성 + ground truth'다.

왜 필요한가:
  실학생이 없어도 PersonalizationProvider(추천기)를 개발·평가하려면 데이터가 필요하다.
  합성이라 각 유저의 '진짜 잠재 취향'을 우리가 알고 있으므로, 추천기가 그걸
  복원하는지 정량 평가(NDCG 등)할 수 있다. 실데이터로는 불가능한 이점.

핵심 설계:
  - 아키타입(8종) = 잠재 취향 분포(콘텐츠/스타일/서비스 가중 + 관심 구간 + 활동성)
  - 선언 != 실제: 온보딩 seed 는 잠재에서 '오신고 노이즈'를 섞어 만든다
    (사람은 자기 취향을 완벽히 신고하지 않음 → 추천기가 시드 너머를 학습할 여지)
  - 행동은 잠재 취향에 편향된 확률 시뮬 (모델선택·체류·추천적용·생성·별점)
  - 활동량은 power-law (파워유저 소수 + 원세션 다수)
  - 별점은 '관심 구간'일수록 높게 (학습 가능한 신호)

출력(기본): scripts/out/synthetic/ 에 JSON 파일 (검수 + ground truth + 삽입용 rows)
  --push  : 분석 Supabase 에 실제 삽입 (합성 auth 유저 생성, label 'syn:<arch>#n')
  --clear : label 'syn:%' 합성 유저 일괄 삭제 (CASCADE 로 전부 정리)

사용법:
  python3 scripts/gen_synthetic_data.py                 # 파일만 생성 (DB 무접촉)
  python3 scripts/gen_synthetic_data.py --users 60 --days 28 --seed 7
  python3 scripts/gen_synthetic_data.py --push          # 생성 + DB 삽입
  python3 scripts/gen_synthetic_data.py --clear         # 합성 데이터 제거

--push/--clear 전제: 루트 .env 의 SUPABASE_PROJECT_ID, frontend/.env 의
  NEXT_PUBLIC_COMING_ANALYTICS_KEY / SUPABASE_SERVICE_ROLE_KEY + 마이그레이션 015 적용.
"""
import argparse
import json
import os
import random
import subprocess
import sys
import urllib.parse
import uuid
from datetime import datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INGEST = os.path.join(ROOT, "frontend", "lib", "ingest", "2-3.ingest.json")
OUT_DIR = os.path.join(ROOT, "scripts", "out", "synthetic")
SESSION_ID = "00000000-0000-4000-8000-000000000023"   # 프로토타입 회차(2-3 강의)
SYN_PREFIX = "syn:"                                     # 합성 유저 label 접두어

# ── 택소노미 (온보딩 + lib/data.ts 와 일치) ──────────────────────────
CONTENT_TYPES = ["video", "image", "digital_human", "ads_shorts"]
VISUAL_STYLES = ["cinematic", "anime", "photoreal", "minimal", "experimental", "vintage"]
PURPOSES = ["hobby", "commercial", "branding", "education"]
EXPERIENCES = ["beginner", "intermediate", "pro"]
# 영상 서비스/티어 (lib/data.ts AI_SERVICES 기준)
SERVICE_TIERS = {
    "sora": ["sora-2", "sora-2-pro", "sora-2-max"],
    "veo": ["veo-lite", "veo-standard"],
    "kling": ["kling-v1", "kling-v2"],
    "minimax": ["minimax-fast", "minimax-quality"],
}
RES_BY_TIER = {  # 티어별 대표 파라미터 (generate payload 용)
    "sora-2": ("720p", "10초"), "sora-2-pro": ("1080p", "10초"), "sora-2-max": ("4K", "15초"),
    "veo-lite": ("720p", "8초"), "veo-standard": ("1080p", "10초"),
    "kling-v1": ("1080p", "5초"), "kling-v2": ("1080p", "10초"),
    "minimax-fast": ("720p", "5초"), "minimax-quality": ("1080p", "6초"),
}

# ── 아키타입: 잠재 취향 분포 (가중치는 상대값) ────────────────────────
# content/style/service 는 가중 dict, sections 는 관심 구간(가중), prevalence 는
# 모집단 내 비율, activity 는 세션수 lambda(파워로), rate_bias 는 별점 관대함(0~1).
ARCHETYPES = [
    {"id": "cine_hobbyist", "label": "시네마틱 취미러",
     "content": {"video": 3, "image": 1}, "style": {"cinematic": 4, "photoreal": 1},
     "service": {"sora": 3, "veo": 2}, "purpose": "hobby", "experience": "beginner",
     "sections": {"10:41": 3, "15:31": 2, "01:14": 1}, "prevalence": 3, "activity": 1.4, "rate_bias": 0.75},
    {"id": "ads_pro", "label": "광고쇼츠 실무자",
     "content": {"ads_shorts": 3, "video": 1}, "style": {"vintage": 3, "minimal": 2},
     "service": {"minimax": 3, "kling": 1}, "purpose": "commercial", "experience": "pro",
     "sections": {"18:53": 3, "20:17": 3, "18:21": 1}, "prevalence": 3, "activity": 2.2, "rate_bias": 0.55},
    {"id": "brand_designer", "label": "브랜딩 디자이너",
     "content": {"image": 2, "ads_shorts": 2}, "style": {"minimal": 3, "photoreal": 2},
     "service": {"kling": 2, "veo": 2}, "purpose": "branding", "experience": "intermediate",
     "sections": {"16:19": 3, "18:21": 2, "19:48": 2}, "prevalence": 2, "activity": 1.8, "rate_bias": 0.6},
    {"id": "anime_creator", "label": "애니 크리에이터",
     "content": {"image": 3, "video": 1}, "style": {"anime": 4, "experimental": 1},
     "service": {"kling": 2, "sora": 1}, "purpose": "hobby", "experience": "intermediate",
     "sections": {"02:12": 3, "12:33": 2}, "prevalence": 2, "activity": 1.6, "rate_bias": 0.7},
    {"id": "edu_researcher", "label": "교육/연구자",
     "content": {"video": 2, "digital_human": 2}, "style": {"minimal": 2, "photoreal": 2},
     "service": {"veo": 2, "sora": 1}, "purpose": "education", "experience": "pro",
     "sections": {"10:41": 2, "12:33": 3, "15:31": 2}, "prevalence": 2, "activity": 1.5, "rate_bias": 0.65},
    {"id": "experimental_artist", "label": "실험 아티스트",
     "content": {"video": 2, "image": 2}, "style": {"experimental": 4, "cinematic": 1},
     "service": {"sora": 2, "kling": 2}, "purpose": "hobby", "experience": "intermediate",
     "sections": {"02:12": 2, "19:48": 2, "20:17": 1}, "prevalence": 1, "activity": 2.0, "rate_bias": 0.5},
    {"id": "digital_human_pro", "label": "디지털휴먼 실무",
     "content": {"digital_human": 4, "video": 1}, "style": {"photoreal": 4, "minimal": 1},
     "service": {"veo": 3, "sora": 1}, "purpose": "commercial", "experience": "pro",
     "sections": {"16:19": 2, "18:21": 3}, "prevalence": 1, "activity": 1.7, "rate_bias": 0.6},
    {"id": "novice_explorer", "label": "입문 탐색러",
     "content": {"video": 2, "image": 2, "ads_shorts": 1}, "style": {"cinematic": 1, "minimal": 1, "photoreal": 1},
     "service": {"minimax": 2, "sora": 1, "veo": 1}, "purpose": "hobby", "experience": "beginner",
     "sections": {"01:14": 2, "10:41": 1, "18:53": 1}, "prevalence": 3, "activity": 1.1, "rate_bias": 0.8},
]


def wpick(rng, weights: dict):
    """가중 dict 에서 하나 뽑기."""
    items = list(weights.items())
    total = sum(w for _, w in items)
    r = rng.uniform(0, total)
    acc = 0
    for k, w in items:
        acc += w
        if r <= acc:
            return k
    return items[-1][0]


def top_keys(weights: dict, n: int):
    return [k for k, _ in sorted(weights.items(), key=lambda kv: -kv[1])[:n]]


def make_declared_seed(rng, arch, created_iso):
    """잠재 취향 → 선언 seed (오신고 노이즈 주입)."""
    content = top_keys(arch["content"], rng.choice([1, 1, 2]))
    styles = top_keys(arch["style"], rng.choice([1, 2, 2]))
    # 20% 확률로 top 하나 누락
    if len(content) > 1 and rng.random() < 0.2:
        content = content[:-1]
    if len(styles) > 1 and rng.random() < 0.2:
        styles = styles[:-1]
    # 25% 확률로 비선호 하나 추가 (오신고)
    if rng.random() < 0.25:
        cand = [c for c in CONTENT_TYPES if c not in content]
        if cand:
            content.append(rng.choice(cand))
    if rng.random() < 0.25:
        cand = [s for s in VISUAL_STYLES if s not in styles]
        if cand:
            styles.append(rng.choice(cand))
    purpose = arch["purpose"] if rng.random() < 0.85 else rng.choice(PURPOSES)
    experience = arch["experience"] if rng.random() < 0.85 else rng.choice(EXPERIENCES)
    return {
        "contentTypes": content, "visualStyles": styles,
        "purpose": purpose, "experience": experience,
        "skipped": False, "createdAt": created_iso,
    }


def powerlaw_sessions(rng, lam):
    """활동성: 대부분 1~2세션, 소수 파워유저. (지수분포 기반, 최소 1)."""
    return max(1, int(rng.expovariate(1.0 / lam)) + 1)


def build_user(rng, arch, idx, now, days, prompts_by_tc):
    """한 유저의 declared seed + 이벤트/별점/채점 rows + ground truth 생성."""
    key = f"{SYN_PREFIX}{arch['id']}#{idx}"

    def ago(minutes):
        return (now - timedelta(minutes=minutes)).isoformat()

    onboarded_min = rng.randint(days * 24 * 60 - 120, days * 24 * 60)  # 오래 전 온보딩
    seed = make_declared_seed(rng, arch, ago(onboarded_min))

    events, ratings, gradings = [], [], []
    # 온보딩 완료 스냅샷 (기존 파이프라인과 동일하게 style_select 로 기록)
    events.append(("style_select", {
        "content_types": seed["contentTypes"], "visual_styles": seed["visualStyles"],
        "purpose": seed["purpose"], "experience": seed["experience"], "skipped": False,
        "source": "synthetic",
    }, onboarded_min))

    n_sessions = powerlaw_sessions(rng, arch["activity"])
    # 세션들을 온보딩 이후 ~ 지금 사이에 분포
    session_marks = sorted(rng.randint(30, onboarded_min - 10) for _ in range(n_sessions)) if onboarded_min > 60 else [30]
    session_marks = session_marks[::-1]  # 최근 → 과거

    for s_min in session_marks:
        # 모델 선택 (잠재 서비스 편향)
        svc = wpick(rng, arch["service"])
        tier = rng.choice(SERVICE_TIERS[svc])
        events.append(("model_select", {"service": svc, "tier": tier, "source": "synthetic"}, s_min))

        # 관심 구간 1~2곳 체류 (관심 가중 → 체류시간 ↑)
        n_dwell = rng.choice([1, 1, 2])
        for _ in range(n_dwell):
            tc = wpick(rng, arch["sections"])
            interest = arch["sections"].get(tc, 1)
            secs = int(rng.gauss(40 + interest * 45, 20))
            events.append(("dwell", {"section": tc, "seconds": max(5, secs), "source": "synthetic"}, s_min))

        # 추천 프롬프트 적용 → 생성 → 별점 (관심 구간 기반)
        tc = wpick(rng, arch["sections"])
        recs = prompts_by_tc.get(tc) or []
        prompt = rng.choice(recs) if recs else f"[{tc}] 합성 프롬프트"
        from_rec = rng.random() < 0.7
        if from_rec:
            events.append(("apply_recommendation", {
                "prompt": prompt[:200], "is_recommendation": True, "timecode": tc,
                "video_time": tc_to_sec(tc), "source": "synthetic"}, s_min))
        res, dur = RES_BY_TIER.get(tier, ("720p", "5초"))
        events.append(("generate", {
            "service": svc, "tier": tier, "credits": rng.choice([10, 16, 24]),
            "resolution": res, "duration": dur, "audio_on": rng.random() < 0.5,
            "from_recommendation": from_rec, "timecode": tc,
            # /insights writtenPrompts + prompt_source/status 컨벤션(PR #20)과 일치
            "prompt": prompt, "prompt_source": "recommendation" if from_rec else "custom",
            "status": "success",
            "prompt_length": len(prompt), "video_time": tc_to_sec(tc), "source": "synthetic",
        }, s_min))
        # 별점: 관심 구간일수록 높게 + 관대함 + 노이즈
        interest = arch["sections"].get(tc, 0)
        base = 2.5 + interest * 0.6 + arch["rate_bias"] * 1.5
        stars = int(min(5, max(1, round(rng.gauss(base, 0.6)))))
        events.append(("rate", {"stars": stars, "timecode": tc, "source": "synthetic"}, s_min))
        ratings.append({"stars": stars, "timecode": tc, "prompt": prompt})

        # 가끔 재생성/저장/공개
        if rng.random() < 0.25:
            events.append(("regenerate", {"service": svc, "tier": tier, "source": "synthetic"}, s_min))
        roll = rng.random()
        if roll < 0.5:
            events.append(("save", {"timecode": tc, "source": "synthetic"}, s_min))
        elif roll < 0.65:
            events.append(("publish", {"timecode": tc, "source": "synthetic"}, s_min))
        # 실무자/브랜딩은 가끔 채점 이력
        if arch["experience"] == "pro" and rng.random() < 0.4:
            gradings.append({
                "prompt": prompt[:120], "ai_score": rng.randint(72, 94),
                "ai_grade": rng.choice(["A", "B", "B"]), "minutes": s_min,
                "criteria": [
                    {"axis": "프롬프트 충실도", "weight": 35, "score": rng.randint(75, 95)},
                    {"axis": "시각적 품질", "weight": 25, "score": rng.randint(75, 95)},
                    {"axis": "모션 자연스러움", "weight": 20, "score": rng.randint(70, 92)},
                    {"axis": "시간적 일관성", "weight": 20, "score": rng.randint(70, 92)},
                ],
                "feedback": [{"type": "positive", "text": "합성 채점 샘플"}],
            })

    # ground truth: 정규화된 잠재 벡터 (추천기 복원 평가용)
    ground = {
        "archetype": arch["id"], "label": arch["label"],
        "content": normalize(arch["content"], CONTENT_TYPES),
        "style": normalize(arch["style"], VISUAL_STYLES),
        "service": normalize(arch["service"], list(SERVICE_TIERS)),
        "purpose": arch["purpose"], "experience": arch["experience"],
        "section_interest": normalize(arch["sections"], list(prompts_by_tc)),
        "declared_seed": seed,
    }
    return {"key": key, "arch": arch["id"], "seed": seed,
            "events": events, "ratings": ratings, "gradings": gradings, "ground": ground}


def normalize(weights: dict, keys: list):
    total = sum(weights.get(k, 0) for k in keys) or 1
    return {k: round(weights.get(k, 0) / total, 4) for k in keys}


def tc_to_sec(tc: str) -> int:
    parts = [int(x) for x in tc.split(":")]
    return parts[0] * 60 + parts[1] if len(parts) == 2 else 0


def load_prompts():
    """ingest 에서 timecode -> recommended[] 매핑."""
    try:
        d = json.load(open(INGEST, encoding="utf-8"))
        return {p["timecode"]: p.get("recommended", []) for p in d.get("on_screen_prompts", [])}
    except Exception as e:
        print(f"[경고] ingest 로드 실패({e}) — 합성 프롬프트로 대체")
        return {tc: [] for tc in ["01:14", "10:41", "15:31", "18:53", "20:17"]}


# ── DB 접근 (seed_demo_personas.py 와 동일 관례) ─────────────────────
def load_env():
    env = {}
    for path in (os.path.join(ROOT, ".env"), os.path.join(ROOT, "frontend", ".env")):
        if not os.path.exists(path):
            continue
        for line in open(path, encoding="utf-8"):
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    missing = [k for k in ("SUPABASE_PROJECT_ID", "NEXT_PUBLIC_COMING_ANALYTICS_KEY",
                           "SUPABASE_SERVICE_ROLE_KEY") if k not in env]
    if missing:
        sys.exit(f"[에러] --push/--clear 엔 .env 필요: {', '.join(missing)}")
    return env


def curl(url, method="GET", headers=None, body=None, timeout=60):
    cmd = ["curl", "-s", "-w", "\n%{http_code}", "-X", method, url, "--max-time", str(timeout)]
    for k, v in (headers or {}).items():
        cmd += ["-H", f"{k}: {v}"]
    tmp = None
    if body is not None:
        tmp = f"/tmp/gen_body_{uuid.uuid4().hex}.json"
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


def push(users, now):
    env = load_env()
    base = f"https://{env['SUPABASE_PROJECT_ID']}.supabase.co"
    anon = env["NEXT_PUBLIC_COMING_ANALYTICS_KEY"]
    svc = env["SUPABASE_SERVICE_ROLE_KEY"]
    admin_h = {"apikey": svc, "Authorization": f"Bearer {svc}", "Content-Type": "application/json"}

    def ago(minutes):
        return (now - timedelta(minutes=minutes)).isoformat()

    pushed = 0
    for u in users:
        code, res = curl(f"{base}/auth/v1/signup", method="POST",
                         headers={"apikey": anon, "Content-Type": "application/json"}, body={})
        uid = (res or {}).get("user", {}).get("id")
        if not uid:
            print(f"  [건너뜀] {u['key']} 익명 생성 실패: {code}")
            continue
        curl(f"{base}/rest/v1/user_persona", method="POST",
             headers={**admin_h, "Prefer": "resolution=merge-duplicates"},
             body={"user_id": uid, "label": u["key"], "seed": u["seed"], "updated_at": ago(1)})
        curl(f"{base}/rest/v1/learning_events", method="POST", headers=admin_h,
             body=[{"user_id": uid, "session_id": SESSION_ID, "event_type": t,
                    "payload": pl, "created_at": ago(m)} for t, pl, m in u["events"]])
        if u["ratings"]:
            curl(f"{base}/rest/v1/prompt_feedback", method="POST", headers=admin_h,
                 body=[{"user_id": uid, "session_id": SESSION_ID, "timecode": r["timecode"],
                        "prompt": r["prompt"], "stars": r["stars"], "created_at": ago(20)}
                       for r in u["ratings"]])
        if u["gradings"]:
            curl(f"{base}/rest/v1/video_gradings", method="POST", headers=admin_h,
                 body=[{"user_id": uid, "session_id": SESSION_ID, "prompt": g["prompt"],
                        "ai_score": g["ai_score"], "ai_grade": g["ai_grade"],
                        "ai_criteria": g["criteria"], "ai_feedback": g["feedback"],
                        "ai_model": "synthetic", "created_at": ago(g["minutes"])}
                       for g in u["gradings"]])
        pushed += 1
    print(f"DB 삽입 완료: {pushed}/{len(users)}명 (label 접두어 '{SYN_PREFIX}')")


def clear():
    env = load_env()
    base = f"https://{env['SUPABASE_PROJECT_ID']}.supabase.co"
    svc = env["SUPABASE_SERVICE_ROLE_KEY"]
    admin_h = {"apikey": svc, "Authorization": f"Bearer {svc}", "Content-Type": "application/json"}
    like = urllib.parse.quote(f"{SYN_PREFIX}*")
    code, rows = curl(f"{base}/rest/v1/user_persona?label=like.{like}&select=user_id,label", headers=admin_h)
    removed = 0
    for r in (rows or []):
        c, _ = curl(f"{base}/auth/v1/admin/users/{r['user_id']}", method="DELETE", headers=admin_h)
        if c in (200, 204):
            removed += 1
    print(f"합성 데이터 제거: {removed}명 (CASCADE)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--users", type=int, default=40, help="생성할 총 유저 수")
    ap.add_argument("--days", type=int, default=21, help="활동 기간(과거 N일)")
    ap.add_argument("--seed", type=int, default=42, help="난수 시드(재현성)")
    ap.add_argument("--out", default=OUT_DIR, help="출력 디렉토리")
    ap.add_argument("--push", action="store_true", help="분석 DB 에 삽입")
    ap.add_argument("--clear", action="store_true", help="합성 데이터 제거 후 종료")
    args = ap.parse_args()

    if args.clear:
        clear()
        return

    rng = random.Random(args.seed)
    # Date.now 를 못 쓰는 환경 대비: 여기선 표준 스크립트라 now 사용 OK
    now = datetime.now(timezone.utc)
    prompts_by_tc = load_prompts()

    # 아키타입 배정 (prevalence 가중)
    pool = []
    for a in ARCHETYPES:
        pool += [a] * a["prevalence"]
    users = []
    counters = {a["id"]: 0 for a in ARCHETYPES}
    for _ in range(args.users):
        arch = rng.choice(pool)
        counters[arch["id"]] += 1
        users.append(build_user(rng, arch, counters[arch["id"]], now, args.days, prompts_by_tc))

    # ── 파일 출력 ──────────────────────────────────────────────
    os.makedirs(args.out, exist_ok=True)
    total_events = sum(len(u["events"]) for u in users)
    total_ratings = sum(len(u["ratings"]) for u in users)
    total_gradings = sum(len(u["gradings"]) for u in users)

    def dump(name, obj):
        with open(os.path.join(args.out, name), "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, indent=2)

    dump("run_meta.json", {"seed": args.seed, "days": args.days, "users": len(users),
                           "events": total_events, "ratings": total_ratings, "gradings": total_gradings,
                           "generated_at": now.isoformat()})
    dump("archetypes.json", ARCHETYPES)
    dump("users.json", [{"key": u["key"], "archetype": u["arch"], "declared_seed": u["seed"]} for u in users])
    dump("groundtruth.json", {u["key"]: u["ground"] for u in users})
    dump("user_persona.json", [{"user_id": u["key"], "label": u["key"], "seed": u["seed"]} for u in users])
    dump("learning_events.json", [{"user_id": u["key"], "session_id": SESSION_ID,
                                   "event_type": t, "payload": pl}
                                  for u in users for t, pl, _ in u["events"]])
    dump("prompt_feedback.json", [{"user_id": u["key"], "session_id": SESSION_ID,
                                   "timecode": r["timecode"], "prompt": r["prompt"], "stars": r["stars"]}
                                  for u in users for r in u["ratings"]])
    dump("video_gradings.json", [{"user_id": u["key"], "prompt": g["prompt"],
                                  "ai_score": g["ai_score"], "ai_grade": g["ai_grade"]}
                                 for u in users for g in u["gradings"]])

    # 분포 요약
    dist = {}
    for u in users:
        dist[u["arch"]] = dist.get(u["arch"], 0) + 1
    print(f"생성 완료 → {args.out}")
    print(f"  유저 {len(users)} · 이벤트 {total_events} · 별점 {total_ratings} · 채점 {total_gradings}")
    print("  아키타입 분포:")
    for aid, n in sorted(dist.items(), key=lambda kv: -kv[1]):
        print(f"    {aid:20s} {n}명")
    print("  ground truth: groundtruth.json (유저별 정답 취향벡터 — 추천기 평가용)")

    if args.push:
        print("\n--push: 분석 DB 에 삽입 중...")
        push(users, now)


if __name__ == "__main__":
    main()
