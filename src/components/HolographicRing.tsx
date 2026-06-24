import { useEffect, useRef } from "react";

/**
 * HolographicRing
 * Draws the AI hands image as a full-canvas background, then
 * overlays rotating holographic rings, particles, circuit lines,
 * energy pulse, shockwaves, and HUD elements between the hands.
 */
export default function HolographicRing({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    // ── Sizing ──────────────────────────────────────────────────
    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ── Load background image ────────────────────────────────────
    const bgImg = new Image();
    bgImg.src = "/images/ai_hands_bg.png";
    let imgLoaded = false;
    bgImg.onload = () => { imgLoaded = true; };

    // ── Ring center — between the two hands (approx 50% x, 52% y) ──
    const getRingCenter = () => ({
      cx: canvas.width  * 0.50,
      cy: canvas.height * 0.52,
      scale: Math.min(canvas.width, canvas.height) / 700,
    });

    // ── Particles ────────────────────────────────────────────────
    const PARTICLE_COUNT = 65;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => {
      const speed = (Math.random() > 0.5 ? 1 : -1) * (0.25 + Math.random() * 0.55);
      return {
        orbitFactor: 0.18 + Math.random() * 0.30,   // fraction of min(W,H)
        speed,
        angle:  Math.random() * Math.PI * 2,
        size:   0.004 + Math.random() * 0.006,      // fraction of W
        alpha:  0.45 + Math.random() * 0.5,
        color:  Math.random() > 0.5 ? ([80, 180, 255] as number[]) : ([160, 80, 255] as number[]),
        yOff:   (Math.random() - 0.5) * 0.04,       // fraction of H
      };
    });

    // ── Circuit lines ────────────────────────────────────────────
    const CIRCUIT_COUNT = 16;
    const circuits = Array.from({ length: CIRCUIT_COUNT }, (_, i) => ({
      angle:    (i / CIRCUIT_COUNT) * Math.PI * 2,
      lenFactor: 0.15 + Math.random() * 0.22,        // fraction of min(W,H)
      segments:  Math.floor(3 + Math.random() * 4),
      speed:     0.7 + Math.random() * 1.3,
      phase:     Math.random() * Math.PI * 2,
      color:     Math.random() > 0.5 ? ([0, 200, 255] as number[]) : ([130, 60, 255] as number[]),
    }));

    // ── HUD arc segments ─────────────────────────────────────────
    const hudArcs = [
      { rFactor:0.43, start:0,          span:0.9,  color:[0,200,255],  w:1.5, dir:1,  spd:0.18 },
      { rFactor:0.45, start:Math.PI,    span:0.55, color:[160,80,255], w:1.0, dir:-1, spd:0.13 },
      { rFactor:0.52, start:0.5,        span:1.1,  color:[0,180,255],  w:0.8, dir:1,  spd:0.09 },
      { rFactor:0.29, start:1.0,        span:0.9,  color:[0,220,255],  w:1.0, dir:1,  spd:0.22 },
      { rFactor:0.60, start:2.0,        span:0.6,  color:[100,50,255], w:0.7, dir:-1, spd:0.07 },
    ];

    // ── Data tags ────────────────────────────────────────────────
    const dataTags = [
      { angleFactor: 0.4,          rFactor: 0.50, label: "SYNC 97.4%" },
      { angleFactor: 2.1,          rFactor: 0.54, label: "NODE ACTIVE" },
      { angleFactor: Math.PI+0.4,  rFactor: 0.51, label: "AI ENGINE" },
      { angleFactor: -0.9,         rFactor: 0.50, label: "LAT: 12ms" },
    ];

    // ── Ring draw helper ─────────────────────────────────────────
    function drawRing(
      cx: number, cy: number, r: number,
      t: number, dir: number, spd: number,
      color: number[], lw: number, segs: number, alpha: number
    ) {
      const rot = t * spd * dir;

      // Outer glow halo
      const grd = ctx.createRadialGradient(cx, cy, r - lw*4, cx, cy, r + lw*4);
      grd.addColorStop(0,   `rgba(${color},0)`);
      grd.addColorStop(0.5, `rgba(${color},${alpha * 0.55})`);
      grd.addColorStop(1,   `rgba(${color},0)`);
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = grd; ctx.lineWidth = lw + 8; ctx.stroke();

      // Dashed ring body
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(rot);
      const dashLen = (2 * Math.PI * r) / (segs * 2);
      ctx.setLineDash([dashLen * 0.65, dashLen * 0.35]);
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${color},${alpha})`;
      ctx.lineWidth = lw; ctx.stroke();
      ctx.setLineDash([]);

      // Node dots + tick lines
      for (let i = 0; i < segs; i++) {
        const a  = (i / segs) * Math.PI * 2;
        const nx = r * Math.cos(a), ny = r * Math.sin(a);
        const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, lw * 2.5);
        ng.addColorStop(0,   "rgba(255,255,255,0.95)");
        ng.addColorStop(0.4, `rgba(${color},0.9)`);
        ng.addColorStop(1,   "transparent");
        ctx.beginPath(); ctx.arc(nx, ny, lw * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = ng; ctx.fill();
        ctx.beginPath();
        ctx.moveTo(nx * 0.92, ny * 0.92); ctx.lineTo(nx * 1.08, ny * 1.08);
        ctx.strokeStyle = `rgba(${color},0.8)`; ctx.lineWidth = lw * 0.5; ctx.stroke();
      }
      ctx.restore();
    }

    function simpleRing(cx: number, cy: number, r: number, color: string, lw: number) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke();
    }

    // ── Main frame loop ──────────────────────────────────────────
    let startTime: number | null = null;

    function frame(ts: number) {
      if (!startTime) startTime = ts;
      const t = (ts - startTime) / 1000;
      const W = canvas.width, H = canvas.height;
      const { cx, cy, scale } = getRingCenter();
      const OUTER_R = scale * 155;
      const INNER_R = scale * 100;
      const minDim  = Math.min(W, H);

      ctx.clearRect(0, 0, W, H);

      // ── 1. Background image (or dark fallback) ────────────────
      if (imgLoaded) {
        // Cover-fit the image
        const imgAR = bgImg.naturalWidth / bgImg.naturalHeight;
        const canAR = W / H;
        let sw = W, sh = H, sx = 0, sy = 0;
        if (imgAR > canAR) { sw = H * imgAR; sx = (W - sw) / 2; }
        else               { sh = W / imgAR; sy = (H - sh) / 2; }
        ctx.drawImage(bgImg, sx, sy, sw, sh);

        // Subtle dark vignette so animations pop
        const vig = ctx.createRadialGradient(cx, cy, minDim * 0.15, cx, cy, minDim * 0.75);
        vig.addColorStop(0, "rgba(0,0,10,0.15)");
        vig.addColorStop(1, "rgba(0,0,10,0.65)");
        ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
      } else {
        // Dark blue fallback while image loads
        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.8);
        bg.addColorStop(0, "rgba(6,15,55,1)");
        bg.addColorStop(0.5,"rgba(3,10,35,1)");
        bg.addColorStop(1,  "rgba(0,3,14,1)");
        ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      }

      // ── 2. Atmospheric light rays from center ─────────────────
      const rayG = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.55);
      rayG.addColorStop(0, "rgba(80,150,255,0.18)");
      rayG.addColorStop(0.45,"rgba(100,50,255,0.08)");
      rayG.addColorStop(1, "transparent");
      ctx.fillStyle = rayG; ctx.fillRect(0, 0, W, H);

      // ── 3. HUD arc segments ───────────────────────────────────
      hudArcs.forEach(arc => {
        const r = minDim * arc.rFactor;
        const s = arc.start + t * arc.dir * arc.spd;
        ctx.beginPath(); ctx.arc(cx, cy, r, s, s + arc.span);
        ctx.strokeStyle = `rgba(${arc.color.join(",")},0.55)`;
        ctx.lineWidth   = arc.w * scale; ctx.stroke();
        // tick dot at end
        const ex = cx + r * Math.cos(s + arc.span);
        const ey = cy + r * Math.sin(s + arc.span);
        ctx.beginPath(); ctx.arc(ex, ey, arc.w * 2.5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${arc.color.join(",")},0.9)`; ctx.fill();
      });

      // ── 4. Circuit lines ──────────────────────────────────────
      circuits.forEach(c => {
        const progress = ((t * c.speed + c.phase) % 3) / 3;
        const maxLen   = minDim * c.lenFactor;
        const curLen   = progress * maxLen;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(c.angle);
        ctx.strokeStyle = `rgba(${c.color.join(",")},${0.55 * (1 - progress)})`;
        ctx.lineWidth   = 1.2 * scale;
        ctx.beginPath();
        let x = OUTER_R, y = 0; ctx.moveTo(x, y);
        const segLen = curLen / c.segments;
        for (let s = 0; s < c.segments; s++) {
          const dir = s % 2 === 0 ? 1 : -1;
          const nx = x + segLen * 0.7, ny = y + dir * segLen * 0.4;
          ctx.lineTo(nx, ny);
          ctx.fillStyle = `rgba(${c.color.join(",")},0.85)`;
          ctx.beginPath(); ctx.arc(nx, ny, 2.5 * scale, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.moveTo(nx, ny);
          x = nx; y = ny;
        }
        ctx.stroke(); ctx.restore();
      });

      // ── 5. Outer ring — clockwise ──────────────────────────────
      drawRing(cx, cy, OUTER_R, t, 1, 0.5, [0,190,255], 3.5*scale, 18, 0.88);

      // ── 6. Inner ring — counter-clockwise ─────────────────────
      drawRing(cx, cy, INNER_R, t, -1, 0.8, [160,80,255], 2.5*scale, 12, 0.78);

      // ── 7. Accent static rings ────────────────────────────────
      simpleRing(cx, cy, OUTER_R * 1.23, "rgba(0,180,255,0.18)",  1.2*scale);
      simpleRing(cx, cy, INNER_R * 0.76, "rgba(180,80,255,0.16)", 0.9*scale);
      simpleRing(cx, cy, OUTER_R * 1.50, "rgba(0,150,255,0.10)",  0.8*scale);

      // ── 8. Particles orbiting ─────────────────────────────────
      particles.forEach(p => {
        p.angle += p.speed * 0.016;
        const r  = minDim * p.orbitFactor;
        const px = cx + r * Math.cos(p.angle);
        const py = cy + r * Math.sin(p.angle) * 0.38 + H * p.yOff;
        const al = p.alpha * (0.6 + 0.4 * Math.sin(t * 2 + p.angle));
        const sz = W * p.size;
        const pg = ctx.createRadialGradient(px, py, 0, px, py, sz * 2.2);
        pg.addColorStop(0, `rgba(${p.color.join(",")},${al})`);
        pg.addColorStop(1, `rgba(${p.color.join(",")},0)`);
        ctx.beginPath(); ctx.arc(px, py, sz, 0, Math.PI * 2);
        ctx.fillStyle = pg; ctx.fill();
      });

      // ── 9. Energy burst at center ─────────────────────────────
      const pr = (30 + Math.sin(t * 3.2) * 9) * scale;
      const bg2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, pr * 3.8);
      bg2.addColorStop(0,    "rgba(255,255,255,0.98)");
      bg2.addColorStop(0.15, "rgba(140,230,255,0.88)");
      bg2.addColorStop(0.45, "rgba(100,60,255,0.38)");
      bg2.addColorStop(1,    "transparent");
      ctx.fillStyle = bg2; ctx.beginPath(); ctx.arc(cx, cy, pr * 3.8, 0, Math.PI * 2); ctx.fill();
      // bright inner core
      ctx.beginPath(); ctx.arc(cx, cy, pr * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.99)"; ctx.fill();

      // ── 10. Shockwave expanding rings ─────────────────────────
      for (let i = 0; i < 3; i++) {
        const sp = ((t * 0.65 + i * 0.33) % 1);
        const sr = sp * minDim * 0.40;
        const sa = (1 - sp) * 0.38;
        ctx.beginPath(); ctx.arc(cx, cy, sr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(80,180,255,${sa})`; ctx.lineWidth = 2 * scale; ctx.stroke();
      }

      // ── 11. Data tag labels ───────────────────────────────────
      ctx.font = `bold ${Math.round(10 * scale)}px "Courier New", monospace`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      dataTags.forEach(tag => {
        const r  = minDim * tag.rFactor;
        const a  = tag.angleFactor + t * 0.08;
        const tx = cx + r * Math.cos(a);
        const ty = cy + r * Math.sin(a) * 0.5;
        const tw = ctx.measureText(tag.label).width + 14 * scale;
        const th = 18 * scale;
        ctx.fillStyle = "rgba(0,10,32,0.82)";
        ctx.strokeStyle = "rgba(0,200,255,0.6)"; ctx.lineWidth = scale;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(tx - tw/2, ty - th/2, tw, th, 2*scale);
        else ctx.rect(tx - tw/2, ty - th/2, tw, th);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = "rgba(0,220,255,0.96)";
        ctx.fillText(tag.label, tx, ty);
        // dashed connector to ring edge
        const ex = cx + (OUTER_R + 8*scale) * Math.cos(a);
        const ey = cy + (OUTER_R + 8*scale) * Math.sin(a) * 0.5;
        ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(tx, ty);
        ctx.strokeStyle = "rgba(0,180,255,0.3)"; ctx.lineWidth = 0.8*scale;
        ctx.setLineDash([4*scale, 4*scale]); ctx.stroke(); ctx.setLineDash([]);
      });

      // ── 12. Crosshair at center ───────────────────────────────
      const ch = 18 * scale;
      ctx.strokeStyle = "rgba(0,220,255,0.5)"; ctx.lineWidth = scale;
      ctx.beginPath();
      ctx.moveTo(cx - ch, cy); ctx.lineTo(cx + ch, cy);
      ctx.moveTo(cx, cy - ch); ctx.lineTo(cx, cy + ch);
      ctx.stroke();
      ctx.strokeStyle = "rgba(0,220,255,0.22)";
      ctx.beginPath();
      ctx.moveTo(cx-10*scale, cy-10*scale); ctx.lineTo(cx+10*scale, cy+10*scale);
      ctx.moveTo(cx+10*scale, cy-10*scale); ctx.lineTo(cx-10*scale, cy+10*scale);
      ctx.stroke();

      // ── 13. Scan line overlay ─────────────────────────────────
      for (let y = 0; y < H; y += 4) {
        ctx.fillStyle = "rgba(0,0,0,0.025)";
        ctx.fillRect(0, y, W, 1);
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
