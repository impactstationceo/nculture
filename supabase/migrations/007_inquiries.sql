-- 007_inquiries.sql
-- 문의 시스템

-- ============================================
-- inquiries 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users_profile(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('general', 'payment', 'technical', 'partnership', 'other')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES public.users_profile(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_inquiries_email ON public.inquiries(email);
CREATE INDEX idx_inquiries_status ON public.inquiries(status);
CREATE INDEX idx_inquiries_type ON public.inquiries(type);
CREATE INDEX idx_inquiries_created ON public.inquiries(created_at DESC);

-- RLS 활성화
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS 정책
-- ============================================

-- 누구나 문의 작성 가능
CREATE POLICY "Anyone can create inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

-- 본인 문의만 조회 가능 (이메일 기준)
CREATE POLICY "Users can view own inquiries by email"
  ON public.inquiries FOR SELECT
  USING (
    email = (SELECT email FROM public.users_profile WHERE id = auth.uid())
    OR user_id = auth.uid()
  );

-- 플랫폼 관리자는 모든 문의 조회/수정 가능
CREATE POLICY "Platform admins can manage all inquiries"
  ON public.inquiries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE id = auth.uid()
      AND role = 'platform_admin'
    )
  );

-- ============================================
-- 트리거: updated_at 자동 갱신
-- ============================================
CREATE OR REPLACE FUNCTION update_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_inquiries_updated_at();

-- ============================================
-- announcements 테이블 (공지사항)
-- ============================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'notice' CHECK (type IN ('notice', 'update', 'event', 'maintenance')),
  is_pinned BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES public.users_profile(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_published ON public.announcements(is_published, published_at DESC);
CREATE INDEX idx_announcements_type ON public.announcements(type);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 공개된 공지사항은 누구나 조회 가능
CREATE POLICY "Anyone can view published announcements"
  ON public.announcements FOR SELECT
  USING (is_published = true);

-- 플랫폼 관리자는 모든 공지사항 관리 가능
CREATE POLICY "Platform admins can manage announcements"
  ON public.announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE id = auth.uid()
      AND role = 'platform_admin'
    )
  );
