-- ============================================
-- 012_auth_profile_alignment.sql
-- Align auth trigger and profile fields
-- ============================================

-- enterprise_tier storage for plan details
ALTER TABLE users_profile
  ADD COLUMN IF NOT EXISTS enterprise_tier JSONB;

-- Update new user handler to align credits/plan/status
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role;
  v_status user_status;
  v_institution_id UUID;
BEGIN
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student');
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
    id,
    email,
    name,
    role,
    status,
    institution_id,
    plan,
    credits,
    monthly_credits_limit,
    credits_reset_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    v_role,
    v_status,
    v_institution_id,
    'free',
    100,
    100,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- 신규 가입 보너스 크레딧 지급 (100 크레딧)
  INSERT INTO public.credit_ledger (user_id, tx_type, amount, balance_after, description)
  VALUES (
    NEW.id,
    'bonus',
    100,
    100,
    '신규 가입 보너스'
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS for AI services catalog
ALTER TABLE ai_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_service_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_services_select_active"
  ON ai_services FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "ai_services_admin_manage"
  ON ai_services FOR ALL
  USING (is_platform_admin());

CREATE POLICY "ai_service_tiers_select_active"
  ON ai_service_tiers FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "ai_service_tiers_admin_manage"
  ON ai_service_tiers FOR ALL
  USING (is_platform_admin());
