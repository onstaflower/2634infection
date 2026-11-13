-- ================================================================
-- 감염병 워크시트 웹앱 Supabase Schema
-- 2634infection
-- ================================================================

-- 1. 학생 테이블
CREATE TABLE IF NOT EXISTS students (
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
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  session_number INTEGER NOT NULL CHECK (session_number BETWEEN 1 AND 12),
  activity_id TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, session_number, activity_id)
);

-- 3. 미디어 업로드 테이블
CREATE TABLE IF NOT EXISTS media_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  session_number INTEGER NOT NULL,
  activity_id TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'audio')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 차시 완료 현황 테이블
CREATE TABLE IF NOT EXISTS session_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  session_number INTEGER NOT NULL CHECK (session_number BETWEEN 1 AND 12),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, session_number)
);

-- ================================================================
-- RLS (Row Level Security) 설정
-- ================================================================

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_progress ENABLE ROW LEVEL SECURITY;

-- 학생 테이블: 누구나 읽기/쓰기 (학교 앱 특성상 anon 허용)
CREATE POLICY "students_all" ON students FOR ALL TO anon USING (true) WITH CHECK (true);

-- 제출 테이블: 누구나 읽기/쓰기
CREATE POLICY "submissions_all" ON submissions FOR ALL TO anon USING (true) WITH CHECK (true);

-- 미디어 테이블: 누구나 읽기/쓰기
CREATE POLICY "media_all" ON media_uploads FOR ALL TO anon USING (true) WITH CHECK (true);

-- 차시 진도 테이블: 누구나 읽기/쓰기
CREATE POLICY "progress_all" ON session_progress FOR ALL TO anon USING (true) WITH CHECK (true);

-- ================================================================
-- Storage bucket: media
-- (Supabase Dashboard에서 직접 생성 필요)
-- Storage > New bucket > 이름: media > Public bucket: ON
-- ================================================================

-- ================================================================
-- 유용한 뷰 (교사 대시보드용)
-- ================================================================

CREATE OR REPLACE VIEW teacher_dashboard AS
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
FROM students s
LEFT JOIN submissions sub ON sub.student_id = s.id
LEFT JOIN session_progress sp ON sp.student_id = s.id
GROUP BY s.id
ORDER BY s.class, s.number;

