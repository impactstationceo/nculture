-- ============================================
-- 010_user_plan_credits.sql
-- 사용자 요금제 및 크레딧 컬럼 추가
-- ============================================

-- users_profile 테이블에 plan 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users_profile' AND column_name = 'plan'
  ) THEN
    ALTER TABLE users_profile ADD COLUMN plan VARCHAR(20) DEFAULT 'free';
  END IF;
END $$;

-- users_profile 테이블에 credits 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users_profile' AND column_name = 'credits'
  ) THEN
    ALTER TABLE users_profile ADD COLUMN credits INT DEFAULT 50;
  END IF;
END $$;

-- users_profile 테이블에 monthly_credits_limit 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users_profile' AND column_name = 'monthly_credits_limit'
  ) THEN
    ALTER TABLE users_profile ADD COLUMN monthly_credits_limit INT DEFAULT 50;
  END IF;
END $$;

-- users_profile 테이블에 credits_reset_at 컬럼 추가 (월간 리셋 추적)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users_profile' AND column_name = 'credits_reset_at'
  ) THEN
    ALTER TABLE users_profile ADD COLUMN credits_reset_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- 플랜 타입 ENUM 생성 (이미 존재하면 무시)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_plan') THEN
    CREATE TYPE user_plan AS ENUM ('free', 'basic', 'pro', 'max', 'enterprise');
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_users_profile_plan ON users_profile(plan);

-- 플랜별 크레딧 제공 함수
CREATE OR REPLACE FUNCTION get_plan_credits(p_plan VARCHAR)
RETURNS INT AS $$
BEGIN
  RETURN CASE p_plan
    WHEN 'free' THEN 50
    WHEN 'basic' THEN 500
    WHEN 'pro' THEN 2000
    WHEN 'max' THEN 5000
    WHEN 'enterprise' THEN 10000
    ELSE 50
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 사용자 플랜 업그레이드 함수
CREATE OR REPLACE FUNCTION upgrade_user_plan(
  p_user_id UUID,
  p_new_plan VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  v_new_credits INT;
BEGIN
  v_new_credits := get_plan_credits(p_new_plan);
  
  UPDATE users_profile
  SET 
    plan = p_new_plan,
    credits = v_new_credits,
    monthly_credits_limit = v_new_credits,
    credits_reset_at = NOW(),
    updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 월간 크레딧 리셋 함수 (스케줄러에서 호출)
CREATE OR REPLACE FUNCTION reset_monthly_credits()
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE users_profile
  SET 
    credits = monthly_credits_limit,
    credits_reset_at = NOW(),
    updated_at = NOW()
  WHERE credits_reset_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 코멘트 추가
COMMENT ON COLUMN users_profile.plan IS '사용자 요금제 (free, basic, pro, max, enterprise)';
COMMENT ON COLUMN users_profile.credits IS '현재 보유 크레딧';
COMMENT ON COLUMN users_profile.monthly_credits_limit IS '월간 크레딧 한도';
COMMENT ON COLUMN users_profile.credits_reset_at IS '마지막 크레딧 리셋 시간';
