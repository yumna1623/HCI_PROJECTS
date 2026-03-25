import { useRef, useState, useCallback } from 'react';
import { TOOLS } from '../constants/tools';

export function useDrawing({ activeTool, activeColor, strokeWidth, shapes, pushHistory, drawMode }) {
  const isDrawing  = useRef(false);
  const startPos   = useRef({ x: 0, y: 0 });
  const [preview, setPreview] = useState(null);

  // For drag & drop
  const [draggingTool, setDraggingTool] = useState(null);
  const [dragPos, setDragPos]           = useState({ x: 0, y: 0 });
  const isDraggingOnCanvas              = useRef(false);

  const getPos = (e, rect) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const makeShape = useCallback((start, end, tool) => ({
    id: Date.now() + Math.random(),
    type: tool,
    x:      Math.min(start.x, end.x),
    y:      Math.min(start.y, end.y),
    width:  Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
    x1: start.x, y1: start.y,
    x2: end.x,   y2: end.y,
    color: activeColor,
    strokeWidth,
    fill: 'none',
  }), [activeColor, strokeWidth]);

  // ── RUBBER BAND ──────────────────────────────────────────────
  const onMouseDown_RubberBand = useCallback((e, rect) => {
    if (activeTool === TOOLS.SELECT.id || activeTool === TOOLS.ERASER.id) return;
    isDrawing.current = true;
    startPos.current  = getPos(e, rect);
  }, [activeTool]);

  const onMouseMove_RubberBand = useCallback((e, rect) => {
    if (!isDrawing.current) return;
    const cur = getPos(e, rect);
    setPreview(makeShape(startPos.current, cur, activeTool));
  }, [activeTool, makeShape]);

  const onMouseUp_RubberBand = useCallback((e, rect) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const cur = getPos(e, rect);
    if (Math.abs(cur.x - startPos.current.x) < 3 && Math.abs(cur.y - startPos.current.y) < 3) {
      setPreview(null);
      return;
    }
    pushHistory([...shapes, makeShape(startPos.current, cur, activeTool)]);
    setPreview(null);
  }, [activeTool, makeShape, shapes, pushHistory]);

  // ── CLICK TO PLACE ───────────────────────────────────────────
  const onClick_Click = useCallback((e, rect) => {
    if (activeTool === TOOLS.SELECT.id || activeTool === TOOLS.ERASER.id) return;
    const pos  = getPos(e, rect);
    const SIZE = 80;
    pushHistory([...shapes, makeShape(
      { x: pos.x - SIZE / 2, y: pos.y - SIZE / 2 },
      { x: pos.x + SIZE / 2, y: pos.y + SIZE / 2 },
      activeTool
    )]);
  }, [activeTool, makeShape, shapes, pushHistory]);

  // ── DRAG & DROP ──────────────────────────────────────────────
  // Called from the DragDropToolbar when user starts dragging a tool icon
  const onDragStart_Tool = useCallback((toolId) => {
    setDraggingTool(toolId);
  }, []);

  const onDragOver_Canvas = useCallback((e, rect) => {
    e.preventDefault();
    if (!draggingTool) return;
    const pos = getPos(e, rect);
    setDragPos(pos);
    const SIZE = 80;
    setPreview(makeShape(
      { x: pos.x - SIZE / 2, y: pos.y - SIZE / 2 },
      { x: pos.x + SIZE / 2, y: pos.y + SIZE / 2 },
      draggingTool
    ));
    isDraggingOnCanvas.current = true;
  }, [draggingTool, makeShape]);

  const onDrop_Canvas = useCallback((e, rect) => {
    e.preventDefault();
    if (!draggingTool) return;
    const pos  = getPos(e, rect);
    const SIZE = 80;
    pushHistory([...shapes, makeShape(
      { x: pos.x - SIZE / 2, y: pos.y - SIZE / 2 },
      { x: pos.x + SIZE / 2, y: pos.y + SIZE / 2 },
      draggingTool
    )]);
    setPreview(null);
    setDraggingTool(null);
    isDraggingOnCanvas.current = false;
  }, [draggingTool, makeShape, shapes, pushHistory]);

  const onDragLeave_Canvas = useCallback(() => {
    setPreview(null);
    isDraggingOnCanvas.current = false;
  }, []);

  const onDragEnd_Tool = useCallback(() => {
    if (!isDraggingOnCanvas.current) {
      setPreview(null);
      setDraggingTool(null);
    }
  }, []);

  return {
    preview,
    draggingTool,
    handlers: {
      rubberBand: { onMouseDown_RubberBand, onMouseMove_RubberBand, onMouseUp_RubberBand },
      click:      { onClick_Click },
      dragDrop:   { onDragOver_Canvas, onDrop_Canvas, onDragLeave_Canvas, onDragStart_Tool, onDragEnd_Tool },
    },
  };
}