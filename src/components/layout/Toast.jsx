export default function Toast({ msg, type = 'success' }) {
  const bg = type === 'error' ? 'var(--danger)' : type === 'info' ? 'var(--accent)' : 'var(--secondary)'
  return (
    <div style={{position:'fixed', bottom:24, right:24, zIndex:9999}}>
      <div style={{
        padding:'14px 20px',
        borderRadius:12,
        background:bg,
        color:'white',
        fontWeight:700,
        fontSize:14,
        boxShadow:'0 4px 20px rgba(0,0,0,0.15)',
        animation:'slideIn 0.3s ease',
        maxWidth:320,
      }}>
        {msg}
      </div>
    </div>
  )
}

