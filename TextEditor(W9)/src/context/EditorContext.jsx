import { createContext, useContext, useState, useCallback } from 'react';
import { TOOLS } from '../constants/tools';

const EditorContext = createContext(null);

export function EditorProvider({ config, children }) {
  const [activeTool, setActiveTool]     = useState(TOOLS.SELECT.id);
  const [activeColor, setActiveColor]   = useState('#00f5ff');
  const [strokeWidth, setStrokeWidth]   = useState(2);
  const [shapes, setShapes]             = useState([]);
  const [history, setHistory]           = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback((newShapes) => {
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newShapes];
    });
    setHistoryIndex(prev => prev + 1);
    setShapes(newShapes);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setShapes(history[newIndex]);
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setShapes(history[newIndex]);
  }, [historyIndex, history]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <EditorContext.Provider value={{
      config,
      activeTool, setActiveTool,
      activeColor, setActiveColor,
      strokeWidth, setStrokeWidth,
      shapes, pushHistory,
      undo, redo, canUndo, canRedo,
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export const useEditor = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used inside EditorProvider');
  return ctx;
};