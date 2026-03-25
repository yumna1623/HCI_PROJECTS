import { useState } from "react";

const SECTIONS = [
  {
    id: "layout",
    label: "Toolbar Layout",
    color: "cyan",
    icon: "⊞",
    desc: "How should your tools be arranged?",
    options: [
      { value: "grid", label: "2×8 Grid", sub: "Compact matrix" },
      { value: "vertical", label: "1×16 Vertical", sub: "Single column" },
      { value: "horizontal", label: "Horizontal", sub: "Top bar row" },
    ],
  },
  {
    id: "palette",
    label: "Palette Position",
    color: "purple",
    icon: "⬡",
    desc: "Where should the color palette appear?",
    options: [
      { value: "left", label: "Left", sub: "" },
      { value: "right", label: "Right", sub: "" },
      { value: "top", label: "Top", sub: "" },
      { value: "bottom", label: "Bottom", sub: "" },
    ],
  },
  {
    id: "drawMode",
    label: "Shape Interaction Mode",
    color: "pink",
    icon: "⟡",
    desc: "How would you like to draw shapes?",
    options: [
      { value: "rubberBand", label: "Rubber Band", sub: "Drag to draw" },
      { value: "click", label: "Click to Place", sub: "Click canvas" },
      { value: "dragDrop", label: "Drag & Drop", sub: "Drag from palette" },
    ],
  },
  {
    id: "toolSize",
    label: "Tool Size",
    color: "green",
    icon: "⊕",
    desc: "How large should the toolbar icons be?",
    options: [
      { value: "small", label: "Small", sub: "More tools visible" },
      { value: "medium", label: "Medium", sub: "Balanced" },
      { value: "large", label: "Large", sub: "Easy to click" },
    ],
  },
];

const DEFAULTS = {
  layout: "grid",
  palette: "left",
  drawMode: "rubberBand",
  toolSize: "medium",
};

const COLOR_MAP = {
  cyan: {
    border: "#00f5ff",
    bg: "rgba(0,245,255,0.07)",
    glow: "0 0 8px #00f5ff88, 0 0 20px #00f5ff44",
  },
  purple: {
    border: "#bf5fff",
    bg: "rgba(191,95,255,0.07)",
    glow: "0 0 8px #bf5fff88, 0 0 20px #bf5fff44",
  },
  pink: {
    border: "#ff2d78",
    bg: "rgba(255,45,120,0.07)",
    glow: "0 0 8px #ff2d7888, 0 0 20px #ff2d7844",
  },
  green: {
    border: "#00ff9d",
    bg: "rgba(0,255,157,0.07)",
    glow: "0 0 8px #00ff9d88, 0 0 20px #00ff9d44",
  },
};

export default function PreferenceForm({ onSubmit }) {
  const [prefs, setPrefs] = useState(DEFAULTS);
  const [submitted, setSubmitted] = useState(false);

  const set = (key, val) => setPrefs((p) => ({ ...p, [key]: val }));

  const handleSubmit = () => {
    const config = { ...prefs, theme: "dark" };
    setSubmitted(true);
    setTimeout(() => onSubmit(config), 600);
  };

  return (
    <div className="pf-root">
      {/* Grid background */}
      <div className="pf-grid-bg" />
      <div className="pf-radial-bg" />

      <div className="pf-container">
        {/* Header */}
        <div className="pf-header">
          <div className="pf-eyebrow">// HCI Drawing Editor</div>
          <h1 className="pf-title">Configure Your Workspace</h1>
          <p className="pf-subtitle">
            Personalize your editor layout, tools, and interaction style
          </p>
        </div>

        {/* Card */}
        <div className="pf-card">
          <div className="pf-card-top-line" />
          {["tl", "tr", "bl", "br"].map((c) => (
            <div key={c} className={`pf-corner pf-corner-${c}`} />
          ))}

          {SECTIONS.map((section, si) => {
            const cols = section.options.length === 4 ? 4 : 3;
            const cm = COLOR_MAP[section.color];
            return (
              <div key={section.id}>
                {si > 0 && <div className="pf-divider" />}
                <div className="pf-section">
                  <div className="pf-section-header">
                    <div className={`pf-icon pf-icon-${section.color}`}>
                      {section.icon}
                    </div>
                    <div>
                      <div className="pf-section-title">{section.label}</div>
                      <div className="pf-section-desc">{section.desc}</div>
                    </div>
                  </div>
                  <div className={`pf-options pf-options-cols-${cols}`}>
                    {section.options.map((opt) => {
                      const active = prefs[section.id] === opt.value;
                      return (
                        <div
                          key={opt.value}
                          className="pf-option"
                          onClick={() => set(section.id, opt.value)}
                          style={
                            active
                              ? {
                                  borderColor: cm.border,
                                  background: cm.bg,
                                  boxShadow: cm.glow,
                                }
                              : {}
                          }
                        >
                          <div
                            className="pf-check"
                            style={
                              active
                                ? {
                                    background: cm.border,
                                    borderColor: cm.border,
                                    color: "#050810",
                                  }
                                : {}
                            }
                          >
                            ✓
                          </div>
                          <div className="pf-opt-text">{opt.label}</div>
                          {opt.sub && (
                            <div className="pf-opt-sub">{opt.sub}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Live config preview */}
          <div className="pf-preview">
            <span className="pf-prev-label">layout: </span>
            <span className="pf-prev-cyan">{prefs.layout}</span>
            <span className="pf-prev-label"> · palette: </span>
            <span className="pf-prev-purple">{prefs.palette}</span>
            <span className="pf-prev-label"> · drawMode: </span>
            <span className="pf-prev-pink">{prefs.drawMode}</span>
            <span className="pf-prev-label"> · toolSize: </span>
            <span className="pf-prev-green">{prefs.toolSize}</span>
            <span className="pf-prev-label"> · theme: </span>
            <span className="pf-prev-cyan">dark</span>
          </div>

          {/* Actions */}
          <div className="pf-actions">
            <button className="pf-reset" onClick={() => setPrefs(DEFAULTS)}>
              ↺ Reset
            </button>
            <button
              className={`pf-submit ${submitted ? "pf-submit-done" : ""}`}
              onClick={handleSubmit}
            >
              {submitted ? "✓ Launching..." : "Launch Editor →"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .pf-root {
  min-height: 100vh;
  height: 100vh;
  background: #050810;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 20px;
  font-family: 'Rajdhani', sans-serif;
  color: #c8d8f0;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
}
        .pf-grid-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .pf-radial-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,245,255,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(191,95,255,0.05) 0%, transparent 60%);
        }
        .pf-container { position: relative; z-index: 1; width: 100%; max-width: 780px; }
        .pf-header { text-align: center; margin-bottom: 40px; }
        .pf-eyebrow {
          font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 600;
          letter-spacing: 4px; color: #00f5ff; text-transform: uppercase;
          margin-bottom: 12px; opacity: 0.8;
        }
        .pf-title {
          font-family: 'Orbitron', monospace; font-size: clamp(22px, 5vw, 38px);
          font-weight: 900; letter-spacing: 2px;
          background: linear-gradient(135deg, #fff 0%, #00f5ff 50%, #bf5fff 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; margin-bottom: 10px;
        }
        .pf-subtitle { font-size: 14px; color: #4a5e80; }
        .pf-card {
          background: #0b0f1e; border: 1px solid #1e2a45;
          border-radius: 16px; padding: 40px; position: relative; overflow: hidden;
        }
        .pf-card-top-line {
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, #00f5ff, #bf5fff, transparent);
        }
        .pf-corner {
          position: absolute; width: 18px; height: 18px; opacity: 0.4;
        }
        .pf-corner-tl { top: 12px; left: 12px; border-top: 2px solid #00f5ff; border-left: 2px solid #00f5ff; border-radius: 2px 0 0 0; }
        .pf-corner-tr { top: 12px; right: 12px; border-top: 2px solid #00f5ff; border-right: 2px solid #00f5ff; border-radius: 0 2px 0 0; }
        .pf-corner-bl { bottom: 12px; left: 12px; border-bottom: 2px solid #bf5fff; border-left: 2px solid #bf5fff; border-radius: 0 0 0 2px; }
        .pf-corner-br { bottom: 12px; right: 12px; border-bottom: 2px solid #bf5fff; border-right: 2px solid #bf5fff; border-radius: 0 0 2px 0; }
        .pf-section { margin-bottom: 0; }
        .pf-divider { height: 1px; background: linear-gradient(90deg, transparent, #1e2a45, transparent); margin: 32px 0; }
        .pf-section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
        .pf-icon {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;
        }
        .pf-icon-cyan   { background: rgba(0,245,255,0.1); border: 1px solid rgba(0,245,255,0.3); color: #00f5ff; }
        .pf-icon-purple { background: rgba(191,95,255,0.1); border: 1px solid rgba(191,95,255,0.3); color: #bf5fff; }
        .pf-icon-pink   { background: rgba(255,45,120,0.1); border: 1px solid rgba(255,45,120,0.3); color: #ff2d78; }
        .pf-icon-green  { background: rgba(0,255,157,0.1); border: 1px solid rgba(0,255,157,0.3); color: #00ff9d; }
        .pf-section-title { font-family: 'Orbitron', monospace; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; }
        .pf-section-desc { font-size: 12px; color: #4a5e80; margin-top: 2px; }
        .pf-options { display: grid; gap: 10px; }
        .pf-options-cols-3 { grid-template-columns: repeat(3, 1fr); }
        .pf-options-cols-4 { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 580px) {
          .pf-options-cols-3, .pf-options-cols-4 { grid-template-columns: repeat(2, 1fr); }
          .pf-card { padding: 24px; }
        }
        .pf-option {
          position: relative; padding: 16px 12px;
          background: #111829; border: 1px solid #1e2a45;
          border-radius: 12px; cursor: pointer;
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          text-align: center; transition: all 0.18s ease; user-select: none;
        }
        .pf-option:hover { border-color: rgba(0,245,255,0.3); background: rgba(0,245,255,0.03); transform: translateY(-1px); }
        .pf-check {
          position: absolute; top: 8px; right: 8px;
          width: 15px; height: 15px; border-radius: 50%;
          border: 1px solid #1e2a45; background: #111829;
          display: flex; align-items: center; justify-content: center;
          font-size: 8px; color: transparent; transition: all 0.18s;
        }
        .pf-opt-text { font-size: 12px; font-weight: 600; letter-spacing: 0.4px; color: #c8d8f0; }
        .pf-opt-sub { font-size: 10px; color: #4a5e80; }
        .pf-preview {
          margin-top: 28px; padding: 14px 18px;
          background: rgba(0,245,255,0.03); border: 1px solid rgba(0,245,255,0.12);
          border-radius: 10px; font-family: 'Orbitron', monospace;
          font-size: 10px; letter-spacing: 0.4px; line-height: 1.9;
          word-break: break-word;
        }
        .pf-prev-label  { color: #4a5e80; }
        .pf-prev-cyan   { color: #00f5ff; }
        .pf-prev-purple { color: #bf5fff; }
        .pf-prev-pink   { color: #ff2d78; }
        .pf-prev-green  { color: #00ff9d; }
        .pf-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 28px; }
        .pf-reset {
          background: none; border: 1px solid #1e2a45; color: #4a5e80;
          padding: 11px 22px; border-radius: 8px; cursor: pointer;
          font-family: 'Rajdhani', sans-serif; font-size: 13px;
          font-weight: 600; letter-spacing: 1px; text-transform: uppercase; transition: all 0.18s;
        }
        .pf-reset:hover { border-color: rgba(255,255,255,0.2); color: #c8d8f0; }
        .pf-submit {
          background: linear-gradient(135deg, rgba(0,245,255,0.15), rgba(191,95,255,0.15));
          border: 1px solid #00f5ff; color: #fff;
          padding: 12px 32px; border-radius: 8px; cursor: pointer;
          font-family: 'Orbitron', monospace; font-size: 11px;
          font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          transition: all 0.2s; box-shadow: 0 0 8px #00f5ff88, 0 0 20px #00f5ff44;
        }
        .pf-submit:hover { transform: translateY(-2px); box-shadow: 0 0 16px #00f5ffaa, 0 0 40px #00f5ff55; }
        .pf-submit-done { border-color: #00ff9d; box-shadow: 0 0 8px #00ff9d88; opacity: 0.8; }
      `}</style>
    </div>
  );
}
