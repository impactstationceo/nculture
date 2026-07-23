-- ============================================================
-- Coming AI · 분석/개인화 레이어 (우리 팀 관할) — 독립 적용본
-- 015_analysis_personalization.sql
--
-- 범위: (1) 영상분석→프롬프트추천  (2) 수강생 영상채점
--       (3) 개인화 데이터  (4) 강의실 이벤트 수집
--
-- 독립성: 다른 업체(courses/sessions/ai_jobs/users_profile 등)가 아직 DB를
--   안 만든 상태에서도 '단독 적용' 가능하도록 설계.
--   - 사용자 참조 = Supabase 내장 auth.users (항상 존재)
--   - 회차/생성잡 참조 = FK 없는 UUID (다른 팀 테이블이 생기면 FK 추가 가능)
--   - RLS = auth.uid() 소유 기반 (다른 팀 헬퍼/테이블에 무의존)
--   - PK = gen_random_uuid() (PG 내장, 확장 불필요)
-- ============================================================

-- ── ENUM ──────────────────────────────────────────────────
CREATE TYPE ingest_status AS ENUM ('draft', 'approved');          -- 강사 검수 게이트
CREATE TYPE grading_status AS ENUM ('ai_scored', 'confirmed');    -- AI채점 → 교육자 확정
CREATE TYPE learning_event_type AS ENUM (
  'dwell',                -- 강의 구간 체류 (payload: {section, seconds})
  'prompt_input',         -- 프롬프트 입력/수정 (payload: {prompt, length})
  'model_select',         -- 모델 선택 (payload: {service, tier})
  'style_select',         -- 스타일 선택 (payload: {style})
  'param_select',         -- 파라미터 선택 (payload: {duration, resolution, audio})
  'generate',             -- 생성 (payload: {ai_job_id, credits})
  'regenerate',           -- 재생성 (만족도 지표)
  'save',                 -- 결과물 저장
  'publish',              -- 갤러리 공개
  'apply_recommendation', -- 추천 프롬프트 적용 (payload: {timecode, prompt})
  'rate'                  -- 별점 평가
);

-- ============================================================
-- (1) 영상분석 → 프롬프트 추천 : 회차별 인제스트 산출물
--     ingest_lecture.py 결과(JSONB)를 회차에 저장. 강사 검수 후 학생 노출.
--     session_id: 다른 팀 sessions 테이블을 느슨히 참조(FK 없음).
-- ============================================================
CREATE TABLE session_ingest (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL,                 -- 회차 (외부 sessions.id, FK 없음)
  session_title TEXT,
  -- 전체 인제스트 JSON: learning_objectives · key_concepts ·
  -- on_screen_prompts[{timecode,prompt,lang,recommended[]}] · example_prompts · rubric
  data          JSONB NOT NULL,
  source_video_url TEXT,
  model         VARCHAR(50),                   -- 추출에 쓴 Gemini 모델
  status        ingest_status DEFAULT 'draft',
  approved_by   UUID,                          -- 승인 강사 (auth.users.id)
  approved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id)                            -- 회차당 1개 (버전 필요 시 확장)
);
CREATE INDEX idx_session_ingest_session ON session_ingest(session_id);

-- 추천 프롬프트 품질 평가 (별점) — 추천개선/개인화 피드백 루프
CREATE TABLE prompt_feedback (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID,                             -- 회차 (FK 없음)
  timecode   VARCHAR(12),                      -- 어느 시연 구간 추천인지
  prompt     TEXT NOT NULL,                    -- 평가된 추천 프롬프트
  stars      SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_prompt_feedback_user ON prompt_feedback(user_id);

-- ============================================================
-- (2) 수강생 영상 채점 : AI 추천점수 → 교육자 최종확정 (하이브리드)
--     ai_job_id: 다른 팀 ai_jobs(생성잡)를 느슨히 참조(FK 없음).
--                생성(MiniMax 등)이 그쪽에서 채워지면 그 id를 여기 기록.
-- ============================================================
CREATE TABLE video_gradings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id  UUID,                            -- 회차 (FK 없음)
  ai_job_id   UUID,                            -- 생성 잡 (외부 ai_jobs.id, FK 없음)
  video_url   TEXT,                            -- 채점 대상 영상
  prompt      TEXT,                            -- 학생 프롬프트
  -- AI 채점 (정량 4축 + 피드백)
  ai_score    INT,
  ai_grade    VARCHAR(2),
  ai_criteria JSONB,                           -- [{axis, weight, score}]
  ai_feedback JSONB,                           -- [{type, text}]
  ai_model    VARCHAR(50),
  -- 교육자 최종 확정
  confirmed_score    INT,
  confirmed_feedback TEXT,
  confirmed_by       UUID,                     -- 확정 강사 (auth.users.id)
  confirmed_at       TIMESTAMPTZ,
  status      grading_status DEFAULT 'ai_scored',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_video_gradings_user ON video_gradings(user_id);
CREATE INDEX idx_video_gradings_session ON video_gradings(session_id);

-- ============================================================
-- (3) 개인화 데이터 : 사용자당 1개 프로필
--     seed = 온보딩 스타일 선호(coming_persona_seed)
--     derived = 이벤트로 축적·계산된 선호 (자주 쓰는 모델/스타일/부족 키워드 등)
-- ============================================================
CREATE TABLE user_persona (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  seed       JSONB DEFAULT '{}',
  derived    JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- (4) 강의실 이벤트 수집 : append-only 원시 신호 로그 (고volume)
--     체류시간·프롬프트입력·모델/스타일/파라미터 선택·재생성·저장·공개 등
--     -> 개인화 학습의 입력. BIGINT identity (대량 삽입 최적화).
-- ============================================================
CREATE TABLE learning_events (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID,                             -- 회차 (FK 없음)
  event_type learning_event_type NOT NULL,
  payload    JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_learning_events_user_time ON learning_events(user_id, created_at DESC);
CREATE INDEX idx_learning_events_type ON learning_events(event_type);

-- ============================================================
-- RLS — auth.uid() 소유 기반 (다른 팀 헬퍼/역할테이블 무의존)
--   · 학생: 본인 데이터만 CRUD
--   · session_ingest: 로그인 사용자 조회, 쓰기는 배치(service_role)만
--   · 배치·Edge Function·강사확정은 service_role 이 RLS 우회
--   · 강사/관리자 역할 기반 정책은 공유 user/role 스키마 확정 후 추가(하단 주석)
-- ============================================================
ALTER TABLE session_ingest   ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_feedback  ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_gradings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_persona     ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_events  ENABLE ROW LEVEL SECURITY;

-- session_ingest : 로그인 사용자 조회 (쓰기 정책 없음 → service_role 만 기록)
CREATE POLICY session_ingest_read ON session_ingest
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- prompt_feedback : 본인 것만
CREATE POLICY prompt_feedback_owner ON prompt_feedback
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- video_gradings : 학생은 본인 조회 (AI기록·강사확정은 service_role)
CREATE POLICY video_gradings_owner_read ON video_gradings
  FOR SELECT USING (user_id = auth.uid());

-- user_persona : 본인만
CREATE POLICY user_persona_owner ON user_persona
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- learning_events : 본인 삽입/조회
CREATE POLICY learning_events_owner ON learning_events
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── 공유 user/role 스키마(users_profile 등)가 생기면 추가할 강사/관리자 정책 ──
-- CREATE POLICY session_ingest_staff_write ON session_ingest
--   FOR ALL USING (get_my_role() IN ('instructor','institution_admin','platform_admin'));
-- CREATE POLICY video_gradings_staff ON video_gradings
--   FOR ALL USING (get_my_role() IN ('instructor','institution_admin','platform_admin'));
-- CREATE POLICY prompt_feedback_staff_read ON prompt_feedback
--   FOR SELECT USING (get_my_role() IN ('instructor','institution_admin','platform_admin'));
-- CREATE POLICY learning_events_staff_read ON learning_events
--   FOR SELECT USING (get_my_role() IN ('instructor','institution_admin','platform_admin'));

-- ============================================================
-- (5) 합성 데이터 : 미포함 (phase 2)
--   페블러스 뉴로-심볼릭 의존 + 실데이터 축적 후. learning_events 가 쌓이면
--   synthetic_samples(source_type, based_on_event_id, payload) 로 확장 예정.
-- ============================================================
