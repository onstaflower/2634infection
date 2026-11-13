import { useState } from 'react'
import { findOrCreateStudent } from '../lib/supabase'

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ grade: 3, class: '', group_num: '', number: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.class || !form.number || !form.name.trim()) {
      setError('반, 번호, 이름을 모두 입력해주세요!')
      return
    }
    setLoading(true)
    setError('')
    const { data, error: err } = await findOrCreateStudent({
      grade: Number(form.grade),
      class: Number(form.class),
      group_num: form.group_num ? Number(form.group_num) : null,
      number: Number(form.number),
      name: form.name.trim(),
    })
    setLoading(false)
    if (err) { setError('저장 중 오류가 생겼어요. 다시 시도해보세요.'); return }
    onLogin(data)
  }

  return (
    <div style={styles.wrap}>
      {/* 배경 바이러스 일러스트 */}
      <div style={styles.bgEmoji} aria-hidden>
        {['🦠','🦠','🦠','💊','🧬','🩺','🦠','🧫','💉'].map((e,i)=>(
          <span key={i} style={{ ...styles.bgItem, left:`${10+i*11}%`, top:`${5+((i*37)%85)}%`, fontSize:`${18+i*4}px`, opacity:0.08+i*0.015, transform:`rotate(${i*23}deg)` }}>{e}</span>
        ))}
      </div>

      <div style={styles.card}>
        {/* 로고/타이틀 */}
        <div style={styles.logo}>🦠</div>
        <h1 style={styles.title}>감염병 탐구 바인더</h1>
        <p style={styles.subtitle}>3학년 과학 — 4단원</p>
        <div style={styles.coreQ}>
          <span style={styles.coreQBadge}>핵심질문</span>
          <p style={styles.coreQText}>코로나19 같은 감염병이 또 생길까?<br/>우리는 어떻게 해야 할까?</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <label style={styles.label}>학년</label>
            <select className="input" value={form.grade} onChange={e=>setForm(p=>({...p,grade:e.target.value}))} style={{flex:1}}>
              <option value={3}>3학년</option>
            </select>
          </div>
          <div style={styles.row}>
            <label style={styles.label}>반</label>
            <select className="input" value={form.class} onChange={e=>setForm(p=>({...p,class:e.target.value}))} style={{flex:1}} required>
              <option value="">선택</option>
              {[1,2,3,4,5,6,7,8,9,10].map(n=><option key={n} value={n}>{n}반</option>)}
            </select>
          </div>
          <div style={styles.row}>
            <label style={styles.label}>모둠</label>
            <select className="input" value={form.group_num} onChange={e=>setForm(p=>({...p,group_num:e.target.value}))} style={{flex:1}}>
              <option value="">선택 안함</option>
              {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}모둠</option>)}
            </select>
          </div>
          <div style={styles.row}>
            <label style={styles.label}>번호</label>
            <input className="input" type="number" min={1} max={40} placeholder="번호" value={form.number} onChange={e=>setForm(p=>({...p,number:e.target.value}))} style={{flex:1}} required />
          </div>
          <div style={styles.row}>
            <label style={styles.label}>이름</label>
            <input className="input" type="text" placeholder="이름을 입력하세요" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={{flex:1}} required />
          </div>

          {error && <p style={styles.error}>⚠️ {error}</p>}

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{width:'100%', justifyContent:'center', marginTop:8}}>
            {loading ? '접속 중...' : '🚀 탐구 시작하기!'}
          </button>
        </form>

        <p style={styles.teacherLink}>
          선생님이신가요?{' '}
          <a href="/teacher" style={{color:'var(--primary)', fontWeight:700, textDecoration:'none'}}>교사 대시보드 →</a>
        </p>
      </div>
    </div>
  )
}

const styles = {
  wrap: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' },
  bgEmoji: { position:'absolute', inset:0, pointerEvents:'none', zIndex:0 },
  bgItem: { position:'absolute', userSelect:'none' },
  card: { position:'relative', zIndex:1, background:'white', borderRadius:24, padding:'36px 32px', width:'100%', maxWidth:420, boxShadow:'0 8px 48px rgba(255,140,105,0.18)', border:'1px solid rgba(255,140,105,0.1)' },
  logo: { fontSize:56, textAlign:'center', marginBottom:8 },
  title: { fontSize:26, fontWeight:900, textAlign:'center', color:'var(--text)', marginBottom:4 },
  subtitle: { fontSize:14, textAlign:'center', color:'var(--text-light)', marginBottom:20 },
  coreQ: { background:'var(--primary-pale)', borderRadius:12, padding:'14px 16px', marginBottom:24, textAlign:'center' },
  coreQBadge: { display:'inline-block', background:'var(--primary)', color:'white', borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700, marginBottom:6 },
  coreQText: { fontSize:14, color:'var(--text)', fontWeight:500, lineHeight:1.6 },
  form: { display:'flex', flexDirection:'column', gap:14 },
  row: { display:'flex', alignItems:'center', gap:12 },
  label: { fontSize:14, fontWeight:700, color:'var(--text-light)', width:36, flexShrink:0 },
  error: { background:'#FFE5E5', color:'var(--danger)', borderRadius:8, padding:'10px 14px', fontSize:14, fontWeight:600 },
  teacherLink: { textAlign:'center', marginTop:20, fontSize:13, color:'var(--text-light)' },
}

