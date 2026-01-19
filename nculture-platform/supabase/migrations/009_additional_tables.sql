-- ============================================
-- 009: 추가 테이블 (AI 서비스, 평가, 기관 크레딧)
-- ============================================

-- ============================================
-- 1. AI_SERVICES (AI 서비스 카탈로그)
-- ============================================

CREATE TABLE IF NOT EXISTS ai_services (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL, -- 'video', 'image', 'text'
  description TEXT,
  icon VARCHAR(10),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. AI_SERVICE_TIERS (AI 서비스 티어/요금제)
-- ============================================

CREATE TABLE IF NOT EXISTS ai_service_tiers (
  id VARCHAR(50) PRIMARY KEY,
  service_id VARCHAR(50) NOT NULL REFERENCES ai_services(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  specs JSONB DEFAULT '{}', -- resolution, duration, audio 등
  pricing_multiplier DECIMAL(3,2) DEFAULT 1.0,
  pricing_base INT DEFAULT 10,
  max_resolution VARCHAR(20),
  max_duration_sec INT,
  audio_supported BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_service_tiers_service ON ai_service_tiers(service_id);

-- ============================================
-- 3. INSTITUTION_CREDITS (기관 크레딧 풀)
-- ============================================

CREATE TABLE IF NOT EXISTS institution_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  credit_pool INT DEFAULT 0,
  used_credits INT DEFAULT 0,
  settings JSONB DEFAULT '{
    "requireClassApproval": true,
    "defaultMemberCredits": 100,
    "monthlyLimitPerMember": 500
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(institution_id)
);

CREATE INDEX idx_institution_credits_institution ON institution_credits(institution_id);

-- ============================================
-- 4. MEMBER_CREDIT_ALLOCATIONS (멤버별 크레딧 배정)
-- ============================================

CREATE TABLE IF NOT EXISTS member_credit_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  allocated_credits INT DEFAULT 0,
  used_credits INT DEFAULT 0,
  monthly_limit INT,
  allocated_by UUID REFERENCES users_profile(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(institution_id, user_id)
);

CREATE INDEX idx_member_allocations_institution ON member_credit_allocations(institution_id);
CREATE INDEX idx_member_allocations_user ON member_credit_allocations(user_id);

-- ============================================
-- 5. ASSESSMENTS (평가/시험)
-- ============================================

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  duration_minutes INT DEFAULT 60,
  max_attempts INT DEFAULT 1,
  passing_score INT DEFAULT 70,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES users_profile(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessments_course ON assessments(course_id);
CREATE INDEX idx_assessments_session ON assessments(session_id);

-- ============================================
-- 6. ASSESSMENT_SUBMISSIONS (평가 제출)
-- ============================================

CREATE TYPE submission_status AS ENUM ('in_progress', 'submitted', 'graded');

CREATE TABLE IF NOT EXISTS assessment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  status submission_status DEFAULT 'in_progress',
  
  -- 작업 내용
  prompt_count INT DEFAULT 0,
  generation_count INT DEFAULT 0,
  content JSONB DEFAULT '{}', -- 프롬프트, 생성물 등
  
  -- 점수
  score INT,
  feedback TEXT,
  graded_by UUID REFERENCES users_profile(id),
  graded_at TIMESTAMPTZ,
  
  -- 이상 행동 감지
  anomalies JSONB DEFAULT '[]', -- ['long_idle', 'rapid_submit', 'away']
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  
  UNIQUE(assessment_id, user_id)
);

CREATE INDEX idx_submissions_assessment ON assessment_submissions(assessment_id);
CREATE INDEX idx_submissions_user ON assessment_submissions(user_id);
CREATE INDEX idx_submissions_status ON assessment_submissions(status);

-- ============================================
-- 7. ASSESSMENT_ACTIVITIES (실시간 활동 로그)
-- ============================================

CREATE TABLE IF NOT EXISTS assessment_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES assessment_submissions(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'prompt', 'generation', 'focus_lost', 'focus_gained'
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_submission ON assessment_activities(submission_id);
CREATE INDEX idx_activities_created ON assessment_activities(created_at DESC);

-- ============================================
-- 8. COURSE_APPROVALS (클래스 승인)
-- ============================================

CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approval_note TEXT,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users_profile(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- ============================================
-- 9. USER_SESSIONS (세션 기반 학습 데이터)
-- ============================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  
  -- 프롬프트 히스토리
  prompts JSONB DEFAULT '[]',
  generations JSONB DEFAULT '[]',
  
  -- 진행 상태
  current_step INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  
  -- AI 사용량
  credits_used INT DEFAULT 0,
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session ON user_sessions(session_id);

-- ============================================
-- 10. MEDIA_GALLERY (생성물 갤러리)
-- ============================================

CREATE TABLE IF NOT EXISTS media_gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  
  media_type VARCHAR(20) NOT NULL, -- 'image', 'video'
  title VARCHAR(255),
  prompt TEXT,
  
  -- AI 정보
  ai_service_id VARCHAR(50) REFERENCES ai_services(id),
  ai_tier_id VARCHAR(50),
  
  -- 파일 정보
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size_bytes BIGINT,
  duration_seconds FLOAT, -- 영상용
  resolution VARCHAR(20),
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  
  -- 공개 설정
  is_public BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- 통계
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_gallery_user ON media_gallery(user_id);
CREATE INDEX idx_media_gallery_type ON media_gallery(media_type);
CREATE INDEX idx_media_gallery_public ON media_gallery(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_media_gallery_featured ON media_gallery(is_featured) WHERE is_featured = TRUE;

-- ============================================
-- SEED: AI 서비스 기본 데이터
-- ============================================

INSERT INTO ai_services (id, name, category, description, icon, sort_order) VALUES
  ('sora', 'OpenAI Sora', 'video', '사운드 포함 멀티샷 영상 생성', '🎬', 1),
  ('veo', 'Google Veo', 'video', '정밀한 사운드 제어 영상', '🎯', 2),
  ('kling', 'Kling', 'video', '완벽한 모션과 고급 영상 제어', '⚡', 3),
  ('minimax', 'Minimax Hailuo', 'video', '고다이나믹, VFX 지원, 가장 빠르고 저렴함', '🚀', 4),
  ('dalle', 'DALL·E 3', 'image', '자연어 이해력이 뛰어난 이미지 생성', '🎨', 5),
  ('midjourney', 'Midjourney', 'image', '예술적이고 창의적인 이미지 생성', '✨', 6),
  ('stable-diffusion', 'Stable Diffusion 3', 'image', '빠르고 다양한 스타일 지원', '🖼️', 7),
  ('flux', 'Flux', 'image', '텍스트 렌더링과 구도에 강점', '⚡', 8),
  ('ideogram', 'Ideogram', 'image', '텍스트가 포함된 이미지에 특화', '📝', 9),
  ('gpt4', 'GPT-4o', 'text', '가장 강력한 멀티모달 언어 모델', '🧠', 10),
  ('claude', 'Claude 3.5', 'text', '안전하고 유용한 AI 어시스턴트', '🤖', 11),
  ('gemini', 'Gemini Pro', 'text', '구글의 최신 멀티모달 AI', '💎', 12),
  ('llama', 'Llama 3.1', 'text', '오픈소스 기반 강력한 모델', '🦙', 13),
  ('mistral', 'Mistral Large', 'text', '유럽 기반 고성능 모델', '🌬️', 14)
ON CONFLICT (id) DO NOTHING;

INSERT INTO ai_service_tiers (id, service_id, name, description, specs, pricing_multiplier, pricing_base, max_resolution, max_duration_sec, audio_supported, sort_order) VALUES
  -- Sora
  ('sora-2', 'sora', 'Sora 2', '표준 품질', '{"resolution": "720p", "duration": "5-10초", "audio": true}', 1.0, 20, '720p', 10, true, 1),
  ('sora-2-pro', 'sora', 'Sora 2 Pro', '고품질', '{"resolution": "1080p", "duration": "5-15초", "audio": true}', 1.5, 30, '1080p', 15, true, 2),
  ('sora-2-max', 'sora', 'Sora 2 Max', '최고 품질', '{"resolution": "4K", "duration": "5-20초", "audio": true}', 2.0, 40, '4K', 20, true, 3),
  -- Veo
  ('veo-lite', 'veo', 'Veo Lite', '빠른 생성', '{"resolution": "720p", "duration": "3-8초", "audio": false}', 0.8, 16, '720p', 8, false, 1),
  ('veo-standard', 'veo', 'Veo Standard', '균형 잡힌 품질', '{"resolution": "1080p", "duration": "4-12초", "audio": true}', 1.2, 24, '1080p', 12, true, 2),
  -- Kling
  ('kling-v1', 'kling', 'Kling v1.0', '표준 모션', '{"resolution": "1080p", "duration": "5-10초", "audio": false}', 1.0, 20, '1080p', 10, false, 1),
  ('kling-v2', 'kling', 'Kling v2.0', '향상된 모션', '{"resolution": "1080p", "duration": "5-15초", "audio": true}', 1.3, 26, '1080p', 15, true, 2),
  -- Minimax
  ('minimax-fast', 'minimax', '패스트', '빠른 생성', '{"resolution": "720p", "duration": "3-6초", "audio": false}', 0.7, 14, '720p', 6, false, 1),
  ('minimax-quality', 'minimax', '퀄리티', '최고 품질', '{"resolution": "1080p", "duration": "5-12초", "audio": true}', 1.0, 20, '1080p', 12, true, 2),
  -- DALL-E
  ('dalle-standard', 'dalle', '스탠다드', '표준 품질', '{"resolution": "1024x1024", "style": "자연스러운"}', 1.0, 8, NULL, NULL, false, 1),
  ('dalle-hd', 'dalle', 'HD', '고해상도', '{"resolution": "1792x1024", "style": "선명한"}', 1.5, 12, NULL, NULL, false, 2),
  -- Midjourney
  ('mj-v6', 'midjourney', 'v6.0', '최신 버전', '{"resolution": "1024x1024", "style": "예술적"}', 1.2, 10, NULL, NULL, false, 1),
  ('mj-v6-raw', 'midjourney', 'v6.0 RAW', '사실적 스타일', '{"resolution": "1024x1024", "style": "사실적"}', 1.3, 11, NULL, NULL, false, 2),
  -- Stable Diffusion
  ('sd3-turbo', 'stable-diffusion', 'Turbo', '빠른 생성', '{"resolution": "1024x1024", "style": "다양함"}', 0.6, 5, NULL, NULL, false, 1),
  ('sd3-ultra', 'stable-diffusion', 'Ultra', '최고 품질', '{"resolution": "2048x2048", "style": "정교함"}', 1.0, 8, NULL, NULL, false, 2),
  -- Flux
  ('flux-schnell', 'flux', 'Schnell', '초고속 생성', '{"resolution": "1024x1024", "style": "빠른"}', 0.5, 4, NULL, NULL, false, 1),
  ('flux-pro', 'flux', 'Pro', '프로페셔널', '{"resolution": "1440x1440", "style": "전문가용"}', 1.2, 10, NULL, NULL, false, 2),
  -- Ideogram
  ('ideogram-v2', 'ideogram', 'v2.0', '텍스트 특화', '{"resolution": "1024x1024", "style": "타이포그래피"}', 0.8, 7, NULL, NULL, false, 1),
  ('ideogram-v2-turbo', 'ideogram', 'v2.0 Turbo', '빠른 텍스트', '{"resolution": "1024x1024", "style": "빠른 타이포"}', 0.6, 5, NULL, NULL, false, 2),
  -- GPT-4
  ('gpt4o', 'gpt4', 'GPT-4o', '최신 모델', '{"context": "128K", "speed": "빠름"}', 1.0, 3, NULL, NULL, false, 1),
  ('gpt4o-mini', 'gpt4', 'GPT-4o Mini', '경량 모델', '{"context": "128K", "speed": "매우 빠름"}', 0.3, 1, NULL, NULL, false, 2),
  -- Claude
  ('claude-sonnet', 'claude', 'Sonnet', '균형 잡힌 성능', '{"context": "200K", "speed": "빠름"}', 0.8, 2, NULL, NULL, false, 1),
  ('claude-opus', 'claude', 'Opus', '최고 성능', '{"context": "200K", "speed": "보통"}', 1.5, 5, NULL, NULL, false, 2),
  -- Gemini
  ('gemini-pro', 'gemini', 'Pro', '표준 모델', '{"context": "1M", "speed": "빠름"}', 0.7, 2, NULL, NULL, false, 1),
  ('gemini-ultra', 'gemini', 'Ultra', '최고 성능', '{"context": "1M", "speed": "보통"}', 1.2, 4, NULL, NULL, false, 2),
  -- Llama
  ('llama-70b', 'llama', '70B', '대형 모델', '{"context": "128K", "speed": "보통"}', 0.5, 2, NULL, NULL, false, 1),
  ('llama-405b', 'llama', '405B', '초대형 모델', '{"context": "128K", "speed": "느림"}', 1.0, 3, NULL, NULL, false, 2),
  -- Mistral
  ('mistral-medium', 'mistral', 'Medium', '중형 모델', '{"context": "32K", "speed": "빠름"}', 0.4, 1, NULL, NULL, false, 1),
  ('mistral-large', 'mistral', 'Large', '대형 모델', '{"context": "128K", "speed": "보통"}', 0.8, 3, NULL, NULL, false, 2)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Triggers for updated_at
-- ============================================

CREATE TRIGGER tr_institution_credits_updated_at
  BEFORE UPDATE ON institution_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_member_allocations_updated_at
  BEFORE UPDATE ON member_credit_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
