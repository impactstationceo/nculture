-- 008_credit_packages.sql
-- 크레딧 패키지 (결제용 상품)

-- ============================================
-- credit_packages 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL,
  price INTEGER NOT NULL,  -- 원화 (KRW)
  bonus_credits INTEGER DEFAULT 0,
  discount_percent INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_credit_packages_active ON public.credit_packages(is_active);
CREATE INDEX idx_credit_packages_sort ON public.credit_packages(sort_order);

-- RLS 활성화
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS 정책
-- ============================================

-- 활성 패키지는 누구나 조회 가능
CREATE POLICY "Anyone can view active packages"
  ON public.credit_packages FOR SELECT
  USING (is_active = true);

-- 플랫폼 관리자만 관리 가능
CREATE POLICY "Platform admins can manage packages"
  ON public.credit_packages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE id = auth.uid()
      AND role = 'platform_admin'
    )
  );

-- ============================================
-- 기본 패키지 데이터
-- ============================================
INSERT INTO public.credit_packages (name, description, credits, price, bonus_credits, is_popular, sort_order)
VALUES 
  ('스타터', '처음 시작하는 분들을 위한 패키지', 100, 10000, 0, false, 1),
  ('베이직', '가장 인기있는 패키지', 300, 27000, 30, true, 2),
  ('프로', '전문가를 위한 패키지', 500, 40000, 100, false, 3),
  ('프리미엄', '대용량 작업을 위한 패키지', 1000, 70000, 300, false, 4)
ON CONFLICT DO NOTHING;

-- ============================================
-- 트리거: updated_at 자동 갱신
-- ============================================
CREATE OR REPLACE FUNCTION update_credit_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_credit_packages_updated_at
  BEFORE UPDATE ON public.credit_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_packages_updated_at();
