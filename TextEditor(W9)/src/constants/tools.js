export const TOOLS = {
  SELECT:    { id: 'select',    label: 'Select',    icon: '↖', cursor: 'default' },
  RECTANGLE: { id: 'rectangle', label: 'Rectangle', icon: '▭', cursor: 'crosshair' },
  CIRCLE:    { id: 'circle',    label: 'Circle',    icon: '○', cursor: 'crosshair' },
  LINE:      { id: 'line',      label: 'Line',      icon: '╱', cursor: 'crosshair' },
  ERASER:    { id: 'eraser',    label: 'Eraser',    icon: '⌫', cursor: 'cell' },
}

export const TOOL_LIST = Object.values(TOOLS)

export const COLORS = [
  '#00f5ff', '#bf5fff', '#ff2d78', '#00ff9d',
  '#ff9500', '#ffffff', '#4a9eff', '#ffdd00',
  '#ff6b35', '#c8d8f0', '#ff4757', '#2ed573',
]

export const STROKE_WIDTHS = [1, 2, 3, 5, 8, 12]