-- 004_invitations.sql
-- 초대 시스템 테이블

-- ============================================
-- invitations 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES public.users_profile(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'institution_admin')),
  token TEXT UNIQUE NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_institution ON public.invitations(institution_id);
CREATE INDEX idx_invitations_status ON public.invitations(status);

-- RLS 활성화
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS 정책
-- ============================================

-- 기관 관리자는 자기 기관의 초대 조회 가능
CREATE POLICY "Institution admins can view their invitations"
  ON public.invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE id = auth.uid()
      AND institution_id = invitations.institution_id
      AND role IN ('institution_admin', 'platform_admin')
    )
  );

-- 플랫폼 관리자는 모든 초대 조회 가능
CREATE POLICY "Platform admins can view all invitations"
  ON public.invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE id = auth.uid()
      AND role = 'platform_admin'
    )
  );

-- 초대 생성은 Edge Function에서만 (Service Role)
-- INSERT 정책 불필요

-- 기관 관리자는 자기 기관의 초대 취소 가능
CREATE POLICY "Institution admins can cancel their invitations"
  ON public.invitations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE id = auth.uid()
      AND institution_id = invitations.institution_id
      AND role IN ('institution_admin', 'platform_admin')
    )
  )
  WITH CHECK (
    status = 'cancelled' -- 취소만 가능
  );

-- ============================================
-- 트리거: updated_at 자동 갱신
-- ============================================
CREATE OR REPLACE FUNCTION update_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_invitations_updated_at();

-- ============================================
-- 만료된 초대 정리 함수 (크론잡용)
-- ============================================
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE public.invitations
  SET status = 'expired'
  WHERE status = 'pending'
  AND expires_at < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- 사용 예: SELECT expire_old_invitations();
-- 크론잡 설정: pg_cron 또는 외부 스케줄러로 매일 실행
