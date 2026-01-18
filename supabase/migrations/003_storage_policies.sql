-- 003_storage_policies.sql
-- Supabase Storage 버킷 및 정책

-- ============================================
-- 버킷 생성
-- ============================================

-- 아바타 이미지 버킷 (공개)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 코스 에셋 버킷 (공개)
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-assets', 'course-assets', true)
ON CONFLICT (id) DO NOTHING;

-- AI 생성 결과물 버킷 (비공개)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ai-outputs', 'ai-outputs', false)
ON CONFLICT (id) DO NOTHING;

-- 비디오 업로드 임시 버킷 (비공개)
INSERT INTO storage.buckets (id, name, public)
VALUES ('video-uploads', 'video-uploads', false)
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- Avatars 버킷 정책
-- ============================================

-- 누구나 아바타 조회 가능
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 사용자는 자신의 아바타만 업로드 가능
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 사용자는 자신의 아바타만 수정 가능
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 사용자는 자신의 아바타만 삭제 가능
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);


-- ============================================
-- Course Assets 버킷 정책
-- ============================================

-- 누구나 코스 에셋 조회 가능
CREATE POLICY "Anyone can view course assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-assets');

-- 강사/관리자만 코스 에셋 업로드 가능
CREATE POLICY "Instructors can upload course assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-assets' AND
  EXISTS (
    SELECT 1 FROM public.users_profile
    WHERE id = auth.uid()
    AND role IN ('instructor', 'institution_admin', 'platform_admin')
  )
);

-- 강사/관리자만 코스 에셋 수정 가능
CREATE POLICY "Instructors can update course assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-assets' AND
  EXISTS (
    SELECT 1 FROM public.users_profile
    WHERE id = auth.uid()
    AND role IN ('instructor', 'institution_admin', 'platform_admin')
  )
);

-- 강사/관리자만 코스 에셋 삭제 가능
CREATE POLICY "Instructors can delete course assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-assets' AND
  EXISTS (
    SELECT 1 FROM public.users_profile
    WHERE id = auth.uid()
    AND role IN ('instructor', 'institution_admin', 'platform_admin')
  )
);


-- ============================================
-- AI Outputs 버킷 정책
-- ============================================

-- 사용자는 자신의 AI 생성물만 조회 가능
CREATE POLICY "Users can view their own AI outputs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'ai-outputs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Service Role만 AI 생성물 업로드 가능 (Worker에서 사용)
-- (Service Role은 RLS 우회하므로 별도 정책 불필요)

-- 사용자는 자신의 AI 생성물만 삭제 가능
CREATE POLICY "Users can delete their own AI outputs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ai-outputs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);


-- ============================================
-- Video Uploads 버킷 정책
-- ============================================

-- 강사/관리자는 자신의 비디오 업로드 조회 가능
CREATE POLICY "Instructors can view their video uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'video-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  EXISTS (
    SELECT 1 FROM public.users_profile
    WHERE id = auth.uid()
    AND role IN ('instructor', 'institution_admin', 'platform_admin')
  )
);

-- 강사/관리자는 비디오 업로드 가능
CREATE POLICY "Instructors can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'video-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  EXISTS (
    SELECT 1 FROM public.users_profile
    WHERE id = auth.uid()
    AND role IN ('instructor', 'institution_admin', 'platform_admin')
  )
);

-- 강사/관리자는 자신의 비디오 업로드 삭제 가능
CREATE POLICY "Instructors can delete their video uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'video-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  EXISTS (
    SELECT 1 FROM public.users_profile
    WHERE id = auth.uid()
    AND role IN ('instructor', 'institution_admin', 'platform_admin')
  )
);


-- ============================================
-- 파일 크기 제한 (옵션)
-- ============================================
-- Note: Supabase 대시보드에서 설정하거나 Edge Function에서 검증
-- avatars: 2MB
-- course-assets: 50MB
-- ai-outputs: 100MB
-- video-uploads: 500MB
