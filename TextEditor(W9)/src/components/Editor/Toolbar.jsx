import { useEditor } from '../../context/EditorContext'
import { TOOL_LIST } from '../../constants/tools'

const SIZE_MAP = {
  small:  { width: 28, height: 28, fontSize: 13 },
  medium: { width: 36, height: 36, fontSize: 16 },
  large:  { width: 48, height: 48, fontSize: 20 },
}

export default function Toolbar() {
  const { config, activeTool, setActiveTool, undo, redo, canUndo, canRedo } = useEditor()
  const { layout, toolSize } = config
  const sz = SIZE_MAP[toolSize] || SIZE_MAP.medium

  const isHorizontal = layout === 'horizontal'
  const isGrid       = layout === 'grid'

  const wrapStyle = isHorizontal ? {
    display: 'flex', flexDirection: 'row', alignItems: 'center',
    gap: 6, padding: '6px 12px',
    background: '#0b0f1e', borderBottom: '1px solid #1e2a45',
    flexShrink: 0,
  } : {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 6, padding: '12px 8px',
    background: '#0b0f1e', borderRight: '1px solid #1e2a45',
    overflowY: 'auto', flexShrink: 0,
  }

  const gridStyle = isGrid ? {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4,
  } : {
    display: 'flex', flexDirection: isHorizontal ? 'row' : 'column', gap: 4,
  }

  const btnStyle = (active) => ({
    width: sz.width, height: sz.height,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, border: `1px solid ${active ? '#00f5ff' : '#1e2a45'}`,
    background: active ? 'rgba(0,245,255,0.1)' : '#111829',
    color: active ? '#00f5ff' : '#4a5e80',
    fontSize: sz.fontSize, cursor: 'pointer',
    boxShadow: active ? '0 0 8px #00f5ff88' : 'none',
    transition: 'all 0.15s',
    flexShrink: 0,
  })

  const actionBtnStyle = (enabled) => ({
    width: sz.width, height: sz.height,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, border: '1px solid #1e2a45',
    background: '#111829',
    color: enabled ? '#4a5e80' : '#1e2a45',
    fontSize: sz.fontSize, cursor: enabled ? 'pointer' : 'not-allowed',
    transition: 'all 0.15s', flexShrink: 0,
  })

  const dividerStyle = isHorizontal
    ? { width: 1, height: 24, background: '#1e2a45', margin: '0 4px', flexShrink: 0 }
    : { height: 1, width: '100%', background: '#1e2a45', margin: '4px 0' }

  return (
    <div style={wrapStyle}>

      {/* Brand */}
      {isHorizontal
        ? <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 10, color: '#00f5ff', opacity: 0.5, letterSpacing: 3, marginRight: 4 }}>✦</span>
        : <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 10, color: '#00f5ff', opacity: 0.5, marginBottom: 8 }}>✦</div>
      }

      {/* Tools */}
      <div style={gridStyle}>
        {TOOL_LIST.map(tool => {
          const active = activeTool === tool.id
          return (
            <button
              key={tool.id}
              title={tool.label}
              onClick={() => setActiveTool(tool.id)}
              style={btnStyle(active)}
            >
              {tool.icon}
            </button>
          )
        })}
      </div>

      <div style={dividerStyle} />

      {/* Undo / Redo */}
      <div style={{ display: 'flex', flexDirection: isHorizontal ? 'row' : 'column', gap: 4 }}>
        <button title="Undo" onClick={undo} disabled={!canUndo} style={actionBtnStyle(canUndo)}>↩</button>
        <button title="Redo" onClick={redo} disabled={!canRedo} style={actionBtnStyle(canRedo)}>↪</button>
      </div>

      {/* Label */}
      {!isHorizontal && (
        <div style={{ marginTop: 'auto', fontFamily: 'Orbitron,monospace', fontSize: 8, color: '#1e2a45', letterSpacing: 2, paddingTop: 8 }}>
          {layout.toUpperCase()}
        </div>
      )}
    </div>
  )
}