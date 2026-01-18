-- ============================================
-- nCulture Database Schema
-- Supabase (PostgreSQL) + RLS
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM Types
-- ============================================

CREATE TYPE user_role AS ENUM ('student', 'instructor', 'institution_admin', 'platform_admin');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE course_status AS ENUM ('draft', 'pending', 'published', 'archived');
CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'dropped');
CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE video_status AS ENUM ('pending', 'processing', 'ready', 'error');
CREATE TYPE ai_job_status AS ENUM ('queued', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE ai_job_type AS ENUM ('image', 'video', 'audio');
CREATE TYPE credit_tx_type AS ENUM ('recharge', 'usage', 'refund', 'allocate', 'recall', 'bonus', 'expire');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled', 'refunded');

-- ============================================
-- 1. INSTITUTIONS (기관)
-- ============================================

CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  business_number VARCHAR(20),
  logo_url TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  address TEXT,
  settings JSONB DEFAULT '{}',
  status user_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_institutions_status ON institutions(status);

-- ============================================
-- 2. USERS_PROFILE (사용자 프로필)
-- auth.users와 1:1 관계, id = auth.users.id
-- ============================================

CREATE TABLE users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  role user_role DEFAULT 'student',
  status user_status DEFAULT 'active',
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  phone VARCHAR(20),
  bio TEXT,
  settings JSONB DEFAULT '{}',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_profile_role ON users_profile(role);
CREATE INDEX idx_users_profile_institution ON users_profile(institution_id);
CREATE INDEX idx_users_profile_email ON users_profile(email);

-- ============================================
-- 3. COURSES (클래스/강의)
-- ============================================

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instructor_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category VARCHAR(50),
  level VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, advanced
  price_credits INT DEFAULT 0,
  status course_status DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{}',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_institution ON courses(institution_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_featured ON courses(is_featured) WHERE is_featured = TRUE;

-- ============================================
-- 4. SESSIONS (클래스 회차)
-- ============================================

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  session_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  credits_provided INT DEFAULT 0, -- 회차별 제공 크레딧
  has_test BOOLEAN DEFAULT FALSE,
  video_asset_id UUID, -- video_assets 참조 (nullable, 나중에 FK 추가)
  duration_seconds INT,
  sort_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(course_id, session_number)
);

CREATE INDEX idx_sessions_course ON sessions(course_id);

-- ============================================
-- 5. VIDEO_ASSETS (영상 자산 - Mux 연동)
-- ============================================

CREATE TABLE video_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploader_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  
  -- Mux 관련 필드
  mux_asset_id VARCHAR(100),
  mux_playback_id VARCHAR(100),
  mux_upload_id VARCHAR(100),
  
  title VARCHAR(255),
  status video_status DEFAULT 'pending',
  duration_seconds FLOAT,
  resolution_tier VARCHAR(20), -- 720p, 1080p, 4k
  aspect_ratio VARCHAR(10),
  
  -- 메타데이터
  file_size_bytes BIGINT,
  original_filename VARCHAR(255),
  error_message TEXT,
  
  -- Signed playback
  playback_policy VARCHAR(20) DEFAULT 'signed', -- public, signed
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_video_assets_uploader ON video_assets(uploader_id);
CREATE INDEX idx_video_assets_mux_asset ON video_assets(mux_asset_id);
CREATE INDEX idx_video_assets_status ON video_assets(status);

-- sessions 테이블에 FK 추가
ALTER TABLE sessions 
ADD CONSTRAINT fk_sessions_video_asset 
FOREIGN KEY (video_asset_id) REFERENCES video_assets(id) ON DELETE SET NULL;

-- ============================================
-- 6. ENROLLMENTS (수강 신청)
-- ============================================

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status enrollment_status DEFAULT 'active',
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

-- ============================================
-- 7. PROGRESS (학습 진도)
-- ============================================

CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  status progress_status DEFAULT 'not_started',
  watch_seconds INT DEFAULT 0,
  last_position_seconds INT DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  UNIQUE(user_id, session_id)
);

CREATE INDEX idx_progress_user ON progress(user_id);
CREATE INDEX idx_progress_session ON progress(session_id);

-- ============================================
-- 8. CREDIT_LEDGER (크레딧 원장 - Append Only)
-- ============================================

CREATE TABLE credit_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  
  tx_type credit_tx_type NOT NULL,
  amount INT NOT NULL, -- 양수: 증가, 음수: 감소
  balance_after INT NOT NULL, -- 트랜잭션 후 잔액 (계산된 값)
  
  -- 참조 정보
  ref_type VARCHAR(50), -- 'payment', 'ai_job', 'session', 'admin', 'institution'
  ref_id UUID, -- 관련 엔티티 ID
  
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- 기관 크레딧 배분 추적
  institution_id UUID REFERENCES institutions(id),
  allocated_by UUID REFERENCES users_profile(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Immutable: UPDATE/DELETE 금지는 RLS로 처리
CREATE INDEX idx_credit_ledger_user ON credit_ledger(user_id);
CREATE INDEX idx_credit_ledger_created ON credit_ledger(created_at DESC);
CREATE INDEX idx_credit_ledger_ref ON credit_ledger(ref_type, ref_id);
CREATE INDEX idx_credit_ledger_institution ON credit_ledger(institution_id);

-- ============================================
-- 9. CREDIT_RESERVATIONS (크레딧 예약)
-- reserve -> capture/refund 패턴
-- ============================================

CREATE TABLE credit_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  
  amount INT NOT NULL, -- 예약 금액 (양수)
  status VARCHAR(20) DEFAULT 'reserved', -- reserved, captured, refunded, expired
  
  -- 참조
  ref_type VARCHAR(50) NOT NULL, -- 'ai_job'
  ref_id UUID NOT NULL, -- ai_jobs.id
  
  -- 멱등성 키
  idempotency_key VARCHAR(255),
  
  reserved_at TIMESTAMPTZ DEFAULT NOW(),
  captured_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour'),
  
  UNIQUE(idempotency_key)
);

CREATE INDEX idx_credit_reservations_user ON credit_reservations(user_id);
CREATE INDEX idx_credit_reservations_status ON credit_reservations(status);
CREATE INDEX idx_credit_reservations_ref ON credit_reservations(ref_type, ref_id);
CREATE INDEX idx_credit_reservations_expires ON credit_reservations(expires_at) WHERE status = 'reserved';

-- ============================================
-- 10. AI_JOBS (AI 생성 작업)
-- ============================================

CREATE TABLE ai_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  
  -- 작업 유형 및 상태
  job_type ai_job_type NOT NULL,
  status ai_job_status DEFAULT 'queued',
  
  -- AI 서비스 정보
  provider VARCHAR(50) NOT NULL, -- runway, pika, luma, kling, dalle, flux, etc.
  model VARCHAR(100), -- gen3a_turbo, pika-1.0, etc.
  
  -- 입력
  prompt TEXT,
  negative_prompt TEXT,
  input_params JSONB DEFAULT '{}', -- duration, resolution, seed, etc.
  input_asset_url TEXT, -- image-to-video의 경우 입력 이미지
  
  -- 출력
  output_url TEXT,
  output_asset_id UUID, -- Supabase Storage 또는 video_assets 참조
  output_metadata JSONB DEFAULT '{}', -- 생성 결과 메타데이터
  
  -- 비용
  credits_reserved INT DEFAULT 0,
  credits_used INT DEFAULT 0,
  reservation_id UUID REFERENCES credit_reservations(id),
  
  -- Provider 정보
  provider_job_id VARCHAR(255), -- 외부 서비스의 job ID
  provider_response JSONB DEFAULT '{}',
  
  -- 에러 처리
  error_code VARCHAR(50),
  error_message TEXT,
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  
  -- 타이밍
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- 멱등성
  idempotency_key VARCHAR(255),
  
  UNIQUE(idempotency_key)
);

CREATE INDEX idx_ai_jobs_user ON ai_jobs(user_id);
CREATE INDEX idx_ai_jobs_status ON ai_jobs(status);
CREATE INDEX idx_ai_jobs_provider ON ai_jobs(provider);
CREATE INDEX idx_ai_jobs_queued ON ai_jobs(queued_at) WHERE status = 'queued';
CREATE INDEX idx_ai_jobs_provider_job ON ai_jobs(provider_job_id);

-- ============================================
-- 11. PAYMENTS (결제)
-- ============================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  
  -- 결제 정보
  amount INT NOT NULL, -- 원화 금액
  credits INT NOT NULL, -- 충전될 크레딧
  
  status payment_status DEFAULT 'pending',
  
  -- Toss Payments 정보
  provider VARCHAR(50) DEFAULT 'toss',
  provider_payment_key VARCHAR(255), -- toss paymentKey
  provider_order_id VARCHAR(255), -- toss orderId (우리가 생성)
  
  -- 결제 상세
  method VARCHAR(50), -- card, transfer, etc.
  card_company VARCHAR(50),
  card_number VARCHAR(20), -- 마스킹된 번호
  receipt_url TEXT,
  
  -- 환불 정보
  refund_amount INT DEFAULT 0,
  refund_reason TEXT,
  refunded_at TIMESTAMPTZ,
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  
  UNIQUE(provider_order_id)
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_provider_key ON payments(provider_payment_key);

-- ============================================
-- 12. PAYMENT_EVENTS (결제 이벤트 - 웹훅 멱등성)
-- ============================================

CREATE TABLE payment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  
  -- 웹훅 정보
  provider VARCHAR(50) NOT NULL,
  event_type VARCHAR(100) NOT NULL, -- PAYMENT_APPROVED, PAYMENT_CANCELED, etc.
  provider_event_id VARCHAR(255) NOT NULL, -- Toss 웹훅의 고유 ID
  
  -- 페이로드
  payload JSONB NOT NULL,
  
  -- 처리 상태
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 멱등성: 동일 이벤트 중복 처리 방지
  UNIQUE(provider, provider_event_id)
);

CREATE INDEX idx_payment_events_payment ON payment_events(payment_id);
CREATE INDEX idx_payment_events_processed ON payment_events(processed) WHERE processed = FALSE;

-- ============================================
-- 13. LIVE_CLASSES (화상 강의 - Daily.co)
-- ============================================

CREATE TABLE live_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  host_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Daily.co 정보
  daily_room_name VARCHAR(255),
  daily_room_url TEXT,
  
  -- 일정
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INT DEFAULT 60,
  
  -- 참가자 제한
  max_participants INT DEFAULT 100,
  
  -- 상태
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, live, ended, cancelled
  
  -- 녹화
  recording_enabled BOOLEAN DEFAULT FALSE,
  recording_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_live_classes_course ON live_classes(course_id);
CREATE INDEX idx_live_classes_host ON live_classes(host_id);
CREATE INDEX idx_live_classes_scheduled ON live_classes(scheduled_at);
CREATE INDEX idx_live_classes_status ON live_classes(status);

-- ============================================
-- 14. AUDIT_LOGS (감사 로그)
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users_profile(id) ON DELETE SET NULL,
  
  action VARCHAR(100) NOT NULL, -- create, update, delete, login, etc.
  entity_type VARCHAR(50), -- users_profile, courses, payments, etc.
  entity_id UUID,
  
  old_values JSONB,
  new_values JSONB,
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================
-- FUNCTIONS: 크레딧 잔액 계산
-- ============================================

-- 사용자의 현재 크레딧 잔액 조회 (ledger 합계)
CREATE OR REPLACE FUNCTION get_credit_balance(p_user_id UUID)
RETURNS INT AS $$
  SELECT COALESCE(SUM(amount), 0)::INT
  FROM credit_ledger
  WHERE user_id = p_user_id;
$$ LANGUAGE SQL STABLE;

-- 사용자의 사용 가능 크레딧 (잔액 - 예약된 금액)
CREATE OR REPLACE FUNCTION get_available_credits(p_user_id UUID)
RETURNS INT AS $$
  SELECT get_credit_balance(p_user_id) - COALESCE(
    (SELECT SUM(amount) FROM credit_reservations 
     WHERE user_id = p_user_id AND status = 'reserved'),
    0
  )::INT;
$$ LANGUAGE SQL STABLE;

-- ============================================
-- TRIGGERS: updated_at 자동 갱신
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER tr_institutions_updated_at
  BEFORE UPDATE ON institutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_users_profile_updated_at
  BEFORE UPDATE ON users_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_video_assets_updated_at
  BEFORE UPDATE ON video_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_live_classes_updated_at
  BEFORE UPDATE ON live_classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- TRIGGER: auth.users 생성 시 users_profile 자동 생성
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_profile (id, email, name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'),
    'active'
  );
  
  -- 신규 가입 보너스 크레딧 지급 (100 크레딧)
  INSERT INTO public.credit_ledger (user_id, tx_type, amount, balance_after, description)
  VALUES (
    NEW.id,
    'bonus',
    100,
    100,
    '신규 가입 보너스'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users에 트리거 연결
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
