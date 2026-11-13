import { useRef, useState, useEffect } from 'react'

const COLORS = ['#3D3D3D','#FF4444','#FF8C69','#F7C77E','#7BC8A4','#7EB8F7','#B09FD8','#FFFFFF']
const SIZES = [2, 5, 10, 18]

export default function SketchPad({ activity, saved, onSave }) {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [color, setColor] = useState('#3D3D3D')
  const [size, setSize] = useState(5)
  const [eraser, setEraser] = useState(false)
  const lastPos = useRef(null)

  useEffect(() => {
    // 저장된 그림 복원
    if (saved?.dataUrl && canvasRef.current) {
      const img = new Image()
      img.onload = () => {
        const ctx = canvasRef.current.getContext('2d')
        ctx.drawImage(img, 0, 0)
      }
      img.src = saved.dataUrl
    } else {
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) { ctx.fillStyle = '#FFF9F5'; ctx.fillRect(0,0,canvasRef.current.width, canvasRef.current.height) }
    }
  }, [])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height
    if (e.touches) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY }
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  const startDraw = (e) => { e.preventDefault(); setDrawing(true); lastPos.current = getPos(e) }

  const draw = (e) => {
    e.preventDefault()
    if (!drawing) return
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e)
    ctx.beginPath()
    ctx.lineWidth = size * (eraser ? 4 : 1)
    ctx.lineCap = 'round'
    ctx.strokeStyle = eraser ? '#FFF9F5' : color
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
  }

  const endDraw = (e) => {
    e.preventDefault()
    setDrawing(false)
  }

  const clear = () => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.fillStyle = '#FFF9F5'
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  const save = () => {
    const dataUrl = canvasRef.current.toDataURL('image/png')
    onSave({ dataUrl })
  }

  return (
    <div>
      {/* 도구 바 */}
      <div style={styles.toolbar}>
        <div style={styles.colors}>
          {COLORS.map(c => (
            <button key={c} onClick={() => { setColor(c); setEraser(false) }}
              style={{ ...styles.colorBtn, background:c, border: !eraser && color===c ? '3px solid var(--primary)' : '2px solid var(--border)' }} />
          ))}
        </div>
        <div style={styles.sizeRow}>
          {SIZES.map(s => (
            <button key={s} onClick={() => setSize(s)} style={{...styles.sizeBtn, background: size===s ? 'var(--primary)':'var(--border)'}}>
              <div style={{width:s, height:s, borderRadius:'50%', background: size===s?'white':'var(--text)'}} />
            </button>
          ))}
        </div>
        <button onClick={() => setEraser(e=>!e)} className={`btn btn-sm ${eraser ? 'btn-primary' : 'btn-ghost'}`}>
          {eraser ? '🩹 지우개 중' : '🩹 지우개'}
        </button>
        <button onClick={clear} className="btn btn-ghost btn-sm">🗑️ 전체 지우기</button>
        <button onClick={save} className="btn btn-primary btn-sm">💾 저장</button>
      </div>

      {/* 캔버스 */}
      <canvas
        ref={canvasRef}
        width={700} height={400}
        style={styles.canvas}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
      />
      {saved?.dataUrl && <p style={{fontSize:12, color:'var(--secondary)', marginTop:8}}>✅ 저장된 그림이 있어요</p>}
    </div>
  )
}

const styles = {
  toolbar: { display:'flex', flexWrap:'wrap', gap:8, alignItems:'center', marginBottom:12, background:'white', borderRadius:10, padding:'10px 14px', border:'1px solid var(--border)' },
  colors: { display:'flex', gap:5, flexWrap:'wrap' },
  colorBtn: { width:22, height:22, borderRadius:'50%', cursor:'pointer', padding:0, flexShrink:0 },
  sizeRow: { display:'flex', gap:5, alignItems:'center' },
  sizeBtn: { width:28, height:28, borderRadius:6, cursor:'pointer', border:'none', display:'flex', alignItems:'center', justifyContent:'center' },
  canvas: { width:'100%', borderRadius:12, border:'2px solid var(--border)', touchAction:'none', cursor:'crosshair', background:'#FFF9F5', display:'block' },
}

