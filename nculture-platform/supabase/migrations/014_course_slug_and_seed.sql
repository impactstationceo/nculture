-- ============================================
-- 014_course_slug_and_seed.sql
-- Course slug support and optional seed
-- ============================================

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS slug VARCHAR(100);

CREATE UNIQUE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);

-- Seed a demo course if an instructor exists
WITH instructor AS (
  SELECT id
  FROM users_profile
  WHERE role IN ('instructor', 'institution_admin', 'platform_admin')
  ORDER BY created_at ASC
  LIMIT 1
),
course AS (
  INSERT INTO courses (
    instructor_id,
    title,
    description,
    thumbnail_url,
    category,
    level,
    price_credits,
    status,
    is_featured,
    slug
  )
  SELECT
    instructor.id,
    '프롬프트로 AI 영상 만들기',
    '텍스트 프롬프트로 AI 영상을 생성하는 기초부터 고급 테크닉까지 학습합니다.',
    'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200',
    'video',
    'beginner',
    0,
    'published',
    TRUE,
    'course1'
  FROM instructor
  WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'course1')
  RETURNING id
)
INSERT INTO sessions (
  course_id,
  session_number,
  title,
  summary,
  description,
  concepts,
  examples,
  credits_provided,
  has_test,
  duration_seconds,
  sort_order
)
SELECT
  course.id,
  session_data.session_number,
  session_data.title,
  session_data.summary,
  session_data.summary,
  session_data.concepts,
  session_data.examples,
  20,
  FALSE,
  900,
  session_data.session_number
FROM course
JOIN LATERAL (
  VALUES
    (1, '첫 영상 AI 경험', '텍스트 프롬프트로 영상 생성의 기본 원리 이해',
      '["AI 영상 생성 기본 흐름", "프롬프트 구조"]'::jsonb,
      '[{"label":"기초","prompt":"도시의 밤하늘을 배경으로 한 시네마틱 드론 샷"}]'::jsonb),
    (2, '프롬프트 4요소', '주체·행동·공간·분위기 구조화 학습',
      '["주체와 행동", "공간과 분위기"]'::jsonb,
      '[{"label":"구조","prompt":"해변에서 석양을 바라보는 실루엣, 따뜻한 톤"}]'::jsonb),
    (3, '카메라 움직임', '팬/틸트/돌리로 장면 연출하기',
      '["카메라 무빙", "샷 구성"]'::jsonb,
      '[{"label":"무빙","prompt":"도심을 가로지르는 드론 돌리 샷"}]'::jsonb),
    (4, '조명과 색감', '조명 방향과 색감으로 분위기 만들기',
      '["라이트 세팅", "컬러 그레이딩"]'::jsonb,
      '[{"label":"조명","prompt":"네온사인이 비추는 거리, 블루 톤"}]'::jsonb),
    (5, '스토리 구성', '짧은 시나리오로 영상 완성도 높이기',
      '["3막 구조", "전환 구성"]'::jsonb,
      '[{"label":"스토리","prompt":"새벽 도시에서 시작해 해 뜨는 장면으로 전환"}]'::jsonb),
    (6, '최종 실습', '결과물 완성 및 피드백',
      '["완성도 체크리스트", "수정 포인트"]'::jsonb,
      '[{"label":"실습","prompt":"미래 도시의 일출, 시네마틱 톤"}]'::jsonb)
) AS session_data(session_number, title, summary, concepts, examples) ON TRUE
-- ON TRUE 필수: 없으면 Postgres가 아래 ON CONFLICT 의 ON 을 이 LATERAL 조인의
-- 조인 조건으로 파싱해 "syntax error at or near DO" 로 실패한다.
ON CONFLICT (course_id, session_number) DO NOTHING;
