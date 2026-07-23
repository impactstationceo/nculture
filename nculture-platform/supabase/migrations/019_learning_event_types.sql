-- ============================================================
-- Coming AI · 강의실 이벤트 타입 확장
-- 019_learning_event_types.sql
--
-- 개인화에 쓰려면 지금 enum 으로는 못 담는 신호들이 있다.
--
--   session_start / session_end : 실제 접속 패턴(요일·시간대·세션 길이).
--       로그인 이벤트로는 못 잡는다 — 로그인 상태가 유지되면 재방문이 안 찍힌다.
--   login / logout              : 계정 생애주기(가입→재방문 간격) 분석용. 접속 패턴의 주력은 아니다.
--   video_seek                  : 되감아 다시 본 구간 = 어려워하는 지점. 체류시간보다 강한 신호.
--   tutor_question              : 막힌 지점 직접 신호.
--
-- 이미 정의돼 있으나 앱이 안 쏘던 prompt_input · param_select · regenerate · save 는
-- 마이그레이션 없이 프론트에서 연결한다. publish 는 UI 자체가 없어 그대로 둔다.
-- ============================================================

ALTER TYPE learning_event_type ADD VALUE IF NOT EXISTS 'session_start';
ALTER TYPE learning_event_type ADD VALUE IF NOT EXISTS 'session_end';
ALTER TYPE learning_event_type ADD VALUE IF NOT EXISTS 'login';
ALTER TYPE learning_event_type ADD VALUE IF NOT EXISTS 'logout';
ALTER TYPE learning_event_type ADD VALUE IF NOT EXISTS 'video_seek';
ALTER TYPE learning_event_type ADD VALUE IF NOT EXISTS 'tutor_question';
