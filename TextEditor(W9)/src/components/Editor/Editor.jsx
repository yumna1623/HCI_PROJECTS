import { useEditor } from '../../context/EditorContext'
import Toolbar from './Toolbar'
import Palette from './Palette'
import StatusBar from './StatusBar'
import DrawingCanvas from '../Canvas/DrawingCanvas'

export default function Editor() {
  const { config } = useEditor()
  const { layout, palette } = config

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: '#050810', overflow: 'hidden' }}>

      {/* Top palette */}
      {palette === 'top' && <Palette position="top" />}

      {/* Horizontal toolbar */}
      {layout === 'horizontal' && <Toolbar />}

      {/* Middle row */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* Left palette */}
        {palette === 'left' && <Palette position="left" />}

        {/* Side toolbar (grid or vertical) */}
        {(layout === 'grid' || layout === 'vertical') && <Toolbar />}

        {/* Canvas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <DrawingCanvas />
        </div>

        {/* Right palette */}
        {palette === 'right' && <Palette position="right" />}
      </div>

      {/* Bottom palette */}
      {palette === 'bottom' && <Palette position="bottom" />}

      {/* Status bar */}
      <StatusBar />
    </div>
  )
}