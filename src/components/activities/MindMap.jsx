import { useState } from 'react'

export default function MindMap({ activity, saved, onSave }) {
  const [center] = useState(activity.centerTopic)
  const [branches, setBranches] = useState(
    saved?.branches ||
    activity.branches.map(b => ({ label: b, children: ['', '', ''] }))
  )

  const updateBranch = (bi, field, value) => {
    setBranches(prev => {
      const next = prev.map((b,i) => i===bi ? {...b, [field]:value} : b)
      return next
    })
  }

  const updateChild = (bi, ci, value) => {
    setBranches(prev => {
      const next = prev.map((b,i) => {
        if (i!==bi) return b
        const ch = [...b.children]
        ch[ci] = value
        return {...b, children:ch}
      })
      return next
    })
  }

  const handleSave = () => onSave({ branches })

  const branchColors = ['#FFB347','#7BC8A4','#7EB8F7','#B09FD8','#F7C77E','#FF8C69']

  return (
    <div>
      {/* 중심 주제 */}
      <div style={styles.center}>
        <div style={styles.centerBubble}>{center}</div>
      </div>

      {/* 가지들 */}
      <div style={styles.branches}>
        {branches.map((branch, bi) => (
          <div key={bi} style={styles.branch}>
            <div style={{...styles.branchHeader, background:branchColors[bi % branchColors.length]}}>
              <input
                style={styles.branchInput}
                value={branch.label}
                onChange={e => updateBranch(bi, 'label', e.target.value)}
                placeholder="가지 주제"
              />
            </div>
            <div style={styles.children}>
              {branch.children.map((child, ci) => (
                <input
                  key={ci}
                  className="input"
                  value={child}
                  onChange={e => updateChild(bi, ci, e.target.value)}
                  placeholder={`세부 내용 ${ci+1}`}
                  style={{fontSize:13}}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary btn-sm" onClick={handleSave} style={{marginTop:12}}>
        💾 마인드맵 저장
      </button>
    </div>
  )
}

const styles = {
  center: { textAlign:'center', marginBottom:20 },
  centerBubble: { display:'inline-block', background:'linear-gradient(135deg,#FFB347,#FF8C69)', color:'white', borderRadius:40, padding:'12px 28px', fontSize:18, fontWeight:900, boxShadow:'0 4px 16px rgba(255,140,105,0.3)' },
  branches: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:12 },
  branch: { borderRadius:12, overflow:'hidden', border:'1px solid var(--border)' },
  branchHeader: { padding:'8px 12px', borderRadius:'12px 12px 0 0' },
  branchInput: { background:'transparent', border:'none', outline:'none', fontSize:14, fontWeight:700, color:'white', width:'100%', fontFamily:'var(--font)' },
  children: { padding:'10px', display:'flex', flexDirection:'column', gap:8, background:'white' },
}

