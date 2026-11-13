import { useState } from 'react'

export default function Quiz({ activity, saved, onSave }) {
  const [answers, setAnswers] = useState(saved?.answers || {})
  const [submitted, setSubmitted] = useState(saved?.submitted || false)

  const select = (qi, opt) => {
    if (submitted) return
    setAnswers(p => ({ ...p, [qi]: opt }))
  }

  const submit = () => {
    setSubmitted(true)
    onSave({ answers, submitted: true })
  }

  const score = submitted
    ? activity.questions.filter((q, i) => answers[i] === q.answer).length
    : null

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {activity.questions.map((q, qi) => (
        <div key={qi}>
          <p style={styles.question}><span style={styles.qNum}>Q{qi+1}</span> {q.question}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:10 }}>
            {q.options.map((opt, oi) => {
              let cls = 'quiz-option'
              if (answers[qi] === oi) cls += ' selected'
              if (submitted && oi === q.answer) cls += ' correct'
              if (submitted && answers[qi] === oi && oi !== q.answer) cls += ' wrong'
              return (
                <div key={oi} className={cls} onClick={() => select(qi, oi)} style={{display:'flex', gap:10, alignItems:'center'}}>
                  <span style={styles.optLetter}>{String.fromCharCode(65+oi)}</span>
                  {opt}
                  {submitted && oi === q.answer && <span style={{marginLeft:'auto'}}>✅</span>}
                  {submitted && answers[qi] === oi && oi !== q.answer && <span style={{marginLeft:'auto'}}>❌</span>}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {!submitted ? (
        <button className="btn btn-primary" onClick={submit} disabled={Object.keys(answers).length < activity.questions.length}>
          ✔ 정답 확인하기
        </button>
      ) : (
        <div style={styles.result}>
          <div style={styles.resultScore}>
            {score}/{activity.questions.length} 맞았어요!
          </div>
          {score === activity.questions.length
            ? <p style={{color:'var(--secondary)', fontWeight:700}}>🎉 완벽해요!</p>
            : <p style={{color:'var(--text-light)'}}>틀린 문제를 다시 살펴보세요.</p>
          }
        </div>
      )}
    </div>
  )
}

const styles = {
  question: { fontWeight:700, fontSize:15, color:'var(--text)' },
  qNum: { display:'inline-block', background:'var(--primary)', color:'white', borderRadius:'50%', width:22, height:22, textAlign:'center', lineHeight:'22px', fontSize:12, fontWeight:900, marginRight:8 },
  optLetter: { display:'inline-flex', alignItems:'center', justifyContent:'center', width:22, height:22, borderRadius:'50%', background:'var(--border)', fontSize:12, fontWeight:700, flexShrink:0 },
  result: { background:'var(--primary-pale)', borderRadius:12, padding:'20px 24px', textAlign:'center' },
  resultScore: { fontSize:28, fontWeight:900, color:'var(--primary)', marginBottom:8 },
}

