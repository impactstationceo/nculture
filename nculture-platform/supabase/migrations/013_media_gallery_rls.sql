-- ============================================
-- 013_media_gallery_rls.sql
-- Media gallery RLS policies
-- ============================================

ALTER TABLE media_gallery ENABLE ROW LEVEL SECURITY;

-- Public gallery or own content
CREATE POLICY "media_gallery_select_public_or_own"
  ON media_gallery FOR SELECT
  USING (
    is_public = TRUE OR
    user_id = auth.uid() OR
    is_platform_admin()
  );

-- Users can insert their own media
CREATE POLICY "media_gallery_insert_own"
  ON media_gallery FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own media
CREATE POLICY "media_gallery_update_own"
  ON media_gallery FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own media
CREATE POLICY "media_gallery_delete_own"
  ON media_gallery FOR DELETE
  USING (user_id = auth.uid());
