import { useState, useRef } from 'react'
import { uploadMedia, saveSubmission } from '../../lib/supabase'

export default function VoiceRecorder({ activity, saved, onSave, student }) {
  const [status, setStatus] = useState('idle') // idle | recording | done
  const [transcript, setTranscript] = useState(saved?.transcript || '')
  const [audioUrl, setAudioUrl] = useState(saved?.audioUrl || null)
  const [error, setError] = useState('')
  const mediaRecorder = useRef(null)
  const chunks = useRef([])
  const recognition = useRef(null)

  const startRecording = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      chunks.current = []
      mediaRecorder.current.ondataavailable = e => chunks.current.push(e.data)
      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setStatus('done')
        // Supabase에 업로드
        const { data } = await uploadMedia(student.id, activity.id.split('_')[1], activity.id, blob, 'audio')
        const publicUrl = data?.publicUrl || url
        onSave({ transcript, audioUrl: publicUrl })
        stream.getTracks().forEach(t => t.stop())
      }
      mediaRecorder.current.start()

      // Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognition.current = new SpeechRecognition()
        recognition.current.lang = 'ko-KR'
        recognition.current.continuous = true
        recognition.current.interimResults = true
        let finalText = transcript
        recognition.current.onresult = (e) => {
          let interim = ''
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) finalText += e.results[i][0].transcript + ' '
            else interim = e.results[i][0].transcript
          }
          setTranscript(finalText + interim)
        }
        recognition.current.start()
      }
      setStatus('recording')
    } catch (err) {
      setError('마이크 접근 권한이 필요해요. 브라우저 설정에서 허용해주세요.')
    }
  }

  const stopRecording = () => {
    mediaRecorder.current?.stop()
    recognition.current?.stop()
  }

  const handleSaveText = () => {
    onSave({ transcript, audioUrl })
  }

  return (
    <div>
      {/* 프롬프트 */}
      {activity.voicePrompt && (
        <div style={styles.prompt}>
          <span style={{fontSize:14, fontWeight:700, color:'var(--text-light)', marginBottom:6, display:'block'}}>💬 시작 힌트</span>
          <span style={{fontStyle:'italic', color:'var(--text)', fontSize:14}}>"{activity.voicePrompt}"</span>
        </div>
      )}

      {/* 녹음 버튼 */}
      <div style={styles.controls}>
        {status === 'idle' && (
          <button className="btn btn-primary" onClick={startRecording} style={{gap:8}}>
            🎤 녹음 시작
          </button>
        )}
        {status === 'recording' && (
          <button className="btn" onClick={stopRecording} style={{background:'var(--danger)', color:'white', animation:'pulse 1s infinite'}}>
            ⏹ 녹음 중지
          </button>
        )}
        {status === 'done' && (
          <button className="btn btn-ghost" onClick={startRecording}>
            🔄 다시 녹음
          </button>
        )}
      </div>

      {status === 'recording' && (
        <div style={styles.recordingIndicator}>
          <span style={{...styles.dot, animation:'pulse 1s infinite'}} />
          <span style={{color:'var(--danger)', fontWeight:700}}>녹음 중...</span>
        </div>
      )}

      {/* 음성 재생 */}
      {audioUrl && (
        <div style={{marginTop:12}}>
          <audio controls src={audioUrl} style={{width:'100%', borderRadius:8}} />
        </div>
      )}

      {/* 음성-텍스트 변환 결과 */}
      {(transcript || status === 'recording') && (
        <div style={{marginTop:16}}>
          <div style={styles.transcriptLabel}>📝 음성 인식 텍스트</div>
          <textarea
            className="input"
            rows={4}
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder="음성 인식 결과가 여기에 나와요. 직접 수정해도 돼요!"
          />
          <button className="btn btn-secondary btn-sm" onClick={handleSaveText} style={{marginTop:8}}>
            💾 텍스트 저장
          </button>
        </div>
      )}

      {error && <p style={styles.error}>⚠️ {error}</p>}
      {!window.SpeechRecognition && !window.webkitSpeechRecognition && (
        <p style={{fontSize:12, color:'var(--text-light)', marginTop:8}}>💡 Chrome 브라우저에서 사용하면 음성이 텍스트로 자동 변환돼요!</p>
      )}
    </div>
  )
}

const styles = {
  prompt: { background:'var(--primary-pale)', borderRadius:10, padding:'12px 14px', marginBottom:16 },
  controls: { display:'flex', gap:10, marginBottom:12 },
  recordingIndicator: { display:'flex', alignItems:'center', gap:8, marginBottom:12 },
  dot: { width:12, height:12, borderRadius:'50%', background:'var(--danger)', display:'inline-block' },
  transcriptLabel: { fontSize:13, fontWeight:700, color:'var(--text-light)', marginBottom:8 },
  error: { color:'var(--danger)', fontSize:13, marginTop:8, fontWeight:600 },
}

