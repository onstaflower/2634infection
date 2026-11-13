import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { sessions } from '../data/sessions'
import { saveSubmission, getStudentSubmissions, markSessionComplete } from '../lib/supabase'
import TextInput from '../components/activities/TextInput'
import Quiz from '../components/activities/Quiz'
import SketchPad from '../components/activities/SketchPad'
import VoiceRecorder from '../components/activities/VoiceRecorder'
import MindMap from '../components/activities/MindMap'
import Checklist from '../components/activities/Checklist'
import PhotoUpload from '../components/activities/PhotoUpload'
import Toast from '../components/layout/Toast'

export default function Session({ student }) {
  const { id } = useParams()
  const sessionNum = Number(id)
  const session = sessions.find(s => s.id === sessionNum)

  const [answers, setAnswers] = useState({})
  const [saving, setSaving] = useState({})
  const [toast, setToast] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [activeTab, setActiveTab] = useState('learn') // 'learn' | 'do' | 'reflect'

  const showToast = (msg, type='success') => { setToast({msg, type}); setTimeout(()=>setToast(null), 3000) }

  // 기존 답변 불러오기
  useEffect(() => {
    if (!session) return
    getStudentSubmissions(student.id).then(({ data }) => {
      if (!data) return
      const mine = data.filter(d => d.session_number === sessionNum)
      const loaded = {}
      mine.forEach(d => { loaded[d.activity_id] = d.content })
      setAnswers(loaded)
    })
  }, [student.id, sessionNum, session])

  const handleSave = useCallback(async (activityId, content) => {
    setSaving(p => ({ ...p, [activityId]: true }))
    const { error } = await saveSubmission({ studentId: student.id, sessionNumber: sessionNum, activityId, content })
    setSaving(p => ({ ...p, [activityId]: false }))
    if (error) showToast('저장 실패. 다시 시도해보세요.', 'error')
    else {
      setAnswers(p => ({ ...p, [activityId]: content }))
      showToast('💾 저장되었어요!')
    }
  }, [student.id, sessionNum])

  const handleComplete = async () => {
    // 포트폴리오 답변 저장
    const portfolioAnswer = answers['portfolio'] || {}
    if (portfolioAnswer.text) {
      await saveSubmission({ studentId: student.id, sessionNumber: sessionNum, activityId: 'portfolio', content: portfolioAnswer })
    }
    await markSessionComplete(student.id, sessionNum)
    setCompleted(true)
    showToast('🎉 차시를 완료했어요!', 'success')
  }

  if (!session) return <div style={{textAlign:'center', padding:48}}><p>차시를 찾을 수 없어요.</p><Link to="/home">홈으로</Link></div>

  const renderActivity = (act) => {
    const saved = answers[act.id]
    const isSaving = saving[act.id]
    const props = { activity: act, saved, isSaving, onSave: (content) => handleSave(act.id, content), student }

    switch (act.type) {
      case 'text_input':  return <TextInput {...props} />
      case 'quiz':        return <Quiz {...props} />
      case 'sketch':      return <SketchPad {...props} />
      case 'voice':       return <VoiceRecorder {...props} />
      case 'mindmap':     return <MindMap {...props} />
      case 'checklist':   return <Checklist {...props} />
      case 'photo_upload': return <PhotoUpload {...props} />
      default:            return null
    }
  }

  return (
    <div style={styles.wrap}>
      {/* 상단 네비 */}
      <header style={styles.nav}>
        <Link to="/home" className="btn btn-ghost btn-sm">← 차시 목록</Link>
        <div style={styles.navCenter}>
          <span style={{fontSize:20}}>{session.emoji}</span>
          <span style={{fontWeight:900, fontSize:16}}>{session.id}차시 — {session.title}</span>
          <span style={{...styles.phaseBadge, background:`${session.phaseColor}22`, color:session.phaseColor}}>{session.phase}</span>
        </div>
        <Link to="/portfolio" className="btn btn-secondary btn-sm">📚 포트폴리오</Link>
      </header>

      <main style={styles.main}>
        {/* 탭 */}
        <div style={styles.tabs}>
          {[['learn','📖 탐구 자료'], ['do','✏️ 활동하기'], ['reflect','📝 오늘 정리']].map(([k,label])=>(
            <button key={k} onClick={()=>setActiveTab(k)} style={{...styles.tab, ...(activeTab===k ? styles.tabActive : {})}}>
              {label}
            </button>
          ))}
        </div>

        {/* 학습 목표 & 핵심 질문 */}
        {activeTab === 'learn' && (
          <div>
            <div className="card" style={{marginBottom:20, background:'linear-gradient(135deg, #FFF3EC, #FFF9F5)'}}>
              <div style={styles.goalRow}>
                <span style={styles.goalIcon}>🎯</span>
                <div>
                  <div style={styles.goalLabel}>오늘의 학습 목표</div>
                  <div style={styles.goalText}>{session.learningGoal}</div>
                </div>
              </div>
              <div style={styles.goalRow}>
                <span style={styles.goalIcon}>🔍</span>
                <div>
                  <div style={styles.goalLabel}>탐구 질문</div>
                  <div style={styles.goalText}>{session.coreQuestion}</div>
                </div>
              </div>
            </div>

            {/* 학습 자료 카드들 */}
            {session.materials.map((mat, i) => (
              <div className="card" key={i} style={{marginBottom:16}}>
                <div style={styles.matHeader}>
                  <span style={{fontSize:28}}>{mat.emoji}</span>
                  <span style={styles.matTitle}>{mat.title}</span>
                </div>
                <div style={styles.matContent}>
                  {mat.content.split('\n').map((line, li) => (
                    <p key={li} style={{marginBottom: line === '' ? 8 : 4, color: line.startsWith('•') || line.match(/^[🌟📌💡❌✅🔵🟡📏⏱️🐀😰📛🌍👶😰📛]/) ? 'var(--text)' : 'inherit'}}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            <button className="btn btn-primary" style={{width:'100%', justifyContent:'center', marginTop:8}} onClick={()=>setActiveTab('do')}>
              활동 시작하기 →
            </button>
          </div>
        )}

        {/* 활동 */}
        {activeTab === 'do' && (
          <div style={{display:'flex', flexDirection:'column', gap:20}}>
            {session.activities.map((act) => (
              <div className="card" key={act.id}>
                <div style={styles.actHeader}>
                  <h3 style={styles.actTitle}>{act.title}</h3>
                  {saving[act.id] && <span style={styles.savingBadge}>저장 중...</span>}
                  {!saving[act.id] && answers[act.id] && <span style={styles.savedBadge}>✅ 저장됨</span>}
                </div>
                <p style={styles.actInstruction}>{act.instruction}</p>
                {renderActivity(act)}
              </div>
            ))}

            <button className="btn btn-primary" style={{width:'100%', justifyContent:'center'}} onClick={()=>setActiveTab('reflect')}>
              오늘 정리하기 →
            </button>
          </div>
        )}

        {/* 성찰 / 포트폴리오 */}
        {activeTab === 'reflect' && (
          <div>
            <div className="card" style={{marginBottom:20}}>
              <h3 className="section-title">📝 오늘 배운 것 정리 (포트폴리오)</h3>
              <p style={{color:'var(--text-light)', fontSize:14, marginBottom:16}}>{session.portfolioPrompt}</p>
              <textarea
                className="input"
                rows={6}
                placeholder="오늘 탐구한 내용을 자유롭게 정리해보세요..."
                value={answers['portfolio']?.text || ''}
                onChange={e => setAnswers(p => ({...p, portfolio:{text:e.target.value}}))}
              />
              <button
                className="btn btn-secondary"
                style={{marginTop:12}}
                onClick={() => handleSave('portfolio', {text: answers['portfolio']?.text || ''})}
                disabled={saving['portfolio']}
              >
                💾 정리 저장
              </button>
            </div>

            {!completed ? (
              <button className="btn btn-primary btn-lg" style={{width:'100%', justifyContent:'center'}} onClick={handleComplete}>
                🎉 {session.id}차시 완료!
              </button>
            ) : (
              <div style={styles.completedBox}>
                <div style={{fontSize:48, marginBottom:12}}>🎉</div>
                <div style={{fontWeight:900, fontSize:20, color:'var(--secondary)', marginBottom:8}}>{session.id}차시 완료!</div>
                <div style={{color:'var(--text-light)', marginBottom:20}}>수고했어요! 다음 차시로 이동할까요?</div>
                {session.id < 12 && (
                  <Link to={`/session/${session.id + 1}`} className="btn btn-primary">
                    {session.id + 1}차시 이동 →
                  </Link>
                )}
                {session.id === 12 && (
                  <Link to="/portfolio" className="btn btn-secondary">
                    📚 나의 포트폴리오 보기
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}

const styles = {
  wrap: { minHeight:'100vh', display:'flex', flexDirection:'column' },
  nav: { background:'white', borderBottom:'1px solid var(--border)', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap', position:'sticky', top:0, zIndex:100 },
  navCenter: { display:'flex', alignItems:'center', gap:8, flex:1, justifyContent:'center', flexWrap:'wrap' },
  phaseBadge: { borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:700 },
  main: { flex:1, maxWidth:800, margin:'0 auto', padding:'28px 20px', width:'100%' },
  tabs: { display:'flex', gap:8, marginBottom:24, background:'white', borderRadius:12, padding:6, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' },
  tab: { flex:1, padding:'10px 8px', border:'none', borderRadius:8, background:'transparent', cursor:'pointer', fontFamily:'var(--font)', fontWeight:700, fontSize:14, color:'var(--text-light)', transition:'all 0.2s' },
  tabActive: { background:'var(--primary)', color:'white' },
  goalRow: { display:'flex', alignItems:'flex-start', gap:12, marginBottom:16 },
  goalIcon: { fontSize:20, flexShrink:0 },
  goalLabel: { fontSize:11, fontWeight:700, color:'var(--text-light)', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 },
  goalText: { fontSize:15, fontWeight:600, color:'var(--text)', lineHeight:1.6 },
  matHeader: { display:'flex', alignItems:'center', gap:12, marginBottom:12 },
  matTitle: { fontSize:17, fontWeight:900, color:'var(--text)' },
  matContent: { fontSize:14, lineHeight:1.8, color:'var(--text)', whiteSpace:'pre-wrap' },
  actHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 },
  actTitle: { fontSize:16, fontWeight:900, color:'var(--text)' },
  savingBadge: { fontSize:12, color:'var(--text-light)', fontWeight:600 },
  savedBadge: { fontSize:12, color:'var(--secondary)', fontWeight:700 },
  actInstruction: { fontSize:14, color:'var(--text-light)', marginBottom:16, lineHeight:1.6 },
  completedBox: { background:'linear-gradient(135deg,#EDFAF3,#FFF9EC)', borderRadius:20, padding:'32px 24px', textAlign:'center' },
}

