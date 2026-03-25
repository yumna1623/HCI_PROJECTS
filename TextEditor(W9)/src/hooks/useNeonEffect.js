import { useEffect, useRef } from 'react';

export function useNeonEffect(canvasRef) {
  const animRef    = useRef(null);
  const stateRef   = useRef({
    active:   false,
    progress: 0,   // 0 → 1 around the perimeter
    fade:     1,   // opacity multiplier
    phase:    'travel', // 'travel' | 'fade'
    pulses:   [],  // array of independent light pulses
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── helpers ──────────────────────────────────────────────────
    function perimeterPoint(t, w, h) {
      const perim = 2 * (w + h);
      const p = ((t * perim) % perim + perim) % perim;
      if (p < w)           return [p, 0,           'top'];
      if (p < w + h)       return [w, p - w,        'right'];
      if (p < 2 * w + h)   return [w - (p-w-h), h,  'bottom'];
      return               [0,   h - (p-2*w-h),     'left'];
    }

    function drawPulse(ctx, w, h, progress, color, glowColor, lineW, trailLen, fade) {
      const perim = 2 * (w + h);
      const steps = 60;

      ctx.save();
      ctx.shadowColor = glowColor;
      ctx.shadowBlur  = 24;
      ctx.lineWidth   = lineW;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';

      // Draw trail — brightest at head, fading behind
      for (let i = steps; i >= 0; i--) {
        const t   = progress - (i / steps) * trailLen;
        const t2  = progress - ((i - 1) / steps) * trailLen;
        const [x1, y1] = perimeterPoint(t,  w, h);
        const [x2, y2] = perimeterPoint(t2, w, h);
        const alpha = (1 - i / steps) * fade;

        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      ctx.restore();
    }

    function drawVertexGlow(ctx, w, h, fade) {
      const corners = [[0,0], [w,0], [w,h], [0,h]];
      const colors  = ['#00f5ff', '#bf5fff', '#ff2d78', '#00ff9d'];
      corners.forEach(([cx, cy], i) => {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
        grad.addColorStop(0, colors[i].replace(')', `,${0.6 * fade})`).replace('rgb', 'rgba').replace('#', 'rgba(') );
        grad.addColorStop(1, 'transparent');

        // simpler approach: just use shadowBlur circle
        ctx.save();
        ctx.globalAlpha   = 0.7 * fade;
        ctx.fillStyle     = colors[i];
        ctx.shadowColor   = colors[i];
        ctx.shadowBlur    = 20;
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    function draw3DBorderEffect(ctx, w, h, fade) {
      // Subtle 3D edge — top-left lighter, bottom-right darker
      const depth = 6;

      // Top edge highlight
      const topGrad = ctx.createLinearGradient(0, 0, w, 0);
      topGrad.addColorStop(0,   `rgba(0,245,255,${0.15 * fade})`);
      topGrad.addColorStop(0.5, `rgba(0,245,255,${0.05 * fade})`);
      topGrad.addColorStop(1,   `rgba(0,245,255,${0.0})`);
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, w, depth);

      // Left edge highlight
      const leftGrad = ctx.createLinearGradient(0, 0, 0, h);
      leftGrad.addColorStop(0,   `rgba(0,245,255,${0.12 * fade})`);
      leftGrad.addColorStop(1,   `rgba(0,245,255,${0.0})`);
      ctx.fillStyle = leftGrad;
      ctx.fillRect(0, 0, depth, h);

      // Bottom edge shadow
      const btmGrad = ctx.createLinearGradient(0, h - depth, 0, h);
      btmGrad.addColorStop(0, `rgba(0,0,0,0)`);
      btmGrad.addColorStop(1, `rgba(0,0,0,${0.4 * fade})`);
      ctx.fillStyle = btmGrad;
      ctx.fillRect(0, h - depth, w, depth);

      // Right edge shadow
      const rGrad = ctx.createLinearGradient(w - depth, 0, w, 0);
      rGrad.addColorStop(0, `rgba(0,0,0,0)`);
      rGrad.addColorStop(1, `rgba(0,0,0,${0.3 * fade})`);
      ctx.fillStyle = rGrad;
      ctx.fillRect(w - depth, 0, depth, h);
    }

    function tick() {
      const ctx = canvas.getContext('2d');
      const w   = canvas.width;
      const h   = canvas.height;

      ctx.clearRect(0, 0, w, h);

      const s = stateRef.current;
      if (!s.active) {
        animRef.current = requestAnimationFrame(tick);
        return;
      }

      // Advance each pulse
      s.pulses = s.pulses.map(p => {
        p.progress += p.speed;
        p.life     -= 0.008;
        return p;
      }).filter(p => p.life > 0);

      // Draw 3D border
      draw3DBorderEffect(ctx, w, h, Math.max(...s.pulses.map(p => p.life), 0));

      // Draw vertex glows
      const maxLife = Math.max(...s.pulses.map(p => p.life), 0);
      drawVertexGlow(ctx, w, h, maxLife);

      // Draw pulses
      s.pulses.forEach(p => {
        drawPulse(ctx, w, h, p.progress, p.color, p.glowColor, p.lineWidth, p.trailLen, p.life);
      });

      if (s.pulses.length === 0) s.active = false;

      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [canvasRef]);

  const trigger = () => {
    const s = stateRef.current;
    s.active = true;

    // Add 3 staggered pulses with different colors/speeds
    const configs = [
      { color: '#00f5ff', glowColor: '#00f5ffcc', speed: 0.004, trailLen: 0.18, lineWidth: 2.5, offset: 0     },
      { color: '#bf5fff', glowColor: '#bf5fffcc', speed: 0.003, trailLen: 0.14, lineWidth: 2,   offset: 0.3   },
      { color: '#ff2d78', glowColor: '#ff2d78cc', speed: 0.005, trailLen: 0.10, lineWidth: 1.5, offset: 0.6   },
    ];

    configs.forEach(c => {
      s.pulses.push({
        progress:  c.offset,
        speed:     c.speed,
        color:     c.color,
        glowColor: c.glowColor,
        lineWidth: c.lineWidth,
        trailLen:  c.trailLen,
        life:      1.0,
      });
    });
  };

  return { trigger };
}