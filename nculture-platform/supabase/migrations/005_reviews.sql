-- 005_reviews.sql
-- 코스 리뷰/평점 시스템

-- ============================================
-- reviews 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  is_visible BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 한 사용자는 한 코스에 하나의 리뷰만 작성 가능
  UNIQUE(course_id, user_id)
);

-- 인덱스
CREATE INDEX idx_reviews_course ON public.reviews(course_id);
CREATE INDEX idx_reviews_user ON public.reviews(user_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_reviews_created ON public.reviews(created_at DESC);

-- RLS 활성화
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- review_helpful 테이블 (도움이 됐어요)
-- ============================================
CREATE TABLE IF NOT EXISTS public.review_helpful (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(review_id, user_id)
);

CREATE INDEX idx_review_helpful_review ON public.review_helpful(review_id);

ALTER TABLE public.review_helpful ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS 정책 - reviews
-- ============================================

-- 공개 리뷰는 누구나 조회 가능
CREATE POLICY "Anyone can view visible reviews"
  ON public.reviews FOR SELECT
  USING (is_visible = true);

-- 본인 리뷰는 비공개여도 조회 가능
CREATE POLICY "Users can view own reviews"
  ON public.reviews FOR SELECT
  USING (user_id = auth.uid());

-- 수강 완료한 사용자만 리뷰 작성 가능
CREATE POLICY "Enrolled users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE user_id = auth.uid()
      AND course_id = reviews.course_id
      AND status IN ('active', 'completed')
    )
  );

-- 본인 리뷰만 수정 가능
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (user_id = auth.uid());

-- 본인 리뷰만 삭제 가능
CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- RLS 정책 - review_helpful
-- ============================================

-- 누구나 helpful 조회 가능
CREATE POLICY "Anyone can view helpful"
  ON public.review_helpful FOR SELECT
  USING (true);

-- 인증된 사용자는 helpful 추가 가능
CREATE POLICY "Authenticated users can add helpful"
  ON public.review_helpful FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 본인이 추가한 helpful만 삭제 가능
CREATE POLICY "Users can remove own helpful"
  ON public.review_helpful FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 트리거: helpful_count 자동 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reviews
    SET helpful_count = helpful_count - 1
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_review_helpful_count
  AFTER INSERT OR DELETE ON public.review_helpful
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_count();

-- ============================================
-- 트리거: 코스 평균 평점 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  review_count INTEGER;
BEGIN
  -- 평균 평점 계산
  SELECT 
    COALESCE(AVG(rating)::DECIMAL(3,2), 0),
    COUNT(*)
  INTO avg_rating, review_count
  FROM public.reviews
  WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
  AND is_visible = true;

  -- 코스 테이블 업데이트 (avg_rating, review_count 컬럼 필요)
  UPDATE public.courses
  SET 
    avg_rating = avg_rating,
    review_count = review_count,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_course_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_course_rating();

-- ============================================
-- courses 테이블에 평점 컬럼 추가
-- ============================================
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- ============================================
-- 트리거: updated_at 자동 갱신
-- ============================================
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();
