import { useEditor } from '../../context/EditorContext'

export default function StatusBar() {
  const { activeTool, activeColor, strokeWidth, shapes, config } = useEditor()

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '4px 16px', background: '#0b0f1e', borderTop: '1px solid #1e2a45',
      fontFamily: 'Orbitron,monospace', fontSize: 10, letterSpacing: 2,
      color: '#2a3a58', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span>TOOL: <span style={{ color: '#00f5ff' }}>{activeTool.toUpperCase()}</span></span>
        <span>SHAPES: <span style={{ color: '#bf5fff' }}>{shapes.length}</span></span>
        <span>STROKE: <span style={{ color: '#ff2d78' }}>{strokeWidth}px</span></span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          COLOR:
          <span style={{
            display: 'inline-block', width: 12, height: 12,
            borderRadius: '50%', background: activeColor,
            border: '1px solid rgba(255,255,255,0.2)',
          }} />
        </span>
        <span>MODE: <span style={{ color: '#00ff9d' }}>{config.drawMode.toUpperCase()}</span></span>
        <span style={{ color: '#1e2a45' }}>HCI EDITOR v1.0</span>
      </div>
    </div>
  )
}