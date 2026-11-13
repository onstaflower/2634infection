import { useState } from 'react'

export default function Checklist({ activity, saved, onSave }) {
  const [checked, setChecked] = useState(saved?.checked || {})

  const toggle = (i) => {
    const next = { ...checked, [i]: !checked[i] }
    setChecked(next)
    onSave({ checked: next, checkedCount: Object.values(next).filter(Boolean).length })
  }

  const count = Object.values(checked).filter(Boolean).length
  const total = activity.items.length
  const pct = Math.round((count / total) * 100)

  return (
    <div>
      {/* 진행률 */}
      <div style={styles.progressRow}>
        <span style={styles.progressText}>{count} / {total} 체크 완료</span>
        <span style={{fontWeight:900, color:'var(--primary)'}}>{pct}%</span>
      </div>
      <div className="progress-bar" style={{marginBottom:16}}>
        <div className="progress-fill" style={{width:`${pct}%`}} />
      </div>

      {/* 항목들 */}
      {activity.items.map((item, i) => (
        <div key={i} className={`custom-check ${checked[i] ? 'checked' : ''}`} onClick={() => toggle(i)}>
          <input type="checkbox" checked={!!checked[i]} readOnly />
          <div className="check-box">{checked[i] ? '✓' : ''}</div>
          <span style={{fontSize:15, fontWeight: checked[i] ? 700 : 400, color: checked[i] ? 'var(--secondary)' : 'var(--text)', textDecoration: checked[i] ? 'line-through' : 'none', transition:'all 0.2s'}}>
            {item}
          </span>
        </div>
      ))}

      {count === total && (
        <div style={styles.allDone}>
          🎉 모두 체크했어요! 완벽한 예방 습관을 가지고 있네요!
        </div>
      )}
    </div>
  )
}

const styles = {
  progressRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  progressText: { fontSize:14, fontWeight:600, color:'var(--text-light)' },
  allDone: { background:'var(--secondary-light)', borderRadius:10, padding:'12px 16px', marginTop:12, fontWeight:700, color:'var(--secondary)', textAlign:'center' },
}

