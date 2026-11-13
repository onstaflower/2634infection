import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ouvfoiokkbejgcggdvma.supabase.co'
const supabaseAnonKey = 'sb_publishable_ahZJ8TgTkzLrvYtEkQXsVQ_21WU2qJM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/** 학생 조회 또는 신규 등록 */
export async function findOrCreateStudent({ grade, class: cls, group_num, number, name }) {
  const { data: existing } = await supabase
    .from('inf_students')
    .select('*')
    .eq('grade', grade)
    .eq('class', cls)
    .eq('number', number)
    .eq('name', name)
    .maybeSingle()

  if (existing) return { data: existing, error: null }

  const { data, error } = await supabase
    .from('inf_students')
    .insert({ grade, class: cls, group_num, number, name })
    .select()
    .single()

  return { data, error }
}

/** 활동 내용 저장 (upsert) */
export async function saveSubmission({ studentId, sessionNumber, activityId, content }) {
  const { data, error } = await supabase
    .from('inf_submissions')
    .upsert(
      {
        student_id: studentId,
        session_number: sessionNumber,
        activity_id: activityId,
        content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'student_id,session_number,activity_id' }
    )
    .select()
    .single()

  return { data, error }
}

/** 학생의 모든 제출 내용 조회 */
export async function getStudentSubmissions(studentId) {
  const { data, error } = await supabase
    .from('inf_submissions')
    .select('*')
    .eq('student_id', studentId)
    .order('session_number', { ascending: true })

  return { data, error }
}

/** 차시별 완료 현황 조회 */
export async function getSessionProgress(studentId) {
  const { data, error } = await supabase
    .from('inf_session_progress')
    .select('*')
    .eq('student_id', studentId)

  return { data, error }
}

/** 차시 완료 처리 */
export async function markSessionComplete(studentId, sessionNumber) {
  const { data, error } = await supabase
    .from('inf_session_progress')
    .upsert(
      { student_id: studentId, session_number: sessionNumber },
      { onConflict: 'student_id,session_number' }
    )
    .select()
    .single()

  return { data, error }
}

/** 미디어 파일 업로드 (사진, 음성) */
export async function uploadMedia(studentId, sessionNumber, activityId, file, fileType) {
  const ext = fileType === 'audio' ? 'webm' : file.name?.split('.').pop() || 'jpg'
  const path = `infection/${studentId}/${sessionNumber}/${activityId}_${Date.now()}.${ext}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('2634infection')
    .upload(path, file, { contentType: file.type, upsert: true })

  if (uploadError) return { data: null, error: uploadError }

  const { data: { publicUrl } } = supabase.storage.from('2634infection').getPublicUrl(path)

  const { data, error } = await supabase
    .from('inf_media_uploads')
    .insert({
      student_id: studentId,
      session_number: sessionNumber,
      activity_id: activityId,
      file_url: publicUrl,
      file_type: fileType,
    })
    .select()
    .single()

  return { data: { ...data, publicUrl }, error }
}

/** 학생 미디어 조회 */
export async function getStudentMedia(studentId) {
  const { data, error } = await supabase
    .from('inf_media_uploads')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: true })

  return { data, error }
}

/** [교사용] 전체 학생 제출 현황 */
export async function getAllStudents() {
  const { data, error } = await supabase
    .from('inf_students')
    .select(`
      *,
      inf_submissions(count),
      inf_session_progress(session_number)
    `)
    .order('class', { ascending: true })
    .order('number', { ascending: true })

  // 호환성을 위해 키 이름 매핑
  const formatted = data?.map(s => ({
    ...s,
    submissions: s.inf_submissions,
    session_progress: s.inf_session_progress,
  }))

  return { data: formatted, error }
}

/** [교사용] 특정 학생 전체 제출 내용 */
export async function getStudentFullData(studentId) {
  const [{ data: student }, { data: submissions }, { data: media }] = await Promise.all([
    supabase.from('inf_students').select('*').eq('id', studentId).single(),
    supabase.from('inf_submissions').select('*').eq('student_id', studentId).order('session_number'),
    supabase.from('inf_media_uploads').select('*').eq('student_id', studentId),
  ])

  return { student, submissions, media }
}
