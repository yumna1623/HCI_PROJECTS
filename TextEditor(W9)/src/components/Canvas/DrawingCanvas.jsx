import { useRef, useEffect, useState, useCallback } from 'react'
import { useEditor } from '../../context/EditorContext'
import { useNeonEffect } from '../../hooks/useNeonEffect'
import { TOOLS } from '../../constants/tools'
import NeonCanvas from './NeonCanvas'

export default function DrawingCanvas() {
  const {
    config, activeTool, activeColor,
    strokeWidth, shapes, pushHistory,
  } = useEditor()

  const wrapRef  = useRef(null)
  const svgRef   = useRef(null)
  const neonRef  = useRef(null)

  const [dims, setDims]         = useState({ w: 800, h: 600 })
  const [selected, setSelected] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // rubber-band state
  const isDrawing = useRef(false)
  const startPos  = useRef({ x: 0, y: 0 })
  const [preview, setPreview] = useState(null)

  // drag-drop state
  const [draggingTool, setDraggingTool] = useState(null)

  const { trigger: triggerNeon } = useNeonEffect(neonRef)

  // ── measure container ────────────────────────────────────────
  useEffect(() => {
    if (!wrapRef.current) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      if (width > 0 && height > 0) {
        setDims({ w: Math.floor(width), h: Math.floor(height) })
      }
    })
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  // ── get mouse pos relative to SVG ───────────────────────────
  const getPos = useCallback((e) => {
    const rect = svgRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }, [])

  // ── build shape object ───────────────────────────────────────
  const makeShape = useCallback((start, end, toolId) => ({
    id:          Date.now() + Math.random(),
    type:        toolId,
    x:           Math.min(start.x, end.x),
    y:           Math.min(start.y, end.y),
    width:       Math.abs(end.x - start.x),
    height:      Math.abs(end.y - start.y),
    x1:          start.x,
    y1:          start.y,
    x2:          end.x,
    y2:          end.y,
    color:       activeColor,
    strokeWidth: strokeWidth,
  }), [activeColor, strokeWidth])

  // ── RUBBER BAND ──────────────────────────────────────────────
  const handleMouseDown = useCallback((e) => {
    if (config.drawMode !== 'rubberBand') return
    if (activeTool === TOOLS.SELECT.id || activeTool === TOOLS.ERASER.id) return
    e.preventDefault()
    isDrawing.current = true
    startPos.current  = getPos(e)
    triggerNeon()
  }, [config.drawMode, activeTool, getPos, triggerNeon])

  const handleMouseMove = useCallback((e) => {
    if (config.drawMode !== 'rubberBand') return
    if (!isDrawing.current) return
    e.preventDefault()
    const cur = getPos(e)
    setPreview(makeShape(startPos.current, cur, activeTool))
  }, [config.drawMode, getPos, makeShape, activeTool])

  const handleMouseUp = useCallback((e) => {
    if (config.drawMode !== 'rubberBand') return
    if (!isDrawing.current) return
    isDrawing.current = false
    const cur = getPos(e)
    const dx  = Math.abs(cur.x - startPos.current.x)
    const dy  = Math.abs(cur.y - startPos.current.y)
    if (dx > 3 || dy > 3) {
      const shape = makeShape(startPos.current, cur, activeTool)
      pushHistory([...shapes, shape])
    }
    setPreview(null)
  }, [config.drawMode, getPos, makeShape, activeTool, shapes, pushHistory])

  // ── CLICK TO PLACE ───────────────────────────────────────────
  const handleClick = useCallback((e) => {
    if (config.drawMode !== 'click') return
    if (activeTool === TOOLS.SELECT.id || activeTool === TOOLS.ERASER.id) return
    const pos  = getPos(e)
    const SIZE = 80
    const shape = makeShape(
      { x: pos.x - SIZE / 2, y: pos.y - SIZE / 2 },
      { x: pos.x + SIZE / 2, y: pos.y + SIZE / 2 },
      activeTool
    )
    pushHistory([...shapes, shape])
    triggerNeon()
  }, [config.drawMode, activeTool, getPos, makeShape, shapes, pushHistory, triggerNeon])

  // ── ERASER / SELECT on shape ─────────────────────────────────
  const handleShapeClick = useCallback((e, shapeId) => {
    e.stopPropagation()
    if (activeTool === TOOLS.ERASER.id) {
      pushHistory(shapes.filter(s => s.id !== shapeId))
    } else if (activeTool === TOOLS.SELECT.id) {
      setSelected(prev => prev === shapeId ? null : shapeId)
    }
  }, [activeTool, shapes, pushHistory])

  // ── DRAG & DROP ──────────────────────────────────────────────
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
    if (!draggingTool) return
    const pos  = getPos(e)
    const SIZE = 80
    setPreview(makeShape(
      { x: pos.x - SIZE / 2, y: pos.y - SIZE / 2 },
      { x: pos.x + SIZE / 2, y: pos.y + SIZE / 2 },
      draggingTool
    ))
  }, [draggingTool, getPos, makeShape])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (!draggingTool) return
    const pos  = getPos(e)
    const SIZE = 80
    const shape = makeShape(
      { x: pos.x - SIZE / 2, y: pos.y - SIZE / 2 },
      { x: pos.x + SIZE / 2, y: pos.y + SIZE / 2 },
      draggingTool
    )
    pushHistory([...shapes, shape])
    setPreview(null)
    setDraggingTool(null)
    triggerNeon()
  }, [draggingTool, getPos, makeShape, shapes, pushHistory, triggerNeon])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
    setPreview(null)
  }, [])

  // cursor
  const cursor = activeTool === TOOLS.ERASER.id  ? 'cell'
    : activeTool === TOOLS.SELECT.id             ? 'default'
    : config.drawMode === 'dragDrop'             ? 'copy'
    : 'crosshair'

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        flex: 1,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#050810',
        outline: isDragOver ? '2px solid rgba(0,245,255,0.4)' : 'none',
        outlineOffset: '-2px',
      }}
    >
      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      {/* Radial glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,245,255,0.05) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 100%, rgba(191,95,255,0.04) 0%, transparent 60%)
        `,
      }} />

      {/* Neon canvas overlay */}
      <NeonCanvas ref={neonRef} width={dims.w} height={dims.h} />

      {/* Main SVG */}
      <svg
        ref={svgRef}
        width={dims.w}
        height={dims.h}
        style={{
          position: 'absolute', inset: 0,
          cursor, userSelect: 'none', touchAction: 'none',
          display: 'block',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
      >
        {/* Committed shapes */}
        {shapes.map(shape => (
          <ShapeEl
            key={shape.id}
            shape={shape}
            selected={selected === shape.id}
            onClickShape={(e) => handleShapeClick(e, shape.id)}
          />
        ))}

        {/* Preview shape while drawing */}
        {preview && (
          <ShapeEl shape={preview} isPreview />
        )}
      </svg>

      {/* Drag & Drop tray */}
      {config.drawMode === 'dragDrop' && (
        <DragDropTray
          onDragStart={(toolId) => setDraggingTool(toolId)}
          onDragEnd={() => { if (!isDragOver) { setDraggingTool(null); setPreview(null) } }}
        />
      )}

      {/* Empty state hint */}
      {shapes.length === 0 && !preview && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, opacity: 0.05, marginBottom: 12 }}>✦</div>
            <div style={{
              fontFamily: 'Orbitron,monospace', fontSize: 11,
              letterSpacing: 3, color: 'rgba(74,94,128,0.4)',
            }}>
              {config.drawMode === 'rubberBand' && 'SELECT A SHAPE TOOL THEN DRAG TO DRAW'}
              {config.drawMode === 'click'      && 'SELECT A SHAPE TOOL THEN CLICK TO PLACE'}
              {config.drawMode === 'dragDrop'   && 'DRAG A SHAPE FROM THE TRAY BELOW'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Drag & Drop Tray ──────────────────────────────────────────────
const DRAGGABLE = [
  { id: 'rectangle', label: 'RECT',   icon: '▭' },
  { id: 'circle',    label: 'CIRCLE', icon: '○' },
  { id: 'line',      label: 'LINE',   icon: '╱' },
]

function DragDropTray({ onDragStart, onDragEnd }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div style={{
      position: 'absolute', bottom: 24, left: '50%',
      transform: 'translateX(-50%)', zIndex: 30,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 20px',
      background: 'rgba(11,15,30,0.95)',
      border: '1px solid #1e2a45',
      borderRadius: 16,
      backdropFilter: 'blur(8px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: '#4a5e80', letterSpacing: 2, marginRight: 4 }}>
        DRAG →
      </span>
      {DRAGGABLE.map(shape => (
        <div
          key={shape.id}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'copy'
            onDragStart(shape.id)
          }}
          onDragEnd={onDragEnd}
          onMouseEnter={() => setHovered(shape.id)}
          onMouseLeave={() => setHovered(null)}
          style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 4,
            padding: '8px 14px', borderRadius: 10,
            border: `1px solid ${hovered === shape.id ? '#00f5ff' : '#1e2a45'}`,
            background: hovered === shape.id ? 'rgba(0,245,255,0.06)' : '#111829',
            cursor: 'grab', userSelect: 'none',
            transition: 'all 0.15s',
            boxShadow: hovered === shape.id ? '0 0 8px #00f5ff44' : 'none',
          }}
        >
          <span style={{ fontSize: 20, color: hovered === shape.id ? '#00f5ff' : '#4a5e80', lineHeight: 1 }}>
            {shape.icon}
          </span>
          <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 8, color: hovered === shape.id ? '#00f5ff' : '#4a5e80', letterSpacing: 1 }}>
            {shape.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Shape Renderer ────────────────────────────────────────────────
function ShapeEl({ shape, selected, isPreview, onClickShape }) {
  const style = {
    stroke:          shape.color,
    strokeWidth:     shape.strokeWidth,
    fill:            'none',
    opacity:         isPreview ? 0.5 : 1,
    strokeDasharray: isPreview ? '6 3' : 'none',
    filter:          selected  ? `drop-shadow(0 0 6px ${shape.color})` : 'none',
    cursor:          'inherit',
    transition:      'filter 0.15s',
  }

  if (shape.type === 'rectangle') {
    return (
      <rect
        x={shape.x} y={shape.y}
        width={Math.max(shape.width, 1)}
        height={Math.max(shape.height, 1)}
        rx={2}
        style={style}
        onClick={onClickShape}
      />
    )
  }

  if (shape.type === 'circle') {
    return (
      <ellipse
        cx={shape.x + shape.width  / 2}
        cy={shape.y + shape.height / 2}
        rx={Math.max(shape.width  / 2, 1)}
        ry={Math.max(shape.height / 2, 1)}
        style={style}
        onClick={onClickShape}
      />
    )
  }

  if (shape.type === 'line') {
    return (
      <line
        x1={shape.x1} y1={shape.y1}
        x2={shape.x2} y2={shape.y2}
        style={style}
        onClick={onClickShape}
      />
    )
  }

  return null
}