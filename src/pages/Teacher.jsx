import { useState, useEffect } from 'react'
import { getAllStudents, getStudentFullData } from '../lib/supabase'
import { sessions } from '../data/sessions'

const TEACHER_PW = '3406'

export default function Teacher() {
  const [auth, setAuth] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState('')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [filter, setFilter] = useState({ class: '', session: '' })

  const handleLogin = (e) => {
    e.preventDefault()
    if (pwInput === TEACHER_PW) { setAuth(true); loadStudents() }
    else { setPwError('비밀번호가 맞지 않아요.'); setPwInput('') }
  }

  const loadStudents = async () => {
    setLoading(true)
    const { data } = await getAllStudents()
    setStudents(data || [])
    setLoading(false)
  }

  const openDetail = async (student) => {
    setSelected(student)
    const data = await getStudentFullData(student.id)
    setDetail(data)
  }

  const downloadCSV = () => {
    const rows = [
      ['학년','반','모둠','번호','이름','완료 차시','가입일'],
      ...students.map(s => [
        s.grade, s.class, s.group_num||'-', s.number, s.name,
        s.session_progress?.length || 0,
        new Date(s.created_at).toLocaleDateString('ko-KR')
      ])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `감염병_학생현황_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  const downloadHTML = () => {
    const content = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>감염병 학생 현황</title>
    <style>body{font-family:'Noto Sans KR',sans-serif;padding:20px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:8px;text-align:center} th{background:#FF8C69;color:white}</style></head>
    <body><h1>🦠 감염병 단원 학생 제출 현황</h1><p>출력일: ${new Date().toLocaleDateString('ko-KR')}</p>
    <table><thead><tr><th>학년</th><th>반</th><th>모둠</th><th>번호</th><th>이름</th><th>완료 차시</th><th>가입일</th></tr></thead>
    <tbody>${students.map(s=>`<tr><td>${s.grade}</td><td>${s.class}</td><td>${s.group_num||'-'}</td><td>${s.number}</td><td>${s.name}</td><td>${s.session_progress?.length||0}/12</td><td>${new Date(s.created_at).toLocaleDateString('ko-KR')}</td></tr>`).join('')}
    </tbody></table></body></html>`
    const blob = new Blob([content], { type: 'text/html;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `감염병_학생현황_${new Date().toISOString().slice(0,10)}.html`
    a.click()
  }

  // ── 비밀번호 화면 ── (비밀번호 절대 화면 노출 금지)
  if (!auth) {
    return (
      <div style={styles.authWrap}>
        <div style={styles.authCard}>
          <div style={{fontSize:48, marginBottom:16}}>🏫</div>
          <h2 style={{fontWeight:900, fontSize:22, marginBottom:8}}>교사 대시보드</h2>
          <p style={{color:'var(--text-light)', fontSize:14, marginBottom:28}}>접속하려면 비밀번호를 입력해주세요.</p>
          <form onSubmit={handleLogin} style={{display:'flex', flexDirection:'column', gap:14}}>
            <input
              className="input"
              type="password"
              value={pwInput}
              onChange={e => { setPwInput(e.target.value); setPwError('') }}
              autoComplete="current-password"
            />
            {pwError && <p style={{color:'var(--danger)', fontSize:13, fontWeight:600}}>⚠️ {pwError}</p>}
            <button className="btn btn-primary" type="submit" style={{justifyContent:'center'}}>접속</button>
          </form>
        </div>
      </div>
    )
  }

  // ── 학생 목록 필터 ──
  const filteredStudents = students.filter(s =>
    (!filter.class || s.class === Number(filter.class)) &&
    (!filter.session || (s.session_progress?.length || 0) >= Number(filter.session))
  )

  return (
    <div style={styles.wrap}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={{fontWeight:900, fontSize:18}}>🏫 교사 대시보드 — 감염병 단원</div>
          <div style={{display:'flex', gap:10}}>
            <button onClick={downloadCSV} className="btn btn-secondary btn-sm">📥 CSV</button>
            <button onClick={downloadHTML} className="btn btn-ghost btn-sm">🖨️ HTML</button>
            <button onClick={() => setAuth(false)} className="btn btn-ghost btn-sm">로그아웃</button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* 통계 카드 */}
        <div style={styles.statGrid}>
          {[
            { label:'전체 학생', value: students.length, emoji:'👥' },
            { label:'차시 완료율', value: `${students.length ? Math.round(students.reduce((a,s) => a + (s.session_progress?.length||0), 0) / (students.length * 12) * 100) : 0}%`, emoji:'📊' },
            { label:'12차시 완료', value: students.filter(s => (s.session_progress?.length||0) >= 12).length, emoji:'🎉' },
          ].map((stat, i) => (
            <div className="card" key={i} style={{textAlign:'center'}}>
              <div style={{fontSize:32, marginBottom:8}}>{stat.emoji}</div>
              <div style={{fontSize:28, fontWeight:900, color:'var(--primary)'}}>{stat.value}</div>
              <div style={{fontSize:14, color:'var(--text-light)'}}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 필터 */}
        <div style={styles.filterRow}>
          <select className="input" value={filter.class} onChange={e=>setFilter(p=>({...p,class:e.target.value}))} style={{width:120}}>
            <option value="">전체 반</option>
            {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}반</option>)}
          </select>
          <span style={{fontSize:14, color:'var(--text-light)', fontWeight:600}}>총 {filteredStudents.length}명</span>
          <button onClick={loadStudents} className="btn btn-ghost btn-sm">🔄 새로고침</button>
        </div>

        {/* 학생 카드 그리드 */}
        {loading ? <div className="spinner" style={{margin:'40px auto'}} /> : (
          <div style={styles.studentGrid}>
            {filteredStudents.map(student => {
              const done = student.session_progress?.length || 0
              const pct = Math.round((done / 12) * 100)
              return (
                <div key={student.id} className="card" style={styles.studentCard} onClick={() => openDetail(student)}>
                  <div style={styles.studentHeader}>
                    <span style={styles.studentName}>{student.number}번 {student.name}</span>
                    <span style={styles.classBadge}>{student.class}반{student.group_num ? ` ${student.group_num}모둠`:''}</span>
                  </div>
                  <div className="progress-bar" style={{margin:'10px 0 6px'}}>
                    <div className="progress-fill" style={{width:`${pct}%`}} />
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:13}}>
                    <span style={{color:'var(--text-light)'}}>{done}/12 차시</span>
                    <span style={{fontWeight:700, color: pct===100 ? 'var(--secondary)' : 'var(--primary)'}}>{pct}%</span>
                  </div>
                  <div style={{...styles.sessionDots}}>
                    {sessions.map(s => {
                      const isDone = student.session_progress?.some?.(p => p.session_number === s.id)
                      return <span key={s.id} style={{...styles.dot, background: isDone ? s.phaseColor : 'var(--border)'}} title={`${s.id}차시`} />
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 상세보기 모달 */}
        {selected && detail && (
          <div style={styles.modalOverlay} onClick={() => { setSelected(null); setDetail(null) }}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={{fontWeight:900, fontSize:18}}>{selected.grade}학년 {selected.class}반 {selected.number}번 {selected.name}</h3>
                <button onClick={() => { setSelected(null); setDetail(null) }} style={{background:'none', border:'none', fontSize:20, cursor:'pointer'}}>✕</button>
              </div>
              <div style={{overflowY:'auto', maxHeight:'60vh'}}>
                {sessions.map(session => {
                  const sessSubs = detail.submissions?.filter(s => s.session_number === session.id) || []
                  const portText = sessSubs.find(s => s.activity_id === 'portfolio')?.content?.text
                  if (!sessSubs.length) return null
                  return (
                    <div key={session.id} style={styles.detailSession}>
                      <div style={styles.detailSessionTitle}>
                        {session.emoji} {session.id}차시 — {session.title}
                      </div>
                      {portText && (
                        <div style={styles.detailPortfolio}>
                          <div style={{fontSize:11, fontWeight:700, color:'var(--text-light)', marginBottom:4}}>📝 포트폴리오</div>
                          <p style={{fontSize:13, lineHeight:1.6}}>{portText}</p>
                        </div>
                      )}
                      <div style={{fontSize:11, color:'var(--text-light)'}}>{sessSubs.length}개 활동 제출</div>
                    </div>
                  )
                })}
                {!detail.submissions?.length && <p style={{color:'var(--text-light)', textAlign:'center', padding:20}}>아직 제출한 활동이 없어요.</p>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

const styles = {
  authWrap: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 },
  authCard: { background:'white', borderRadius:24, padding:'40px 36px', maxWidth:380, width:'100%', boxShadow:'0 8px 48px rgba(0,0,0,0.1)', textAlign:'center' },
  wrap: { minHeight:'100vh', display:'flex', flexDirection:'column' },
  header: { background:'white', borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:100 },
  headerInner: { maxWidth:1100, margin:'0 auto', padding:'14px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 },
  main: { flex:1, maxWidth:1100, margin:'0 auto', padding:'28px 24px', width:'100%' },
  statGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:16, marginBottom:28 },
  filterRow: { display:'flex', alignItems:'center', gap:12, marginBottom:20, flexWrap:'wrap' },
  studentGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:16 },
  studentCard: { cursor:'pointer', transition:'all 0.2s', padding:'18px' },
  studentHeader: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  studentName: { fontWeight:900, fontSize:16 },
  classBadge: { background:'var(--primary-pale)', color:'var(--primary)', borderRadius:20, padding:'2px 8px', fontSize:12, fontWeight:700 },
  sessionDots: { display:'flex', flexWrap:'wrap', gap:4, marginTop:8 },
  dot: { width:14, height:14, borderRadius:4, display:'inline-block' },
  modalOverlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  modal: { background:'white', borderRadius:20, padding:'28px', maxWidth:600, width:'100%', maxHeight:'80vh', display:'flex', flexDirection:'column' },
  modalHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  detailSession: { borderLeft:'3px solid var(--primary)', paddingLeft:14, marginBottom:16 },
  detailSessionTitle: { fontWeight:700, fontSize:14, marginBottom:8, color:'var(--text)' },
  detailPortfolio: { background:'var(--primary-pale)', borderRadius:8, padding:'10px 12px', marginBottom:6 },
}

