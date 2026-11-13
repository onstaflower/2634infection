import { useState, useRef } from 'react'
import { uploadMedia } from '../../lib/supabase'

export default function PhotoUpload({ activity, saved, onSave, student }) {
  const [preview, setPreview] = useState(saved?.imageUrl || null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // 미리보기
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)

    // 업로드
    setUploading(true)
    const sessionNum = activity.id.split('_')[1]
    const { data, error } = await uploadMedia(student.id, sessionNum, activity.id, file, 'image')
    setUploading(false)

    if (error) { alert('업로드 실패. 다시 시도해보세요.'); return }
    const url = data?.publicUrl || preview
    onSave({ imageUrl: url })
  }

  return (
    <div>
      {/* 업로드 영역 */}
      <div
        style={styles.dropZone}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="업로드된 사진" style={styles.preview} />
        ) : (
          <div style={styles.placeholder}>
            <span style={{fontSize:48}}>📸</span>
            <p style={{fontWeight:700, marginTop:12, color:'var(--text)'}}>여기를 눌러 사진 선택</p>
            <p style={{fontSize:13, color:'var(--text-light)', marginTop:4}}>JPG, PNG, HEIC 가능 · 최대 10MB</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        style={{display:'none'}}
      />

      <div style={{display:'flex', gap:10, marginTop:12}}>
        <button className="btn btn-primary btn-sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? '업로드 중...' : preview ? '📸 사진 바꾸기' : '📸 사진 선택'}
        </button>
        {preview && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setPreview(null); onSave({ imageUrl: null }) }}>
            삭제
          </button>
        )}
      </div>

      {uploading && <p style={{fontSize:13, color:'var(--accent)', marginTop:8, fontWeight:600}}>☁️ Supabase에 저장 중...</p>}
      {saved?.imageUrl && !uploading && <p style={{fontSize:13, color:'var(--secondary)', marginTop:8, fontWeight:600}}>✅ 저장 완료!</p>}
    </div>
  )
}

const styles = {
  dropZone: { border:'2px dashed var(--primary)', borderRadius:16, padding:24, cursor:'pointer', textAlign:'center', background:'var(--primary-pale)', transition:'all 0.2s', minHeight:200, display:'flex', alignItems:'center', justifyContent:'center' },
  placeholder: { display:'flex', flexDirection:'column', alignItems:'center' },
  preview: { maxWidth:'100%', maxHeight:300, borderRadius:12, objectFit:'contain' },
}

