import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { sessions, UNIT_INFO } from '../data/sessions'
import { getSessionProgress } from '../lib/supabase'

const phaseOrder = ['도입', '탐구', '적용', '발표', '성찰']
const phaseColors = { '도입':'#FF9F7F', '탐구':'#7BC8A4', '적용':'#7EB8F7', '발표':'#B09FD8', '성찰':'#F7C77E' }
const phaseBg    = { '도입':'#FFF0EB', '탐구':'#EDFAF3', '적용':'#EDF5FF', '발표':'#F3EFFF', '성찰':'#FFF8EC' }

export default function Home({ student, onLogout }) {
  const [completed, setCompleted] = useState(new Set())
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    getSessionProgress(student.id).then(({ data }) => {
      if (data) setCompleted(new Set(data.map(d => d.session_number)))
      setLoading(false)
    })
  }, [student.id])

  const pct = Math.round((completed.size / UNIT_INFO.totalSessions) * 100)

  return (
    <div style={styles.wrap}>
      {/* 헤더 */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.headerLeft}>
            <span style={{fontSize:28}}>🦠</span>
            <div>
              <div style={styles.unitTitle}>감염병 탐구 바인더</div>
              <div style={styles.unitSub}>3학년 과학 4단원</div>
            </div>
          </div>
          <div style={styles.headerRight}>
            <span style={styles.studentBadge}>
              {student.grade}학년 {student.class}반{student.group_num ? ` ${student.group_num}모둠` : ''} {student.number}번 {student.name}
            </span>
            <Link to="/portfolio" className="btn btn-secondary btn-sm">📚 포트폴리오</Link>
            <button onClick={onLogout} className="btn btn-ghost btn-sm">로그아웃</button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* 핵심 질문 배너 */}
        <div style={styles.coreBanner}>
          <div style={styles.coreBannerLabel}>🔍 단원 핵심질문</div>
          <div style={styles.coreBannerText}>{UNIT_INFO.coreQuestion}</div>
        </div>

        {/* 진행 현황 */}
        <div className="card" style={{marginBottom:32}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
            <span style={{fontWeight:700, fontSize:16}}>📊 나의 탐구 현황</span>
            <span style={{fontWeight:900, fontSize:20, color:'var(--primary)'}}>{completed.size} / {UNIT_INFO.totalSessions}차시</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{width:`${pct}%`}} />
          </div>
          <div style={{marginTop:8, fontSize:13, color:'var(--text-light)', textAlign:'right'}}>{pct}% 완료</div>
        </div>

        {/* 차시 카드 그리드 — 단계별로 묶어서 */}
        {phaseOrder.map(phase => {
          const phaseSessions = sessions.filter(s => s.phase === phase)
          return (
            <section key={phase} style={{marginBottom:36}}>
              <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:16}}>
                <div style={{...styles.phaseTag, background:phaseColors[phase]}}>
                  {phase}
                </div>
                <span style={{fontSize:14, color:'var(--text-light)', fontWeight:500}}>
                  {phaseSessions.map(s=>`${s.id}차시`).join(' · ')}
                </span>
              </div>
              <div style={styles.grid}>
                {phaseSessions.map(session => (
                  <SessionCard key={session.id} session={session} done={completed.has(session.id)} loading={loading} />
                ))}
              </div>
            </section>
          )
        })}
      </main>
    </div>
  )
}

function SessionCard({ session, done, loading }) {
  return (
    <Link to={`/session/${session.id}`} style={{textDecoration:'none'}}>
      <div style={{
        ...styles.sessionCard,
        borderColor: done ? session.phaseColor : 'transparent',
        opacity: loading ? 0.7 : 1,
      }}>
        {done && <div style={styles.doneBadge}>✅ 완료</div>}
        <div style={styles.sessionEmoji}>{session.emoji}</div>
        <div style={styles.sessionNum}>{session.id}차시</div>
        <div style={styles.sessionTitle}>{session.title}</div>
        <div style={styles.sessionGoal}>{session.learningGoal}</div>
        <div style={{...styles.sessionPhase, background:`${session.phaseColor}22`, color:session.phaseColor}}>
          {session.phase}
        </div>
      </div>
    </Link>
  )
}

const styles = {
  wrap: { minHeight:'100vh', display:'flex', flexDirection:'column' },
  header: { background:'white', borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 12px rgba(255,140,105,0.08)' },
  headerInner: { maxWidth:1100, margin:'0 auto', padding:'14px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 },
  headerLeft: { display:'flex', alignItems:'center', gap:12 },
  unitTitle: { fontWeight:900, fontSize:18, color:'var(--text)' },
  unitSub: { fontSize:12, color:'var(--text-light)' },
  headerRight: { display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' },
  studentBadge: { background:'var(--primary-pale)', color:'var(--primary)', borderRadius:20, padding:'5px 12px', fontSize:13, fontWeight:700 },
  main: { flex:1, maxWidth:1100, margin:'0 auto', padding:'32px 24px', width:'100%' },
  coreBanner: { background:'linear-gradient(135deg, #FFB347 0%, #FF8C69 100%)', borderRadius:20, padding:'24px 28px', marginBottom:28, color:'white' },
  coreBannerLabel: { fontSize:12, fontWeight:700, opacity:0.85, marginBottom:8, letterSpacing:1 },
  coreBannerText: { fontSize:18, fontWeight:900, lineHeight:1.5 },
  phaseTag: { color:'white', borderRadius:20, padding:'5px 14px', fontSize:13, fontWeight:900 },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:16 },
  sessionCard: { background:'white', borderRadius:16, padding:'20px', border:'2.5px solid', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 4px 16px rgba(0,0,0,0.06)', position:'relative', '&:hover': { transform:'translateY(-2px)' } },
  doneBadge: { position:'absolute', top:12, right:12, fontSize:11, fontWeight:700, background:'#EDFAF3', color:'#2D7A58', padding:'2px 8px', borderRadius:20 },
  sessionEmoji: { fontSize:32, marginBottom:8 },
  sessionNum: { fontSize:12, fontWeight:700, color:'var(--text-light)', marginBottom:4 },
  sessionTitle: { fontSize:16, fontWeight:900, color:'var(--text)', marginBottom:6 },
  sessionGoal: { fontSize:12, color:'var(--text-light)', lineHeight:1.5, marginBottom:12, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' },
  sessionPhase: { display:'inline-block', borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700 },
}

