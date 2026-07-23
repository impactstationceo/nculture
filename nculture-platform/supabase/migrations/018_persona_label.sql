-- ============================================================
-- Coming AI · user_persona 에 표시용 라벨 추가
-- 018_persona_label.sql
--
-- 배경: 프로토타입은 Supabase 익명 로그인으로 auth.uid() 를 확보하고,
--   데모 계정별로 익명 세션을 분리한다(브라우저 storageKey 기준).
--   그래서 DB 에는 UUID 만 남아 '어느 익명 사용자가 어느 데모 계정인지' 알 수 없다.
--   회원별 개인화 데이터를 사람이 읽으려면(=인사이트 화면) 식별 라벨이 필요하다.
--
-- 공유 인증이 붙으면 이 자리는 users_profile.name/email 이 대신한다.
-- 그때까지 쓰는 프로토타입용 필드라 nullable 로 둔다.
-- ============================================================

ALTER TABLE user_persona
  ADD COLUMN IF NOT EXISTS label TEXT;

COMMENT ON COLUMN user_persona.label IS
  '표시용 계정 라벨(프로토타입: 데모 계정 email). 공유 인증 도입 후에는 users_profile 로 대체.';
