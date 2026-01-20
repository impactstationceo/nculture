-- ============================================
-- 011_backend_alignment.sql
-- Backend alignment for frontend integration
-- ============================================

-- 1) Session detail fields (summary/concepts/examples)
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS concepts JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS examples JSONB DEFAULT '[]';

-- 2) Live class enhancements
ALTER TABLE live_classes
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS participant_count INT DEFAULT 0;

-- 3) Live class participants
CREATE TABLE IF NOT EXISTS live_class_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  live_class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  UNIQUE(live_class_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_live_class_participants_class ON live_class_participants(live_class_id);
CREATE INDEX IF NOT EXISTS idx_live_class_participants_user ON live_class_participants(user_id);

ALTER TABLE live_class_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "live_class_participants_select_own_or_host"
  ON live_class_participants FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM live_classes lc
      WHERE lc.id = live_class_participants.live_class_id
        AND lc.host_id = auth.uid()
    ) OR
    is_platform_admin()
  );

-- Client writes handled by Edge Functions (service role)
CREATE POLICY "live_class_participants_insert_none"
  ON live_class_participants FOR INSERT
  WITH CHECK (FALSE);

CREATE POLICY "live_class_participants_update_none"
  ON live_class_participants FOR UPDATE
  USING (FALSE);

CREATE POLICY "live_class_participants_delete_none"
  ON live_class_participants FOR DELETE
  USING (FALSE);

-- 4) Credit transaction helper (ledger + profile sync)
CREATE OR REPLACE FUNCTION apply_credit_transaction(
  p_user_id UUID,
  p_amount INT,
  p_tx_type credit_tx_type,
  p_description TEXT DEFAULT NULL,
  p_ref_type VARCHAR DEFAULT NULL,
  p_ref_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance INT;
  v_available INT;
BEGIN
  -- Permission: allow self, platform admin, or service role
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id AND NOT is_platform_admin() THEN
    RAISE EXCEPTION 'permission denied';
  END IF;

  -- Prevent positive credits from client context
  IF auth.uid() IS NOT NULL AND NOT is_platform_admin() AND p_amount > 0 THEN
    RAISE EXCEPTION 'positive credit adjustments are not allowed';
  END IF;

  v_available := get_available_credits(p_user_id);
  IF p_amount < 0 AND (v_available + p_amount) < 0 THEN
    RAISE EXCEPTION 'insufficient credits';
  END IF;

  v_balance := get_credit_balance(p_user_id) + p_amount;

  INSERT INTO credit_ledger (
    user_id, tx_type, amount, balance_after, ref_type, ref_id, description, metadata
  )
  VALUES (
    p_user_id, p_tx_type, p_amount, v_balance, p_ref_type, p_ref_id, p_description, p_metadata
  );

  UPDATE users_profile
  SET credits = v_balance, updated_at = NOW()
  WHERE id = p_user_id;

  RETURN v_balance;
END;
$$;

GRANT EXECUTE ON FUNCTION apply_credit_transaction(
  UUID, INT, credit_tx_type, TEXT, VARCHAR, UUID, JSONB
) TO authenticated;
