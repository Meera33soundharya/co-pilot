import { useEffect, useRef } from "react";

/**
 * SegmentedRing
 * Replicates the exact dashed-arc rotating circle design:
 * multiple concentric rings with segmented arcs rotating at
 * different speeds and directions, on a dark blue grid background.
 */
export default function SegmentedRing({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasEl = canvas;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    const drawingContext = ctx;

    const resize = () => {
      canvasEl.width  = canvasEl.offsetWidth  * window.devicePixelRatio;
      canvasEl.height = canvasEl.offsetHeight * window.devicePixelRatio;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvasEl);

    // ── Ring definitions (matches image exactly) ─────────────────
    // Each ring: radius factor, segments count, gap ratio, speed, dir, width, color, opacity
    const rings = [
      // Outermost — 4 thick wide arcs
      { rFactor: 0.42, segs: 4,  gapRatio: 0.38, speed: 0.18, dir:  1, lw: 0.035, color: [220, 240, 255], alpha: 0.95 },
      // Second outer — 8 medium arcs
      { rFactor: 0.36, segs: 8,  gapRatio: 0.30, speed: 0.28, dir: -1, lw: 0.025, color: [200, 230, 255], alpha: 0.85 },
      // Middle thick — 4 arcs (shorter)
      { rFactor: 0.30, segs: 4,  gapRatio: 0.45, speed: 0.22, dir:  1, lw: 0.030, color: [180, 220, 255], alpha: 0.90 },
      // Inner medium — 8 thin arcs
      { rFactor: 0.24, segs: 8,  gapRatio: 0.35, speed: 0.35, dir: -1, lw: 0.018, color: [160, 210, 255], alpha: 0.80 },
      // Inner ring — 4 small arcs
      { rFactor: 0.18, segs: 4,  gapRatio: 0.40, speed: 0.40, dir:  1, lw: 0.020, color: [140, 200, 255], alpha: 0.75 },
      // Innermost solid circle ring
      { rFactor: 0.12, segs: 1,  gapRatio: 0.00, speed: 0.00, dir:  1, lw: 0.012, color: [120, 190, 255], alpha: 0.65 },
    ];

    // ── Pulse rings (expanding from center) ──────────────────────
    let startTime: number | null = null;

    function drawGrid(W: number, H: number) {
      // Dark blue pixelated grid background (matches the image)
      const grad = drawingContext.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0,   "#0a1628");
      grad.addColorStop(0.5, "#0d1f3c");
      grad.addColorStop(1,   "#0a1628");
      drawingContext.fillStyle = grad;
      drawingContext.fillRect(0, 0, W, H);

      // Pixel grid overlay
      const cell = Math.round(W / 32);
      drawingContext.strokeStyle = "rgba(30,80,160,0.35)";
      drawingContext.lineWidth   = 0.5;
      for (let x = 0; x < W; x += cell) {
        drawingContext.beginPath(); drawingContext.moveTo(x, 0); drawingContext.lineTo(x, H); drawingContext.stroke();
      }
      for (let y = 0; y < H; y += cell) {
        drawingContext.beginPath(); drawingContext.moveTo(0, y); drawingContext.lineTo(W, y); drawingContext.stroke();
      }
    }

    function drawSegmentedRing(
      cx: number, cy: number, r: number,
      segs: number, gapRatio: number,
      rotation: number, lw: number,
      color: number[], alpha: number
    ) {
      if (segs <= 1) {
        // Solid circle
        drawingContext.beginPath(); drawingContext.arc(cx, cy, r, 0, Math.PI * 2);
        drawingContext.strokeStyle = `rgba(${color.join(",")},${alpha})`;
        drawingContext.lineWidth   = lw;
        drawingContext.stroke();
        return;
      }

      const totalAngle = Math.PI * 2;
      const segAngle   = totalAngle / segs;
      const gapAngle   = segAngle * gapRatio;
      const arcAngle   = segAngle - gapAngle;

      for (let i = 0; i < segs; i++) {
        const startAngle = rotation + i * segAngle + gapAngle / 2;
        const endAngle   = startAngle + arcAngle;

        drawingContext.beginPath();
        drawingContext.arc(cx, cy, r, startAngle, endAngle);
        drawingContext.strokeStyle = `rgba(${color.join(",")},${alpha})`;
        drawingContext.lineWidth   = lw;
        drawingContext.lineCap     = "round";
        drawingContext.stroke();
      }
    }

    function drawCenterIcon(cx: number, cy: number, r: number, t: number) {
      // Filled dark blue center circle
      const grad = drawingContext.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0,   "rgba(15,35,80,0.95)");
      grad.addColorStop(0.7, "rgba(10,25,60,0.98)");
      grad.addColorStop(1,   "rgba(8,20,50,1)");
      drawingContext.beginPath(); drawingContext.arc(cx, cy, r, 0, Math.PI * 2);
      drawingContext.fillStyle = grad; drawingContext.fill();

      // Thin inner ring border
      drawingContext.beginPath(); drawingContext.arc(cx, cy, r, 0, Math.PI * 2);
      drawingContext.strokeStyle = "rgba(100,180,255,0.4)";
      drawingContext.lineWidth   = r * 0.04; drawingContext.stroke();

      // ── GovPilot icon: shield + brain circuit ────────────────
      const iconSize = r * 0.55;
      drawingContext.save();
      drawingContext.translate(cx, cy);

      // Pulsing glow behind icon
      const pulse = 0.7 + 0.3 * Math.sin(t * 2);
      const glow  = drawingContext.createRadialGradient(0, 0, 0, 0, 0, iconSize * 1.4);
      glow.addColorStop(0,   `rgba(60,160,255,${0.35 * pulse})`);
      glow.addColorStop(0.5, `rgba(40,100,255,${0.15 * pulse})`);
      glow.addColorStop(1,   "transparent");
      drawingContext.fillStyle = glow;
      drawingContext.beginPath(); drawingContext.arc(0, 0, iconSize * 1.4, 0, Math.PI * 2);
      drawingContext.fill();

      // Shield body
      const sh = iconSize;
      drawingContext.beginPath();
      drawingContext.moveTo(0, -sh);
      drawingContext.bezierCurveTo( sh * 0.9, -sh * 0.7,  sh * 0.9, sh * 0.1,  0, sh);
      drawingContext.bezierCurveTo(-sh * 0.9, sh * 0.1,  -sh * 0.9, -sh * 0.7, 0, -sh);
      drawingContext.fillStyle   = "rgba(20,60,140,0.85)";
      drawingContext.strokeStyle = "rgba(80,170,255,0.85)";
      drawingContext.lineWidth   = r * 0.03;
      drawingContext.fill(); drawingContext.stroke();

      // Brain circuit lines inside shield
      drawingContext.strokeStyle = `rgba(100,200,255,${0.75 * pulse})`;
      drawingContext.lineWidth   = r * 0.025;
      const nodes = [
        [-sh*0.3, -sh*0.2], [sh*0.3, -sh*0.2],
        [-sh*0.1,  sh*0.1], [sh*0.1,  sh*0.1],
        [0,       -sh*0.5], [0,        sh*0.35],
      ];
      const edges = [[0,2],[1,3],[0,4],[1,4],[2,5],[3,5],[4,2],[4,3]];
      edges.forEach(([a, b]) => {
        drawingContext.beginPath();
        drawingContext.moveTo(nodes[a][0], nodes[a][1]);
        drawingContext.lineTo(nodes[b][0], nodes[b][1]);
        drawingContext.stroke();
      });
      // Node dots
      nodes.forEach(([nx, ny]) => {
        drawingContext.beginPath(); drawingContext.arc(nx, ny, r * 0.025, 0, Math.PI * 2);
        drawingContext.fillStyle = `rgba(150,220,255,${pulse})`; drawingContext.fill();
      });

      drawingContext.restore();
    }

    function drawPulseWaves(cx: number, cy: number, t: number, baseR: number) {
      for (let i = 0; i < 3; i++) {
        const phase  = ((t * 0.5 + i * 0.33) % 1);
        const r      = baseR * 0.45 + phase * baseR * 0.25;
        const alpha  = (1 - phase) * 0.45;
        drawingContext.beginPath(); drawingContext.arc(cx, cy, r, 0, Math.PI * 2);
        drawingContext.strokeStyle = `rgba(60,160,255,${alpha})`;
        drawingContext.lineWidth   = 1.5;
        drawingContext.stroke();
      }
    }

    function frame(ts: number) {
      if (!startTime) startTime = ts;
      const t = (ts - startTime) / 1000;
      const W = canvasEl.width, H = canvasEl.height;
      const cx = W / 2, cy = H / 2;
      const baseR = Math.min(W, H) * 0.46; // overall radius scale

      drawingContext.clearRect(0, 0, W, H);

      // ── 1. Dark blue grid background ─────────────────────────
      drawGrid(W, H);

      // ── 2. Outer glow aura ────────────────────────────────────
      const aura = drawingContext.createRadialGradient(cx, cy, 0, cx, cy, baseR * 1.1);
      aura.addColorStop(0,   "rgba(30,100,220,0.12)");
      aura.addColorStop(0.6, "rgba(10,50,180,0.06)");
      aura.addColorStop(1,   "transparent");
      drawingContext.fillStyle = aura; drawingContext.fillRect(0, 0, W, H);

      // ── 3. All segmented rings ────────────────────────────────
      rings.forEach(ring => {
        const r        = baseR * ring.rFactor;
        const rotation = t * ring.speed * ring.dir;
        const lw       = Math.min(W, H) * ring.lw;

        // Glow behind each ring
        const ringGlow = drawingContext.createRadialGradient(cx, cy, r - lw * 2, cx, cy, r + lw * 2);
        ringGlow.addColorStop(0,   "transparent");
        ringGlow.addColorStop(0.5, `rgba(${ring.color.join(",")},${ring.alpha * 0.25})`);
        ringGlow.addColorStop(1,   "transparent");
        drawingContext.beginPath(); drawingContext.arc(cx, cy, r, 0, Math.PI * 2);
        drawingContext.strokeStyle = ringGlow; drawingContext.lineWidth = lw * 3; drawingContext.stroke();

        drawSegmentedRing(cx, cy, r, ring.segs, ring.gapRatio, rotation, lw, ring.color, ring.alpha);
      });

      // ── 4. Pulse waves ────────────────────────────────────────
      drawPulseWaves(cx, cy, t, baseR);

      // ── 5. Center icon ────────────────────────────────────────
      const innerR = baseR * rings[rings.length - 1].rFactor * 0.85;
      drawCenterIcon(cx, cy, baseR * 0.10, t);

      // ── 6. Scan-line overlay (subtle) ─────────────────────────
      for (let y = 0; y < H; y += 5) {
        drawingContext.fillStyle = "rgba(0,0,0,0.018)";
        drawingContext.fillRect(0, y, W, 1);
      }

      animRef.current = requestAnimationFrame(frame);
    }

    animRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
