-- ================================================================
-- 감염병 워크시트 웹앱 Supabase Schema (접두사: inf_)
-- 2634infection (타 프로젝트와 공유 안전 모드)
-- ================================================================

-- 1. 학생 테이블
CREATE TABLE IF NOT EXISTS inf_students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grade INTEGER NOT NULL,
  class INTEGER NOT NULL,
  group_num INTEGER,
  number INTEGER NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(grade, class, number, name)
);

-- 2. 활동 제출 테이블 (upsert 기반)
CREATE TABLE IF NOT EXISTS inf_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES inf_students(id) ON DELETE CASCADE NOT NULL,
  session_number INTEGER NOT NULL CHECK (session_number BETWEEN 1 AND 12),
  activity_id TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, session_number, activity_id)
);

-- 3. 미디어 업로드 테이블
CREATE TABLE IF NOT EXISTS inf_media_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES inf_students(id) ON DELETE CASCADE NOT NULL,
  session_number INTEGER NOT NULL,
  activity_id TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'audio')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 차시 완료 현황 테이블
CREATE TABLE IF NOT EXISTS inf_session_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES inf_students(id) ON DELETE CASCADE NOT NULL,
  session_number INTEGER NOT NULL CHECK (session_number BETWEEN 1 AND 12),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, session_number)
);

-- ================================================================
-- RLS (Row Level Security) 설정
-- ================================================================

ALTER TABLE inf_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE inf_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inf_media_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE inf_session_progress ENABLE ROW LEVEL SECURITY;

-- 기존 정책 있을 경우 대비 DROP 후 재생성
DROP POLICY IF EXISTS "inf_students_all" ON inf_students;
CREATE POLICY "inf_students_all" ON inf_students FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "inf_submissions_all" ON inf_submissions;
CREATE POLICY "inf_submissions_all" ON inf_submissions FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "inf_media_all" ON inf_media_uploads;
CREATE POLICY "inf_media_all" ON inf_media_uploads FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "inf_progress_all" ON inf_session_progress;
CREATE POLICY "inf_progress_all" ON inf_session_progress FOR ALL TO anon USING (true) WITH CHECK (true);

-- ================================================================
-- 유용한 뷰 (교사 대시보드용)
-- ================================================================

CREATE OR REPLACE VIEW inf_teacher_dashboard AS
SELECT 
  s.id,
  s.grade,
  s.class,
  s.group_num,
  s.number,
  s.name,
  COUNT(DISTINCT sub.session_number) AS sessions_submitted,
  COUNT(DISTINCT sp.session_number) AS sessions_completed,
  s.created_at
FROM inf_students s
LEFT JOIN inf_submissions sub ON sub.student_id = s.id
LEFT JOIN inf_session_progress sp ON sp.student_id = s.id
GROUP BY s.id
ORDER BY s.class, s.number;
