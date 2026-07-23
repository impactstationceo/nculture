-- ============================================================
-- Coming AI · 가입 트리거 수정 + 익명 사용자 지원
-- 016_anonymous_user_support.sql
--
-- ⚠️ [버그 수정] 001/012 의 handle_new_user() 는 '모든 회원가입'을 실패시킨다.
--    원인: SECURITY DEFINER 인데 SET search_path 가 없다.
--          GoTrue 는 supabase_auth_admin 으로 실행되고 이 역할의 search_path 는 'auth' 뿐인데,
--          함수가 참조하는 user_role·user_status 타입은 public 스키마에 있다.
--          → 타입 미해석으로 트리거가 실패 → auth.users INSERT 롤백
--          → "Database error saving new user" (익명/이메일 가입 모두)
--    확인: 실측으로 이메일 가입·익명 로그인 둘 다 실패 재현, 함수 무력화 시 즉시 성공.
--    수정: 두 함수에 SET search_path = public, auth 를 지정하고 타입을 스키마 한정한다.
--          (SECURITY DEFINER 에 search_path 고정은 보안 권고사항이기도 하다)
--
-- 배경:
--   /prototype 의 개인화 데이터 수집(learning_events·prompt_feedback·user_persona)은
--   RLS 가 auth.uid() 소유 기반이라 '진짜 세션'을 요구한다. 공유 로그인(users_profile 기반)이
--   아직 붙지 않은 단계라, Supabase 익명 로그인으로 실제 auth.uid() 를 확보해 수집한다.
--
-- 문제:
--   001/012 의 handle_new_user() 는 AFTER INSERT ON auth.users 로 걸려 있고
--   users_profile.email 은 NOT NULL 인데, 익명 사용자는 email 이 NULL 이다.
--   → NOT NULL 위반 → AFTER 트리거 예외가 전파되어 auth.users INSERT 자체가 롤백
--   → 익명 로그인이 "Database error creating anonymous user" 로 실패한다. (실측 확인)
--
-- 해법:
--   (1) 익명 사용자에게는 프로필/보너스크레딧을 만들지 않는다.
--       익명은 아직 '회원'이 아니다. 우리 5개 테이블은 users_profile 이 아니라
--       auth.users 를 직접 참조하므로 프로필 없이도 수집은 정상 동작한다.
--   (2) 익명 → 정식 계정 승격 시점에 프로필을 만든다.
--       Supabase 승격은 auth.users 의 UPDATE 라 AFTER INSERT 트리거가 안 걸린다.
--       그래서 UPDATE 트리거를 따로 둔다. id 가 유지되므로 익명일 때 쌓은
--       이벤트·페르소나·별점이 그대로 승계된다.
-- ============================================================

-- ── (1) 신규 가입 핸들러: 익명 사용자 건너뛰기 ──────────────
-- 012 버전 본문을 그대로 승계하고 맨 앞에 익명 가드만 추가한다.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role public.user_role;
  v_status public.user_status;
  v_institution_id UUID;
BEGIN
  -- 익명 사용자는 프로필을 만들지 않는다 (승격 시 아래 handle_user_upgraded 가 처리)
  IF COALESCE(NEW.is_anonymous, FALSE) OR NEW.email IS NULL THEN
    RETURN NEW;
  END IF;

  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student');
  v_status := CASE
    WHEN v_role IN ('instructor', 'institution_admin') THEN 'pending'
    ELSE 'active'
  END;

  IF NEW.raw_user_meta_data ? 'institutionId' AND (NEW.raw_user_meta_data->>'institutionId') ~* '^[0-9a-f-]{36}$' THEN
    v_institution_id := (NEW.raw_user_meta_data->>'institutionId')::uuid;
  ELSE
    v_institution_id := NULL;
  END IF;

  INSERT INTO public.users_profile (
    id, email, name, role, status, institution_id,
    plan, credits, monthly_credits_limit, credits_reset_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    v_role, v_status, v_institution_id,
    'free', 100, 100, NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.credit_ledger (user_id, tx_type, amount, balance_after, description)
  VALUES (NEW.id, 'bonus', 100, 100, '신규 가입 보너스')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;


-- ── (2) 익명 → 정식 계정 승격 핸들러 ────────────────────────
-- 익명 사용자가 이메일을 붙여 정식 가입하면 그때 프로필을 만든다.
-- auth.users.id 가 유지되므로 익명 기간에 수집한 데이터가 전부 승계된다.
CREATE OR REPLACE FUNCTION handle_user_upgraded()
RETURNS TRIGGER AS $$
DECLARE
  v_role public.user_role;
  v_status public.user_status;
BEGIN
  -- 승격 판정: 이메일이 없다가 생겼고, 더 이상 익명이 아님
  IF OLD.email IS NOT NULL OR NEW.email IS NULL THEN
    RETURN NEW;
  END IF;
  IF COALESCE(NEW.is_anonymous, FALSE) THEN
    RETURN NEW;
  END IF;

  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student');
  v_status := CASE
    WHEN v_role IN ('instructor', 'institution_admin') THEN 'pending'
    ELSE 'active'
  END;

  INSERT INTO public.users_profile (
    id, email, name, role, status,
    plan, credits, monthly_credits_limit, credits_reset_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    v_role, v_status,
    'free', 100, 100, NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.credit_ledger (user_id, tx_type, amount, balance_after, description)
  VALUES (NEW.id, 'bonus', 100, 100, '신규 가입 보너스')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

DROP TRIGGER IF EXISTS on_auth_user_upgraded ON auth.users;
CREATE TRIGGER on_auth_user_upgraded
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_upgraded();
