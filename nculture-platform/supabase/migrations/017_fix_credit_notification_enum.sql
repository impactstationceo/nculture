-- ============================================================
-- Coming AI · credit_ledger 알림 트리거 enum 불일치 수정
-- 017_fix_credit_notification_enum.sql
--
-- ⚠️ [버그 수정] 006_notifications.sql:171 의 notify_credit_received() 는
--    credit_tx_type enum 에 없는 값과 비교한다:
--        NEW.tx_type IN ('purchase', 'bonus', 'allocation', 'refund', 'reward')
--                        ^없음                ^없음                    ^없음
--    실제 enum 값: recharge, usage, refund, allocate, recall, bonus, expire
--
--    enum 컬럼을 문자열과 비교하면 그 문자열이 enum 으로 캐스팅되는데,
--    없는 라벨이면 22P02 (invalid input value for enum) 로 실패한다.
--    이 트리거는 credit_ledger INSERT AFTER 트리거라, 크레딧이 적립되는
--    모든 경로가 막힌다. 특히 handle_new_user() 의 '신규 가입 보너스' 적립이
--    걸려서 → 회원가입 전체가 "Database error saving new user" 로 실패했다. (실측)
--
--    수정: 의도(= 적립성 거래)를 유지하되 실제 enum 라벨로 교정한다.
--      purchase   → recharge  (충전)
--      allocation → allocate  (기관 크레딧 배분)
--      reward     → 제거 (bonus 가 그 역할)
--    더불어 SECURITY DEFINER 에 search_path 를 고정한다(권고사항).
-- ============================================================

CREATE OR REPLACE FUNCTION notify_credit_received()
RETURNS TRIGGER AS $$
BEGIN
  -- 적립성 거래만 알림 (충전·보너스·기관배분·환불)
  IF NEW.amount > 0 AND NEW.tx_type IN ('recharge', 'bonus', 'allocate', 'refund') THEN
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;
