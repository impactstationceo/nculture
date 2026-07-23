-- ============================================================
-- Coming AI · user_persona 에 계정 식별자 추가
-- 020_persona_account.sql
--
-- label 에는 표시용 이름(데모 계정 name)만 들어간다. 동명이인이 생기면
-- 인사이트 화면에서 누가 누구인지 구분할 수 없다.
-- 세션 분리는 원래 email 로 하고 있으므로(analytics.setAnalyticsIdentity),
-- 그 값을 같이 남겨 화면에서 이름 아래 보조 식별자로 쓴다.
--
-- 공유 인증이 붙으면 label/account 자리는 users_profile.name/email 이 대신한다.
-- ============================================================

ALTER TABLE user_persona
  ADD COLUMN IF NOT EXISTS account TEXT;

COMMENT ON COLUMN user_persona.account IS
  '계정 식별자(프로토타입: 데모 email). 동명이인 구분용 보조 표시. 공유 인증 도입 후 users_profile.email 로 대체.';
