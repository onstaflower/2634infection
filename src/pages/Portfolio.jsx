import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { sessions, UNIT_INFO } from '../data/sessions'
import { getStudentSubmissions, getSessionProgress } from '../lib/supabase'

const phaseBg = { '도입':'#FFF0EB', '탐구':'#EDFAF3', '적용':'#EDF5FF', '발표':'#F3EFFF', '성찰':'#FFF8EC' }

export default function Portfolio({ student, onLogout }) {
  const [submissions, setSubmissions] = useState({})
  const [completed, setCompleted] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getStudentSubmissions(student.id),
      getSessionProgress(student.id),
    ]).then(([{ data: subs }, { data: prog }]) => {
      if (subs) {
        const map = {}
        subs.forEach(s => {
          if (!map[s.session_number]) map[s.session_number] = {}
          map[s.session_number][s.activity_id] = s.content
        })
        setSubmissions(map)
      }
      if (prog) setCompleted(new Set(prog.map(p => p.session_number)))
      setLoading(false)
    })
  }, [student.id])

  const pct = Math.round((completed.size / UNIT_INFO.totalSessions) * 100)

  if (loading) return <div style={{textAlign:'center', padding:48}}><div className="spinner" /></div>

  return (
    <div style={styles.wrap}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <Link to="/home" className="btn btn-ghost btn-sm">← 차시 목록</Link>
          <div style={{fontWeight:900, fontSize:18}}>📚 나의 탐구 포트폴리오</div>
          <button onClick={onLogout} className="btn btn-ghost btn-sm">로그아웃</button>
        </div>
      </header>

      <main style={styles.main}>
        {/* 학생 정보 카드 */}
        <div className="card" style={styles.studentCard}>
          <div style={{fontSize:48}}>🦠</div>
          <div>
            <div style={styles.studentName}>
              {student.grade}학년 {student.class}반{student.group_num ? ` ${student.group_num}모둠` : ''} {student.number}번 {student.name}
            </div>
            <div style={styles.studentSubtitle}>감염병 단원 탐구 포트폴리오</div>
            <div style={styles.studentCoreQ}>핵심질문: {UNIT_INFO.coreQuestion}</div>
          </div>
        </div>

        {/* 전체 진행 현황 */}
        <div className="card" style={{marginBottom:28}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
            <span style={{fontWeight:900, fontSize:16}}>📊 탐구 완료 현황</span>
            <span style={{fontWeight:900, fontSize:24, color:'var(--primary)'}}>{pct}%</span>
          </div>
          <div className="progress-bar" style={{height:12, marginBottom:12}}>
            <div className="progress-fill" style={{width:`${pct}%`}} />
          </div>
          <div style={styles.sessionsGrid}>
            {sessions.map(s => (
              <div key={s.id} style={{
                ...styles.sessionDot,
                background: completed.has(s.id) ? s.phaseColor : 'var(--border)',
                color: completed.has(s.id) ? 'white' : 'var(--text-light)',
              }} title={`${s.id}차시 ${s.title}`}>
                {completed.has(s.id) ? '✓' : s.id}
              </div>
            ))}
          </div>
        </div>

        {/* 차시별 포트폴리오 항목들 */}
        <h2 style={{fontWeight:900, fontSize:20, marginBottom:20}}>📋 차시별 탐구 기록</h2>
        {sessions.map(session => {
          const sessionSubs = submissions[session.id] || {}
          const portfolioText = sessionSubs['portfolio']?.text || ''
          const isDone = completed.has(session.id)

          return (
            <div key={session.id} className="card" style={{marginBottom:16, background: isDone ? phaseBg[session.phase] : 'white', border:`2px solid ${isDone ? session.phaseColor + '44' : 'transparent'}`}}>
              <div style={styles.portHeader}>
                <div style={styles.portLeft}>
                  <span style={{fontSize:24}}>{session.emoji}</span>
                  <div>
                    <div style={styles.portTitle}>
                      <span style={{fontSize:12, color:'var(--text-light)', marginRight:4}}>{session.id}차시</span>
                      {session.title}
                    </div>
                    <span style={{...styles.portPhase, background:`${session.phaseColor}22`, color:session.phaseColor}}>
                      {session.phase}
                    </span>
                  </div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  {isDone && <span style={styles.doneBadge}>✅ 완료</span>}
                  <Link to={`/session/${session.id}`} className="btn btn-ghost btn-sm">
                    {isDone ? '다시 보기' : '📝 시작하기'}
                  </Link>
                </div>
              </div>

              {/* 포트폴리오 정리 내용 */}
              {portfolioText ? (
                <div style={styles.portContent}>
                  <div style={styles.portLabel}>📝 나의 탐구 정리</div>
                  <p style={styles.portText}>{portfolioText}</p>
                </div>
              ) : (
                <div style={styles.portEmpty}>
                  <span style={{fontSize:12, color:'var(--text-light)'}}>{session.portfolioPrompt}</span>
                </div>
              )}

              {/* 활동 완료 현황 */}
              {Object.keys(sessionSubs).length > 0 && (
                <div style={styles.activityCount}>
                  💾 {Object.keys(sessionSubs).filter(k => k !== 'portfolio').length}개 활동 저장됨
                </div>
              )}
            </div>
          )
        })}

        {/* 최종 핵심질문 답변 (12차시) */}
        {submissions[12]?.['act_12_1']?.text && (
          <div className="card" style={styles.finalAnswer}>
            <div style={{fontSize:32, marginBottom:12}}>🌟</div>
            <h3 style={{fontWeight:900, fontSize:18, marginBottom:8}}>핵심질문 최종 답변</h3>
            <p style={{fontSize:12, color:'white', opacity:0.8, marginBottom:16}}>{UNIT_INFO.coreQuestion}</p>
            <div style={styles.finalText}>{submissions[12]['act_12_1'].text}</div>
          </div>
        )}
      </main>
    </div>
  )
}

const styles = {
  wrap: { minHeight:'100vh', display:'flex', flexDirection:'column' },
  header: { background:'white', borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:100 },
  headerInner: { maxWidth:900, margin:'0 auto', padding:'14px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' },
  main: { flex:1, maxWidth:900, margin:'0 auto', padding:'28px 20px', width:'100%' },
  studentCard: { display:'flex', alignItems:'center', gap:20, marginBottom:24, background:'linear-gradient(135deg,#FFB347,#FF8C69)', color:'white', border:'none' },
  studentName: { fontSize:20, fontWeight:900, marginBottom:4 },
  studentSubtitle: { fontSize:14, opacity:0.85, marginBottom:6 },
  studentCoreQ: { fontSize:12, opacity:0.75, fontStyle:'italic' },
  sessionsGrid: { display:'flex', flexWrap:'wrap', gap:8 },
  sessionDot: { width:36, height:36, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, cursor:'default' },
  portHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 },
  portLeft: { display:'flex', alignItems:'center', gap:12 },
  portTitle: { fontSize:16, fontWeight:900, color:'var(--text)', marginBottom:4 },
  portPhase: { borderRadius:20, padding:'2px 8px', fontSize:11, fontWeight:700 },
  doneBadge: { background:'#EDFAF3', color:'#2D7A58', borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:700 },
  portContent: { background:'white', borderRadius:10, padding:'12px 14px', marginTop:4 },
  portLabel: { fontSize:11, fontWeight:700, color:'var(--text-light)', marginBottom:6 },
  portText: { fontSize:14, lineHeight:1.7, color:'var(--text)', whiteSpace:'pre-wrap' },
  portEmpty: { background:'rgba(255,255,255,0.5)', borderRadius:10, padding:'12px 14px', marginTop:4, fontStyle:'italic' },
  activityCount: { marginTop:8, fontSize:12, color:'var(--text-light)', fontWeight:600 },
  finalAnswer: { background:'linear-gradient(135deg,#B09FD8,#7EB8F7)', color:'white', border:'none', textAlign:'center', marginTop:8 },
  finalText: { background:'rgba(255,255,255,0.15)', borderRadius:12, padding:'16px', fontSize:14, lineHeight:1.7, whiteSpace:'pre-wrap', textAlign:'left' },
}

