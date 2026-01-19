-- 006_notifications.sql
-- 인앱 알림 시스템

-- ============================================
-- notifications 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'credit_received',      -- 크레딧 지급
    'credit_used',          -- 크레딧 사용
    'course_enrolled',      -- 코스 등록
    'course_completed',     -- 코스 완료
    'session_completed',    -- 세션 완료 (크레딧 보상)
    'live_starting',        -- 라이브 시작 예정
    'live_started',         -- 라이브 시작됨
    'review_helpful',       -- 내 리뷰가 도움이 됐어요
    'new_course',           -- 새 코스 알림 (강사 팔로우 시)
    'invitation',           -- 기관 초대
    'system'                -- 시스템 공지
  )),
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',  -- 추가 데이터 (course_id, live_id 등)
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- RLS 활성화
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS 정책
-- ============================================

-- 본인 알림만 조회 가능
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

-- 알림 생성은 Service Role만 가능 (Edge Function에서)
-- INSERT 정책 없음

-- 본인 알림만 읽음 처리 가능
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- 본인 알림만 삭제 가능
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- notification_preferences 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
  
  -- 이메일 알림 설정
  email_credit_received BOOLEAN DEFAULT true,
  email_course_enrolled BOOLEAN DEFAULT true,
  email_live_reminder BOOLEAN DEFAULT true,
  email_marketing BOOLEAN DEFAULT false,
  
  -- 인앱 알림 설정
  push_credit_received BOOLEAN DEFAULT true,
  push_course_updates BOOLEAN DEFAULT true,
  push_live_reminder BOOLEAN DEFAULT true,
  push_marketing BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- 본인 설정만 조회/수정 가능
CREATE POLICY "Users can manage own notification preferences"
  ON public.notification_preferences FOR ALL
  USING (user_id = auth.uid());

-- ============================================
-- 헬퍼 함수: 알림 생성
-- ============================================
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT DEFAULT NULL,
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 헬퍼 함수: 읽지 않은 알림 수
-- ============================================
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.notifications
    WHERE user_id = p_user_id
    AND is_read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 헬퍼 함수: 모든 알림 읽음 처리
-- ============================================
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.notifications
  SET is_read = true, read_at = NOW()
  WHERE user_id = p_user_id
  AND is_read = false;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 오래된 알림 정리 함수 (30일 이상)
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.notifications
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND is_read = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 트리거: 크레딧 지급 시 알림 생성
-- ============================================
CREATE OR REPLACE FUNCTION notify_credit_received()
RETURNS TRIGGER AS $$
BEGIN
  -- 긍정적 금액만 (지급)
  IF NEW.amount > 0 AND NEW.tx_type IN ('purchase', 'bonus', 'allocation', 'refund', 'reward') THEN
    PERFORM create_notification(
      NEW.user_id,
      'credit_received',
      NEW.amount || ' 크레딧이 지급되었습니다',
      NEW.description,
      jsonb_build_object('amount', NEW.amount, 'tx_type', NEW.tx_type)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_credit_received
  AFTER INSERT ON public.credit_ledger
  FOR EACH ROW
  EXECUTE FUNCTION notify_credit_received();

-- ============================================
-- 트리거: 코스 등록 시 알림 생성
-- ============================================
CREATE OR REPLACE FUNCTION notify_course_enrolled()
RETURNS TRIGGER AS $$
DECLARE
  course_title TEXT;
BEGIN
  SELECT title INTO course_title
  FROM public.courses
  WHERE id = NEW.course_id;
  
  PERFORM create_notification(
    NEW.user_id,
    'course_enrolled',
    '클래스 등록 완료',
    '"' || course_title || '" 클래스에 등록되었습니다.',
    jsonb_build_object('course_id', NEW.course_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_course_enrolled
  AFTER INSERT ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION notify_course_enrolled();
