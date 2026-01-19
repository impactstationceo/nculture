-- ============================================
-- nCulture RLS Policies
-- Row Level Security for all tables
-- ============================================

-- Enable RLS on all tables
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Helper Functions for RLS
-- ============================================

-- 현재 사용자의 role 조회
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM users_profile WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 현재 사용자의 institution_id 조회
CREATE OR REPLACE FUNCTION get_my_institution_id()
RETURNS UUID AS $$
  SELECT institution_id FROM users_profile WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Platform Admin 여부
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users_profile 
    WHERE id = auth.uid() AND role = 'platform_admin'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Institution Admin 여부
CREATE OR REPLACE FUNCTION is_institution_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users_profile 
    WHERE id = auth.uid() AND role = 'institution_admin'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Instructor 여부
CREATE OR REPLACE FUNCTION is_instructor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users_profile 
    WHERE id = auth.uid() AND role IN ('instructor', 'institution_admin', 'platform_admin')
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================
-- 1. INSTITUTIONS RLS
-- ============================================

-- SELECT: 모두 조회 가능 (활성 기관만)
CREATE POLICY "institutions_select_active"
  ON institutions FOR SELECT
  USING (status = 'active' OR is_platform_admin());

-- INSERT: Platform Admin만
CREATE POLICY "institutions_insert_admin"
  ON institutions FOR INSERT
  WITH CHECK (is_platform_admin());

-- UPDATE: Platform Admin 또는 해당 기관 관리자
CREATE POLICY "institutions_update"
  ON institutions FOR UPDATE
  USING (
    is_platform_admin() OR 
    (is_institution_admin() AND id = get_my_institution_id())
  );

-- DELETE: Platform Admin만
CREATE POLICY "institutions_delete_admin"
  ON institutions FOR DELETE
  USING (is_platform_admin());

-- ============================================
-- 2. USERS_PROFILE RLS
-- ============================================

-- SELECT: 자신 또는 Admin
CREATE POLICY "users_profile_select_own"
  ON users_profile FOR SELECT
  USING (
    id = auth.uid() OR 
    is_platform_admin() OR
    (is_institution_admin() AND institution_id = get_my_institution_id())
  );

-- INSERT: 서비스 역할만 (trigger에서 처리)
-- 클라이언트 직접 INSERT 금지
CREATE POLICY "users_profile_insert_none"
  ON users_profile FOR INSERT
  WITH CHECK (FALSE); -- trigger가 SECURITY DEFINER로 처리

-- UPDATE: 자신만 (role 변경 불가)
CREATE POLICY "users_profile_update_own"
  ON users_profile FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND
    -- role, status는 변경 불가 (Admin API로만)
    role = (SELECT role FROM users_profile WHERE id = auth.uid()) AND
    status = (SELECT status FROM users_profile WHERE id = auth.uid())
  );

-- Platform Admin은 모든 필드 수정 가능
CREATE POLICY "users_profile_update_admin"
  ON users_profile FOR UPDATE
  USING (is_platform_admin());

-- Institution Admin은 자기 기관 멤버만 수정
CREATE POLICY "users_profile_update_inst_admin"
  ON users_profile FOR UPDATE
  USING (
    is_institution_admin() AND 
    institution_id = get_my_institution_id() AND
    id != auth.uid() -- 자기 자신은 위 정책으로
  );

-- DELETE: Platform Admin만
CREATE POLICY "users_profile_delete_admin"
  ON users_profile FOR DELETE
  USING (is_platform_admin());

-- ============================================
-- 3. COURSES RLS
-- ============================================

-- SELECT: published는 모두, draft는 작성자/Admin만
CREATE POLICY "courses_select_published"
  ON courses FOR SELECT
  USING (
    status = 'published' OR
    instructor_id = auth.uid() OR
    is_platform_admin() OR
    (is_institution_admin() AND institution_id = get_my_institution_id())
  );

-- INSERT: Instructor 이상
CREATE POLICY "courses_insert_instructor"
  ON courses FOR INSERT
  WITH CHECK (
    is_instructor() AND
    instructor_id = auth.uid()
  );

-- UPDATE: 작성자 또는 Admin
CREATE POLICY "courses_update"
  ON courses FOR UPDATE
  USING (
    instructor_id = auth.uid() OR
    is_platform_admin() OR
    (is_institution_admin() AND institution_id = get_my_institution_id())
  );

-- DELETE: 작성자 또는 Platform Admin
CREATE POLICY "courses_delete"
  ON courses FOR DELETE
  USING (
    instructor_id = auth.uid() OR
    is_platform_admin()
  );

-- ============================================
-- 4. SESSIONS RLS
-- ============================================

-- SELECT: 코스 접근 권한이 있으면 조회 가능
CREATE POLICY "sessions_select"
  ON sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = sessions.course_id AND (
        c.status = 'published' OR
        c.instructor_id = auth.uid() OR
        is_platform_admin()
      )
    )
  );

-- INSERT/UPDATE/DELETE: 코스 작성자 또는 Admin
CREATE POLICY "sessions_modify"
  ON sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = sessions.course_id AND (
        c.instructor_id = auth.uid() OR
        is_platform_admin()
      )
    )
  );

-- ============================================
-- 5. VIDEO_ASSETS RLS
-- ============================================

-- SELECT: 업로더 또는 Admin, 또는 세션에 연결된 경우
CREATE POLICY "video_assets_select"
  ON video_assets FOR SELECT
  USING (
    uploader_id = auth.uid() OR
    is_platform_admin() OR
    EXISTS (
      SELECT 1 FROM sessions s
      JOIN courses c ON c.id = s.course_id
      WHERE s.video_asset_id = video_assets.id AND c.status = 'published'
    )
  );

-- INSERT: Instructor 이상
CREATE POLICY "video_assets_insert"
  ON video_assets FOR INSERT
  WITH CHECK (
    is_instructor() AND
    uploader_id = auth.uid()
  );

-- UPDATE/DELETE: 업로더 또는 Admin
CREATE POLICY "video_assets_modify"
  ON video_assets FOR UPDATE
  USING (uploader_id = auth.uid() OR is_platform_admin());

CREATE POLICY "video_assets_delete"
  ON video_assets FOR DELETE
  USING (uploader_id = auth.uid() OR is_platform_admin());

-- ============================================
-- 6. ENROLLMENTS RLS
-- ============================================

-- SELECT: 자신 또는 코스 강사 또는 Admin
CREATE POLICY "enrollments_select"
  ON enrollments FOR SELECT
  USING (
    user_id = auth.uid() OR
    is_platform_admin() OR
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = enrollments.course_id AND c.instructor_id = auth.uid()
    )
  );

-- INSERT: 자신만 (수강 신청)
CREATE POLICY "enrollments_insert"
  ON enrollments FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE: 자신 또는 강사 또는 Admin
CREATE POLICY "enrollments_update"
  ON enrollments FOR UPDATE
  USING (
    user_id = auth.uid() OR
    is_platform_admin() OR
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = enrollments.course_id AND c.instructor_id = auth.uid()
    )
  );

-- DELETE: 자신 또는 Admin
CREATE POLICY "enrollments_delete"
  ON enrollments FOR DELETE
  USING (user_id = auth.uid() OR is_platform_admin());

-- ============================================
-- 7. PROGRESS RLS
-- ============================================

-- SELECT/INSERT/UPDATE: 자신만
CREATE POLICY "progress_own"
  ON progress FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admin은 조회만
CREATE POLICY "progress_admin_select"
  ON progress FOR SELECT
  USING (is_platform_admin());

-- ============================================
-- 8. CREDIT_LEDGER RLS (매우 중요!)
-- ============================================

-- SELECT: 자신만 (Admin도 Edge Function 통해서만)
CREATE POLICY "credit_ledger_select_own"
  ON credit_ledger FOR SELECT
  USING (user_id = auth.uid());

-- INSERT: 클라이언트 직접 INSERT 금지 (Edge Function만)
CREATE POLICY "credit_ledger_insert_none"
  ON credit_ledger FOR INSERT
  WITH CHECK (FALSE);

-- UPDATE/DELETE: 절대 금지 (Immutable)
CREATE POLICY "credit_ledger_no_update"
  ON credit_ledger FOR UPDATE
  USING (FALSE);

CREATE POLICY "credit_ledger_no_delete"
  ON credit_ledger FOR DELETE
  USING (FALSE);

-- ============================================
-- 9. CREDIT_RESERVATIONS RLS
-- ============================================

-- SELECT: 자신만
CREATE POLICY "credit_reservations_select_own"
  ON credit_reservations FOR SELECT
  USING (user_id = auth.uid());

-- INSERT/UPDATE: 클라이언트 직접 접근 금지 (Edge Function만)
CREATE POLICY "credit_reservations_insert_none"
  ON credit_reservations FOR INSERT
  WITH CHECK (FALSE);

CREATE POLICY "credit_reservations_update_none"
  ON credit_reservations FOR UPDATE
  USING (FALSE);

-- ============================================
-- 10. AI_JOBS RLS
-- ============================================

-- SELECT: 자신의 job만
CREATE POLICY "ai_jobs_select_own"
  ON ai_jobs FOR SELECT
  USING (user_id = auth.uid() OR is_platform_admin());

-- INSERT: 클라이언트 직접 INSERT 금지 (Edge Function만)
CREATE POLICY "ai_jobs_insert_none"
  ON ai_jobs FOR INSERT
  WITH CHECK (FALSE);

-- UPDATE: 클라이언트 직접 UPDATE 금지
CREATE POLICY "ai_jobs_update_none"
  ON ai_jobs FOR UPDATE
  USING (FALSE);

-- DELETE: 금지
CREATE POLICY "ai_jobs_delete_none"
  ON ai_jobs FOR DELETE
  USING (FALSE);

-- ============================================
-- 11. PAYMENTS RLS
-- ============================================

-- SELECT: 자신만
CREATE POLICY "payments_select_own"
  ON payments FOR SELECT
  USING (user_id = auth.uid() OR is_platform_admin());

-- INSERT/UPDATE: 클라이언트 직접 접근 금지
CREATE POLICY "payments_insert_none"
  ON payments FOR INSERT
  WITH CHECK (FALSE);

CREATE POLICY "payments_update_none"
  ON payments FOR UPDATE
  USING (FALSE);

-- ============================================
-- 12. PAYMENT_EVENTS RLS
-- ============================================

-- 모든 접근 금지 (서버만)
CREATE POLICY "payment_events_none"
  ON payment_events FOR ALL
  USING (FALSE);

-- ============================================
-- 13. LIVE_CLASSES RLS
-- ============================================

-- SELECT: published/scheduled는 모두, 그 외 호스트/Admin
CREATE POLICY "live_classes_select"
  ON live_classes FOR SELECT
  USING (
    status IN ('scheduled', 'live') OR
    host_id = auth.uid() OR
    is_platform_admin()
  );

-- INSERT: Instructor 이상
CREATE POLICY "live_classes_insert"
  ON live_classes FOR INSERT
  WITH CHECK (is_instructor() AND host_id = auth.uid());

-- UPDATE/DELETE: 호스트 또는 Admin
CREATE POLICY "live_classes_modify"
  ON live_classes FOR UPDATE
  USING (host_id = auth.uid() OR is_platform_admin());

CREATE POLICY "live_classes_delete"
  ON live_classes FOR DELETE
  USING (host_id = auth.uid() OR is_platform_admin());

-- ============================================
-- 14. AUDIT_LOGS RLS
-- ============================================

-- Platform Admin만 조회
CREATE POLICY "audit_logs_admin_only"
  ON audit_logs FOR SELECT
  USING (is_platform_admin());

-- INSERT: 서버만 (클라이언트 금지)
CREATE POLICY "audit_logs_insert_none"
  ON audit_logs FOR INSERT
  WITH CHECK (FALSE);

-- UPDATE/DELETE: 금지
CREATE POLICY "audit_logs_no_modify"
  ON audit_logs FOR UPDATE
  USING (FALSE);

CREATE POLICY "audit_logs_no_delete"
  ON audit_logs FOR DELETE
  USING (FALSE);

-- ============================================
-- Storage Bucket Policies (별도 설정 필요)
-- ============================================

-- Supabase Dashboard에서 설정:
-- 1. avatars bucket: 사용자별 폴더, 본인만 업로드/삭제
-- 2. course-assets bucket: instructor만 업로드, public 읽기
-- 3. ai-outputs bucket: 시스템만 업로드, 본인만 읽기
-- 4. video-uploads bucket: instructor만 업로드, signed URL로 접근
