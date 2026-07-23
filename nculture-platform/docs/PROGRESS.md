# Coming AI — 개인화·채점 기능 진행 현황

> 담당 기능 2가지: **① 개인화된 예시 프롬프트 자동 생성**, **② 수강생 영상 자동 채점**
> (+ 개인화 데이터·강의실 이벤트 수집)
> 최종 업데이트: 2026-07-23

---

## 1. 한눈에 보기

| 항목 | 상태 |
|---|---|
| 로컬 실행 환경 | ✅ 완료 (`frontend/` 데모 모드, DB 없이 구동) |
| 기술 방향 확정 | ✅ SRT+OCR → Gemini, 순수 Gemini 채점 엔진 |
| **1번 인제스트 파이프라인 PoC** | ✅ **전 구간 실증 완료** (전사·OCR·Gemini 추출) |
| OCR 프로덕션 튜닝 | ✅ 커버리지 60%→98%, 속도 개선 |
| **2번 영상 채점** | ✅ **실제 Gemini 영상 채점 완료** (sd2.mp4, 92점 A) |
| **프로토타입 (`/prototype`)** | ✅ **브라우저 검증 완료** — 두 기능 전 구간 동작 |
| **DB 구축 (Supabase)** | ✅ **5개 테이블 적용·RLS 검증 완료** (아래 §4-2) |
| **프로토타입 ↔ DB 연동** | ✅ **실브라우저 기록 검증 완료** (이벤트·별점) |
| **공유 스키마 001~014 적용** | ✅ **전체 적용 + 버그 3건 발견·수정** (아래 §4-3) |
| 개인화 루프 (온보딩) | 🟡 온보딩 페이지 미착수 (핸드오프 문서 준비됨) |
| **미해결 기획 결정** | ⚠️ 대표님 확인 대기 (아래 §5) |

---

## 2. 확정된 기술 방향

### 1번: 개인화 예시 프롬프트 생성

```
[강의 오픈 전 · 1회성 · 오프라인 파이썬]
  강의 영상 → Whisper 전사(SRT) + 씬체인지 키프레임 OCR
           → Gemini 구조화 추출 {학습목표·키워드·화면프롬프트·레벨별예시·루브릭}
           → DB 저장
[런타임 · FE]
  회차 진입 → 저장된 예시 노출 (+ 개인화 변형은 phase 2)
```

- **비용 근거**: 영상 직접 분석이 아니라 SRT 기반. 이유는 "저렴해서"가 아니라 **신호 밀도** — 강의 내용은 음성에 있음. 단, 강사가 화면에만 띄운 프롬프트는 OCR로 보완 (실제로 회수됨, §4 참고).
- **개인화 ≠ SRT 단독**: SRT는 "회차 적합"만 줌. "개인화"의 입력은 2번 채점의 출력(부족 키워드)에서 나옴 → 두 기능은 한 파이프라인으로 설계.

### 2번: 수강생 영상 채점

- **모델**: Gemini 네이티브 영상 입력 (프레임당 258토큰 압축). Claude/GPT는 네이티브 영상 없어 프레임당 4~5배 토큰 → 구조적 탈락. 단 **프롬프트 텍스트 채점(영상 무관)** 은 Claude/GPT도 경쟁력 있음.
- **커스텀 FPS**: 회차별 차등. 정지 판정(비주얼 스타일)은 1 FPS, 시간축 판정(카메라 무브먼트·동작)은 4~8 FPS.
- **자체 호스팅(AWS Gemma/Qwen) 검토 결과**: 현재 볼륨에서 손익분기 15~50배 미달. API가 압도적. 단 데이터 반출 금지(B2G) 시 자체 호스팅이 비용이 아닌 *요건*이 됨 → VLM 호출을 얇은 어댑터 뒤에 두어 교체 가능하게.

---

## 3. PoC 실측 결과 (실제 강의 `2-3.mp4`, 23.9분)

| 단계 | 도구 | 결과 | 비용 |
|---|---|---|---|
| 전사 | faster-whisper `small` (로컬 CPU) | 한국어 실사용 가능, 845 세그먼트+타임코드, 13.6k토큰 | $0 |
| OCR v1 | opencv + easyocr | 시연 프롬프트 verbatim 회수, 단 커버 60%·20분 소요 | $0 |
| **OCR v2 (튜닝)** | +중앙크롭·응집도필터·중복제거 | **커버 98%**, 추출 36.7s, OCR 7.8분(v1 20분), 최종 136프레임 | $0 |
| Gemini 인제스트 (v2 OCR) | gemini-3.6-flash | 노이즈 정제 + 레벨별 예시 + 루브릭, 46k입력/1.8k출력, 20.9s | $0.083 |

**강의당 인제스트 총비용 ≈ $0.09** (60강의 = $5.3, 1회성)

### OCR 튜닝의 실측 페이오프: 회수 프롬프트 4개 → 10개
- v1(커버 60%): 시연 프롬프트 4개만 회수 (앞부분)
- v2(커버 98%): **10개 회수** — 뒤 15~20분 구간 6개 추가(역할부여→페르소나→페인포인트→디자인컨셉 흐름 완성).
- 커버리지 튜닝이 그대로 "회수 프롬프트 2.5배"로 직결. 레벨별 예시·루브릭 품질도 동반 상승.

### OCR 튜닝 핵심 (v1→v2)
- **문제**: 번인 한국어 자막이 매초 바뀌어 가짜 씬체인지 유발 → 과민 샘플링 → 14분에 프레임 상한, 뒤 40% 유실.
- **해결**: 레이아웃 고정 특성 이용해 **콘텐츠 중앙 밴드만 크롭**(상단 워터마크·하단 자막·웹캠 제거). 씬검출 정확해지고 OCR 대상 축소.
- **결과**: 커버리지 60%→98%, 추출 속도 대폭 개선.

---

## 4. 검증된 핵심 가설

**"강사가 음성으로 안 읽고 화면에만 띄운 예시 프롬프트가 회수되는가?" → YES**

실제 강의 74초 지점, 화면엔 이 프롬프트가 떠 있음:
> `Light blue oversized sweatshirt with 10 fur brooches... inspired by Takashi Murakami. High-fashion editorial style...`

같은 순간 음성(SRT)은: *"첫 번째 지금 보이시는 거는"*.

→ OCR 없이는 이 모범 프롬프트가 유실됨. 파이프라인 끝(Gemini)에서 **4만자 노이즈 OCR에서 실제 시연 프롬프트 4개만 정확히 추출**됨 (무라카미·향수·유튜브댓글분석·POV/HMW). "Gemini를 정제기로 쓴다"는 설계가 실증됨.

---

## 4-1. 프로토타입 (`/prototype`) — 브라우저 검증 완료 (2026-07-22)

프로덕션 `/session/[id]`는 **손대지 않음**. 세션 페이지를 복제해 프로토타입 전용 라우트로 운영(학생 모드 고정, 1회차).

**1번 — 개인화 예시 프롬프트**
- 실제 강의 영상 재생 (커스텀 컨트롤바, **시크바에 시연 프롬프트 마커** 10개, 클릭 시 해당 시점 이동)
- 영상 아래 **"시연 중" 컴팩트 스트립** — 시연 구간(다음 프롬프트 전 또는 최대 150초)에만 노출
- 좌측 **"예시 프롬프트" 패널(기존 UI 유지)** 에 구간별 **추천 2개** — 시연 프롬프트와 **다른 소재의 연습 변형**
- 추천 적용 → 생성 → **별점 평가 오버랩** → `localStorage(coming_prompt_ratings)` 저장 (추천 품질 피드백 루프)

**2번 — 영상 자동 채점**
- 생성하기 → `sd2.mp4`가 생성물로 등장(재생 가능) + **실제 Gemini 영상 채점** 표시
- **92점 A** / 프롬프트 충실도 35%→95 · 시각적 품질 25%→92 · 모션 자연스러움 20%→88 · 시간적 일관성 20%→90
- 강점·개선점·**아티팩트 지적**(액션 전환 시 검·손 프레임 뭉개짐)까지 실제 영상 분석 결과
- 영상이 고정이라 **채점을 1회 사전 계산**해 저장 → 클릭 시 즉시 표시, 반복 API 비용 0

**검증 방식**: chrome-devtools MCP로 실제 브라우저 구동 — 재생·구간 전환·추천 적용·생성·채점·별점 저장까지 전 구간 확인.

**설계 변경**: 생성 전/직후 프롬프트 피드백 단계는 **제외**(비용 대비 효용). 채점은 **제출 시 Vision 채점 하나**로 단순화.

---

## 4-2. DB 구축 + 프로토타입 연동 (2026-07-23 완료)

### 적용된 스키마 — `supabase/migrations/015_analysis_personalization.sql`

다른 업체가 공유 스키마(`courses`/`sessions`/`users_profile` 등)를 아직 만들지 않은 상태라
**단독 적용 가능**하도록 설계: 사용자 참조는 Supabase 내장 `auth.users`만 쓰고,
회차·생성잡은 FK 없는 느슨한 UUID, RLS는 다른 팀 헬퍼에 의존하지 않는 `auth.uid()` 소유 기반.

| 테이블 | 역할 | RLS 정책 |
|---|---|---|
| `session_ingest` | 회차별 인제스트 산출물(JSONB) | 로그인 사용자 조회, 쓰기는 service_role |
| `prompt_feedback` | 추천 프롬프트 별점 | 본인 것만 (ALL) |
| `video_gradings` | AI 채점 → 교육자 확정 | 본인 조회 |
| `user_persona` | 개인화 프로필 (seed/derived) | 본인만 (ALL) |
| `learning_events` | 강의실 원시 이벤트 (11종) | 본인 삽입/조회 |

**검증 결과**: 5개 테이블 RLS 활성 + 정책 5개 정상. 보안 advisor **경고 0건**.
(사전 존재하던 `rls_auto_enable()` SECURITY DEFINER 경고는 `REVOKE EXECUTE ... FROM PUBLIC`으로 해소.
 이 함수는 신규 테이블에 RLS를 자동으로 켜주는 안전장치라 유지하되 권한만 조임 — 동작 재확인 완료.)

### 인제스트 적재

`2-3.ingest.json`(11KB)을 `session_ingest`에 적재 (`session_id = 00000000-0000-4000-8000-000000000023`).
왕복 무결성 확인: 학습목표 4 · 핵심개념 7 · 시연 프롬프트 10(각 추천 2개, 총 20) · 루브릭 가중치 합 100 · 한국어 원문 보존.

### 프론트 연동 — `frontend/lib/analytics.ts`

**앱 공용 `lib/supabase.ts`와 의도적으로 분리한 별도 클라이언트.**
공용 쪽 `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY`를 채우면 `isSupabaseConfigured`가 켜지면서
데모 로그인이 실인증으로 전환되는데, 공유 `users_profile`이 아직 없어 로그인이 깨진다.
그래서 `NEXT_PUBLIC_COMING_ANALYTICS_*` 라는 **다른 이름**을 쓴다. (이 제약은 공유 스키마가 생기면 해소)

- **인증**: Supabase **익명 로그인**으로 실제 `auth.uid()` 확보 → RLS를 우회하지 않고 정공법으로 통과.
  세션은 localStorage 유지 → 같은 브라우저 = 같은 사용자로 누적. (Management API로 익명 로그인 활성화함)
- **fail-soft**: 수집 실패가 수업을 막지 않도록 모든 함수가 throw하지 않음.

수집 지점 6곳: `dwell`(구간 체류) · `apply_recommendation` · `generate` · `model_select` · `rate` · 별점(`prompt_feedback`).

### 실브라우저 검증 (`/prototype`)

| 검증 | 결과 |
|---|---|
| 익명 세션 → RLS 통과 → 기록 | ✅ |
| 타인 `user_id`로 삽입 시도 | ✅ 차단 (42501) |
| 체류시간 | ✅ `{section: "10:41", seconds: 13}` |
| 추천 적용 → 생성 → 별점 | ✅ 모두 `timecode: "16:19"`로 연결, `from_recommendation: true` |

> 참고: 목업 생성은 `page.tsx`에 **20% 랜덤 실패**(`Math.random() > 0.2`)가 내장돼 있어
> 간헐적으로 "생성 실패·크레딧 환불"이 뜬다. 연동 문제가 아니라 데모 연출이다.

---

## 4-3. 공유 스키마(001~014) 적용 + 버그 수정 (2026-07-23)

**회원 테이블은 새로 만들 필요가 없었다.** `supabase/migrations/001~014` 가 이미 존재했고
(7/21자, 31개 테이블: users_profile·institutions·courses·sessions·enrollments·ai_jobs·
크레딧/결제·라이브·평가·갤러리·알림·리뷰), **라이브 DB에 적용만 안 된 상태**였다.

우리 015(5개 테이블)와 **겹침 0건** — standalone 설계가 결과적으로 정확했다.
`get_my_role()`·`get_my_institution_id()` 도 001~014에 있어, 015 하단 주석의
강사/관리자 정책을 이제 활성화할 수 있다. `sessions`·`ai_jobs` 도 실재하므로
느슨한 UUID 참조를 진짜 FK로 승격 가능하다.

### 적용 과정에서 발견·수정한 버그 3건

한 번도 적용된 적 없는 마이그레이션이라 잠재 버그가 그대로 남아 있었다.
셋 다 **회원가입을 전면 차단**하는 수준이었다.

| # | 위치 | 증상 | 원인 | 수정 |
|---|---|---|---|---|
| 1 | `014:94` | `syntax error at or near "DO"` | `JOIN LATERAL` 에 조인조건 `ON TRUE` 누락 → Postgres 가 뒤의 `ON CONFLICT` 의 `ON` 을 조인조건으로 파싱 | 014에 `ON TRUE` 추가 |
| 2 | `001:529`/`012:11` | **모든 회원가입** 실패 (`Database error saving new user`) | `handle_new_user()` 가 SECURITY DEFINER 인데 `SET search_path` 없음. GoTrue 는 `supabase_auth_admin`(search_path=`auth`)으로 실행되는데 `user_role`·`user_status` 타입은 `public` 에 있어 미해석 | **016** — `SET search_path = public, auth` + 타입 스키마 한정 |
| 3 | `006:171` | 크레딧 적립 전부 실패 → 가입 보너스가 걸려 가입 실패 | `notify_credit_received()` 가 enum 에 없는 값과 비교 (`purchase`·`allocation`·`reward`). enum 실제 값은 `recharge,usage,refund,allocate,recall,bonus,expire` | **017** — 실제 라벨로 교정 (`recharge`·`bonus`·`allocate`·`refund`) |

> 2번은 `postgres` 역할로 테스트하면 통과한다(search_path 에 public 포함). 반드시
> **실제 가입 경로(GoTrue)** 로 확인해야 재현된다. 진단은 트리거 함수를 no-op 으로
> 바꿔 이분법으로 확정했다.

enum 불일치는 전체 마이그레이션을 대조 스캔해 **006 한 건만** 실제 문제임을 확인했다
(004·007의 `status` 는 `TEXT + CHECK` 라 무관, 005의 `enrollment_status` 는 값이 유효).

### 016 — 익명 사용자 지원 (수집 유지 + 승격 경로)

- 익명 사용자는 `users_profile` 을 만들지 않는다. 아직 '회원'이 아니고,
  우리 5개 테이블은 `users_profile` 이 아니라 `auth.users` 를 직접 참조하므로 수집은 정상 동작한다.
- **익명 → 정식 계정 승격 시 프로필 생성** (`on_auth_user_upgraded`, AFTER UPDATE OF email).
  Supabase 승격은 `auth.users` 의 UPDATE 라 기존 INSERT 트리거가 안 걸린다.
  `auth.users.id` 가 유지되므로 **익명 기간에 쌓은 이벤트·별점·페르소나가 그대로 승계**된다.

### 검증 결과

| 항목 | 결과 |
|---|---|
| 001~014 적용 | ✅ 14개 전부 (31개 테이블) |
| 일반 이메일 회원가입 | ✅ 프로필 1건 + 크레딧원장 1건 생성 |
| 익명 로그인 | ✅ 복구 |
| 익명 사용자의 프로필 | ✅ 미생성 (설계대로) |
| 프로토타입 수집 | ✅ 공유 스키마 적용 후에도 정상 |

---

## 4-4. 담당 3영역 실연동 (2026-07-23)

**목업 유지 영역은 하나도 건드리지 않았다.** `analytics.ts` 가 별도 클라이언트 + 별도 env 이름을
쓰므로 `isSupabaseConfigured` 는 계속 false다 → AI 모델 조회·갤러리·커리큘럼·생성(MiniMax 외)·
데모 로그인은 전부 그대로다.

| 담당 영역 | 구현 | 저장 위치 |
|---|---|---|
| ① 회원 초기 리드 | `/onboarding` 완료·건너뛰기 시 적재 | `user_persona.seed` |
| ② 세션 이벤트 | 체류·추천적용·생성·모델선택·별점 | `learning_events` · `prompt_feedback` |
| ③ 생성 영상 평가 | **MiniMax 실영상만 Gemini 실채점** | `video_gradings` |

### 신원: 데모 계정별 익명 세션 분리

데모 로그인은 `user.id` 가 항상 `'demo'` 라 **email 로 구분**한다. `setAnalyticsIdentity(email)` 이
Supabase 익명 세션의 `storageKey` 를 계정별로 나눠 **데모 계정 = DB 사용자 1:1** 이 된다.
안 나누면 `user_persona`(PK=user_id)가 학생을 바꿔가며 온보딩할 때 같은 행을 덮어쓴다.

### 채점: 왜 서버 라우트인가 (`app/api/grade/route.ts`)

1. `GEMINI_API_KEY` 가 서버 전용이고,
2. `video_gradings` 는 015 설계상 **쓰기 정책이 없다**(학생이 자기 점수를 위조하지 못하게).
   → service_role 로만 기록 가능.

채점이 10~15초 걸리므로 **결과를 먼저 띄우고 점수를 나중에 채운다**(`gradingPending` → "채점 중…" →
실채점 배지). 실채점 실패 시 기존 목업 채점표로 폴백해 데모가 비어 보이지 않게 했다.
목업 모델(Sora 등)은 채점할 실체가 없어 기존 목업 평가를 그대로 쓴다.

### 검증 (실측)

| 항목 | 결과 |
|---|---|
| 실채점 (sd2.mp4) | ✅ A/92~93점 · **13초** · 토큰 3,846/466 → **약 $0.009/건** |
| `video_gradings` 기록 | ✅ 4축 + 피드백 4건, `ai_model=gemini-3.6-flash` |
| 온보딩 → `user_persona.seed` | ✅ 적재 |
| 계정별 분리 | ✅ 학생A(video/cinematic/hobby) · 학생B(ads_shorts/vintage/education) **별도 행** |
| 온보딩 ↔ 세션 이벤트 연결 | ✅ 같은 `user_id` 로 조인됨 |
| 프로덕션 빌드 | ✅ `/api/grade` 포함 전 라우트 |

> 서버 전용 키: `frontend/.env` 의 `SUPABASE_SERVICE_ROLE_KEY` (`NEXT_PUBLIC_` 아님 → 브라우저 번들 제외).

---

## 5. ⚠️ 미해결 기획 결정 (대표님 확인 필요)

1. **결과물 완성도 40% vs 의도 일치도 40%**
   - PDF: "결과물 완성도 40% = 기술적 품질·해상도·일관성 (Vision AI)"
   - 문제 제기: 학생이 완벽히 써도 모델이 손가락 6개를 그리면 감점 → *학생이 통제 못 하는* 축. 재현성도 없음(같은 프롬프트 두 번 = 다른 점수).
   - 대안: "의도 일치도 = 프롬프트가 요구한 게 실제 영상에 담겼나" → 학생 통제 가능, 교육적으로 방어됨.
   - **이 결정이 루브릭 스키마(1번 출력)와 채점 출력(2번)을 동시에 좌우.**

2. **"마진 남는 모델 우선 선택"** (PDF 명시)
   - 학생 이익과 충돌 소지. 권고: 규칙으로 넣되 **"왜 이 모델인지" 근거를 UI에 노출**해 투명한 추천으로.

3. **제너럴 기준점 + 개인화 기준점 믹스 비율** — 실측 A/B 대상. 프로토타입은 단순 가중치 규칙으로 시작.

---

## 6. 아키텍처 갭 (구현 전 정리 필요)

| 갭 | 현황 | 조치 |
|---|---|---|
| 채점할 실제 영상 없음 | 생성이 목업(SVG 플레이스홀더) | 픽스처 영상으로 개발 하네스 |
| 채점 표면 이원화 | 스튜디오 실습(`generatePracticeEvaluation`, 클라 사이드) vs 평가(`assessment_submissions`, DB) | MVP 표면 결정 필요 |
| 1번 출력 스키마 없음 | `sessions`에 루브릭·예시 컬럼 없음, 목업만 | `generated_content JSONB` 컬럼/테이블 신설 + 강사 승인 플래그 |
| 2번 출력 스키마 부족 | `assessment_submissions.score` 단일 int | AI점수↔강사확정 분리, 축별 JSONB, 영상ref, pending상태 추가 |
| 컴퓨트 위치 | Edge Functions는 Deno | 전사·OCR = 오프라인 파이썬 스크립트. Gemini 채점 = `ai-grade` Edge Function(Deno, HTTP) |

---

## 7. 구현 로드맵

### A. PoC가 여는 것 (Gemini 실연동)
- [x] 1번 인제스트 파이프라인 PoC
- [x] OCR 프로덕션 튜닝 (커버 60%→98%, OCR 20분→7.8분, 회수 프롬프트 4→10)
- [ ] 2번 채점 실측 (픽스처 영상 + 루브릭 → 정량점수+정성피드백)
- [ ] `ai-grade` Edge Function

### B. DB 없이 지금 프로토타입 (개인화 루프)
> **"스타일 선호도 페이지 하나면 되나?" → 아니요.** 루프가 돌아야 개인화가 *보임*.

- [ ] **① 온보딩 페이지** (넷플릭스식 스타일 선호도, Skip 가능) ← *별도 핸드오프 진행 중* (`HANDOFF-onboarding-page.md`)
- [ ] `PersonalizationProvider` (프로필 `{시드,이력[],파생}` · localStorage · AuthProvider 복제)
- [ ] ② 스튜디오 계측 (생성 시 모델·파라미터·프롬프트·재생성 push)
- [ ] ③ 스튜디오 소비 (예시 패널·모델픽커가 프로필 읽어 재정렬·주석)
- [ ] ④ 별점 위젯 (추천 품질 평가 → 프로필 기록)

### C. 지금은 미루는 것
- 합성데이터(페블러스 뉴로-심볼릭) — 설명만, 구현 안 함
- User2Vec / Two-Tower / Contextual Bandits — 규칙 기반으로 대체
- 채점 영속·강사 확정 이력 — DB 필요
- 학습 경로 추천 — 이력 축적 후 phase 2

---

## 8. 환경·키·모델 메모

- **Gemini 키**: `frontend/.env` 의 `GEMINI_API_KEY` (신형 `AQ.` Auth key, gitignore됨). `x-goog-api-key` 헤더로 호출.
- **모델**: `gemini-2.5-flash`는 이 계정 막힘(404). **`gemini-3.6-flash` 사용** ($1.50/$7.50 per 1M). 아티팩트 비교표는 2.5-flash($0.30/$2.50) 기준이라 **실단가 5배 상향** 필요 (그래도 사소).
- **결제**: 선불 크레딧 ₩55,000 (Prepay). 잔액 0시 전 프로젝트 API 키 동시 정지 → auto-reload 권장.
- **로컬 도구**: no brew. `scripts/ingest/.venv`(py3.9) + faster-whisper·opencv·easyocr. ffmpeg 불필요(PyAV·opencv 내장 디코더).
- **Supabase**: 프로젝트 `xiibdpmwvjeirpgtzwus`. 루트 `.env`에 `SUPABASE_ACCESS_TOKEN`(PAT, 계정 전체 권한)·`SUPABASE_PROJECT_ID`.
  프론트는 `frontend/.env`의 `NEXT_PUBLIC_COMING_ANALYTICS_URL/KEY`(publishable) + `NEXT_PUBLIC_COMING_SESSION_ID`.
  **주의**: `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY`(공용 이름)는 비워둘 것 — 채우면 데모 로그인이 깨진다(§4-2).
- **gitignore**: repo 루트가 상위 `nculture/`이고 그 `.gitignore`의 `.env*`가 하위 전체를 커버. 토큰·영상·인제스트 중간산출물 모두 제외 확인.

### ⚠️ Vercel 배포 함정 — `NEXT_PUBLIC_*` 는 반드시 **plain 타입**으로 등록할 것

`vercel env add` 로 넣으면 `encrypted` 타입이 되는데, **`vercel pull` 이 encrypted 값을
`[SENSITIVE]` 플레이스홀더로만 내려준다.** 서버 전용 변수는 Vercel 이 런타임에 실제 값을
주입하므로 문제가 없지만, `NEXT_PUBLIC_*` 는 **빌드 타임에 번들로 구워져야** 하므로
플레이스홀더가 들어가 기능이 조용히 죽는다(에러도 안 난다).

증상: 배포본에서 수집이 전혀 안 되는데 콘솔은 깨끗함. `/api/grade` 같은 서버 라우트는 정상 동작.

해결: `NEXT_PUBLIC_*` 는 Vercel API 로 `type: "plain"` 으로 등록한다. 어차피 브라우저 번들에
실리는 공개값이라 숨길 이유도 없다. 서버 비밀(`SUPABASE_SERVICE_ROLE_KEY`·`GEMINI_API_KEY`)은
`encrypted` 로 두면 된다.

확인법: 리포 루트에서 `vercel pull --environment=preview` 후
`.vercel/.env.preview.local` 을 열어 값이 `[SENSITIVE]` 인지 실제 값인지 본다.

## 9. 스크립트·산출물 위치

| 위치 | 내용 |
|---|---|
| `scripts/ingest/ingest_lecture.py` | **오케스트레이터** — 영상 1개 → 전 파이프라인 (권장 진입점) |
| `scripts/ingest/transcribe.py` · `keyframes_ocr_v2.py` | 전사 / 키프레임+OCR (오케스트레이터가 서브프로세스로 호출) |
| `scripts/ingest/grade_video.py` | 생성 영상 Gemini 채점 |
| `scripts/ingest/README.md` | 실행법·옵션·실측치 |
| `docs/samples/` | 실제 강의 산출물 샘플 (`2-3.srt` · `2-3.ocr_v2.txt` · `2-3.ingest.json`) |
| `frontend/lib/ingest/` | 앱이 실제로 쓰는 `2-3.ingest.json` · `sd2.grade.json` |
| `frontend/lib/analytics.ts` | 분석/개인화 DB 클라이언트 |

## 10. 다음 스텝 (권장 순서)
1. **대표님 결정 3건**(§5) 받기 — 특히 채점 축 정의 (가장 오래 막혀 있는 항목)
2. 온보딩 페이지 착수 → `user_persona.seed` 적재 (핸드오프: `docs/HANDOFF-onboarding-page.md`)
3. 채점 결과를 `video_gradings`에 적재 (지금은 `sd2.grade.json` 목업 표시)
4. 인제스트를 번들 JSON import → `session_ingest` 조회로 전환 (`fetchIngest()` 준비돼 있음)
5. 축적된 `learning_events`로 `user_persona.derived` 계산 (개인화 1차 루프)
6. 015 하단 주석의 **강사/관리자 RLS 정책 활성화** — `get_my_role()` 이 이제 존재하므로 바로 가능
7. 느슨한 UUID 참조를 진짜 FK로 승격 (`session_ingest.session_id → sessions.id`, `video_gradings.ai_job_id → ai_jobs.id`)
8. 공용 인증 전환: `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` 를 채우고 데모 모드 → 실 로그인.
   전제로 `users_profile` 에 실제 계정·역할 시드가 필요하고, 그 시점에 `/prototype` 의
   데모 로그인 의존(§4-2)을 정리해야 한다. **대표님 비교 데모가 끝난 뒤 진행 권장.**
