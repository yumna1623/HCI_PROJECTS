import { useEditor } from '../../context/EditorContext'
import { COLORS, STROKE_WIDTHS } from '../../constants/tools'

export default function Palette({ position }) {
  const { activeColor, setActiveColor, strokeWidth, setStrokeWidth } = useEditor()
  const isHorizontal = position === 'top' || position === 'bottom'

  const wrapStyle = isHorizontal ? {
    display: 'flex', flexDirection: 'row', alignItems: 'center',
    gap: 16, padding: '6px 16px', flexShrink: 0,
    background: '#0b0f1e',
    borderTop:    position === 'bottom' ? '1px solid #1e2a45' : 'none',
    borderBottom: position === 'top'    ? '1px solid #1e2a45' : 'none',
  } : {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 12, padding: '12px 6px', width: 52, flexShrink: 0,
    background: '#0b0f1e',
    borderLeft:  position === 'right' ? '1px solid #1e2a45' : 'none',
    borderRight: position === 'left'  ? '1px solid #1e2a45' : 'none',
    overflowY: 'auto',
  }

  return (
    <div style={wrapStyle}>
      {/* Color label */}
      <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: '#4a5e80', letterSpacing: 2 }}>CLR</span>

      {/* Color swatches */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 5,
        flexDirection: isHorizontal ? 'row' : 'column',
        alignItems: 'center',
      }}>
        {COLORS.map(color => (
          <button
            key={color}
            title={color}
            onClick={() => setActiveColor(color)}
            style={{
              width: 18, height: 18, borderRadius: '50%',
              background: color, border: `2px solid ${activeColor === color ? '#fff' : 'transparent'}`,
              cursor: 'pointer', flexShrink: 0, padding: 0,
              transform: activeColor === color ? 'scale(1.25)' : 'scale(1)',
              transition: 'all 0.15s',
              boxShadow: activeColor === color ? `0 0 6px ${color}` : 'none',
            }}
          />
        ))}
      </div>

      {/* Active color preview */}
      <div style={{
        width: 22, height: 22, borderRadius: 4, flexShrink: 0,
        background: activeColor, border: '1px solid #263452',
        boxShadow: `0 0 8px ${activeColor}88`,
      }} />

      {/* Divider */}
      {isHorizontal
        ? <div style={{ width: 1, height: 24, background: '#1e2a45' }} />
        : <div style={{ width: '100%', height: 1, background: '#1e2a45' }} />
      }

      {/* Stroke label */}
      <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: '#4a5e80', letterSpacing: 2 }}>STR</span>

      {/* Stroke buttons */}
      <div style={{ display: 'flex', flexDirection: isHorizontal ? 'row' : 'column', gap: 4, alignItems: 'center' }}>
        {STROKE_WIDTHS.map(w => (
          <button
            key={w}
            title={`${w}px`}
            onClick={() => setStrokeWidth(w)}
            style={{
              width: 32, height: 32, borderRadius: 6, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${strokeWidth === w ? '#bf5fff' : '#1e2a45'}`,
              background: strokeWidth === w ? 'rgba(191,95,255,0.1)' : '#111829',
              boxShadow: strokeWidth === w ? '0 0 8px #bf5fff88' : 'none',
              transition: 'all 0.15s', flexShrink: 0,
            }}
          >
            <div style={{
              background: '#bf5fff', borderRadius: 99,
              width: Math.min(w * 2 + 4, 22), height: w,
            }} />
          </button>
        ))}
      </div>
    </div>
  )
}