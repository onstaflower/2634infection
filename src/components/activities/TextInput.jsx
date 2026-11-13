import { useState, useRef } from 'react'

export default function TextInput({ activity, saved, isSaving, onSave }) {
  const [value, setValue] = useState(saved?.text || '')
  const timer = useRef(null)

  const handleChange = (e) => {
    setValue(e.target.value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { onSave({ text: e.target.value }) }, 1500) // 자동 저장
  }

  return (
    <div>
      <textarea
        className="input"
        rows={activity.minRows || 4}
        placeholder={activity.placeholder || '여기에 써보세요...'}
        value={value}
        onChange={handleChange}
      />
      <div style={styles.footer}>
        <span style={styles.hint}>💡 입력하면 자동으로 저장돼요</span>
        <button className="btn btn-primary btn-sm" onClick={() => onSave({ text: value })} disabled={isSaving}>
          {isSaving ? '저장 중...' : '💾 저장'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  footer: { display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10 },
  hint: { fontSize:12, color:'var(--text-light)' },
}

