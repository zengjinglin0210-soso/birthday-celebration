import { useRef, useEffect, useCallback } from "react";

interface CakeParticleData {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  color: string;
  coreRadius: number;
  glowRadius: number;
  type: "cake" | "flame" | "sparkle" | "decor" | "smoke";
  brightness: number;
  phase: number;
  candleIndex?: number; // which candle this flame belongs to (0-3)
}

interface InteractionPoint {
  x: number;
  y: number;
  active: boolean;
}

// Physics — unchanged
const SPRING_K = 0.03;
const DAMPING = 0.9;
const REPULSION_RADIUS = 45;
const REPULSION_FORCE = 2.5;

// Color palettes with depth
const CAKE_COLORS_LIGHT = ["#F8E090", "#FFDF85", "#F5D980", "#F0D060", "#FFE8A0"];
const CAKE_COLORS_MID = ["#EBC860", "#E8C547", "#DAB840", "#D4A83A", "#E0C050"];
const CAKE_COLORS_DARK = ["#CCA535", "#C9A030", "#B89028", "#A88020", "#C09830"];

const FLAME_COLORS_BRIGHT = ["#FFF8DC", "#FFEC8B", "#FFE4B5", "#FFD700"];
const FLAME_COLORS_DEEP = ["#FF8C00", "#FF6B00", "#E65100"];

interface CakeParticleProps {
  candlesLit: boolean;
  blowIntensity: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

// Candle geometry constants
const CANDLE_WIDTH = 7;
const CANDLE_HEIGHT = 50;
const CANDLE_OFFSETS = [-42, -14, 14, 42]; // x offsets from center

function generateCakeTargets(cw: number, ch: number) {
  const targets: { tx: number; ty: number; type: CakeParticleData["type"]; color?: string; sizeClass?: "large" | "medium" | "small"; candleIndex?: number }[] = [];
  const cx = cw / 2;

  const pickCakeColor = (row: number, totalRows: number) => {
    const t = row / totalRows;
    if (t < 0.33) return CAKE_COLORS_LIGHT[Math.floor(Math.random() * CAKE_COLORS_LIGHT.length)];
    if (t < 0.66) return CAKE_COLORS_MID[Math.floor(Math.random() * CAKE_COLORS_MID.length)];
    return CAKE_COLORS_DARK[Math.floor(Math.random() * CAKE_COLORS_DARK.length)];
  };

  const pickSize = (): "large" | "medium" | "small" => {
    const r = Math.random();
    return r < 0.2 ? "large" : r < 0.6 ? "medium" : "small";
  };

  // Bottom layer
  const bottomY = ch - 50;
  const bottomH = 70;
  const bottomW = 220;
  for (let i = 0; i < 160; i++) {
    const ty = bottomY - Math.random() * bottomH;
    targets.push({
      tx: cx + (Math.random() - 0.5) * bottomW, ty,
      type: "cake", color: pickCakeColor(bottomY - ty, bottomH), sizeClass: pickSize(),
    });
  }
  for (let i = 0; i < 24; i++) {
    targets.push({
      tx: cx - bottomW / 2 + (bottomW / 24) * (i + 0.5),
      ty: bottomY - bottomH + Math.sin(i * 0.5) * 4,
      type: "decor", color: "#FFF8EE", sizeClass: "small",
    });
  }

  // Middle layer
  const midY = bottomY - bottomH;
  const midH = 70;
  const midW = 180;
  for (let i = 0; i < 130; i++) {
    const ty = midY - Math.random() * midH;
    targets.push({
      tx: cx + (Math.random() - 0.5) * midW, ty,
      type: "cake", color: pickCakeColor(midY - ty, midH), sizeClass: pickSize(),
    });
  }
  for (let i = 0; i < 20; i++) {
    targets.push({
      tx: cx - midW / 2 + (midW / 20) * (i + 0.5),
      ty: midY - midH + Math.sin(i * 0.6) * 3,
      type: "decor", color: "#FFF8EE", sizeClass: "small",
    });
  }

  // Top layer
  const topY = midY - midH;
  const topH = 60;
  const topW = 135;
  for (let i = 0; i < 100; i++) {
    const ty = topY - Math.random() * topH;
    targets.push({
      tx: cx + (Math.random() - 0.5) * topW, ty,
      type: "cake", color: pickCakeColor(topY - ty, topH), sizeClass: pickSize(),
    });
  }
  for (let i = 0; i < 16; i++) {
    targets.push({
      tx: cx - topW / 2 + (topW / 16) * (i + 0.5),
      ty: topY - topH + Math.sin(i * 0.7) * 3,
      type: "decor", color: "#FFF8EE", sizeClass: "small",
    });
  }

  // Flame particles — NO candle body particles
  const candleTops: number[] = [];
  for (let ci = 0; ci < CANDLE_OFFSETS.length; ci++) {
    const candleX = cx + CANDLE_OFFSETS[ci];
    const candleTop = topY - topH - CANDLE_HEIGHT;
    candleTops.push(candleTop);

    // Bright inner flame
    for (let i = 0; i < 10; i++) {
      targets.push({
        tx: candleX + (Math.random() - 0.5) * 6,
        ty: candleTop - Math.random() * 10,
        type: "flame", color: FLAME_COLORS_BRIGHT[Math.floor(Math.random() * FLAME_COLORS_BRIGHT.length)],
        sizeClass: Math.random() < 0.3 ? "large" : "medium",
        candleIndex: ci,
      });
    }
    // Deep outer flame
    for (let i = 0; i < 8; i++) {
      targets.push({
        tx: candleX + (Math.random() - 0.5) * 10,
        ty: candleTop - 8 - Math.random() * 8,
        type: "flame", color: FLAME_COLORS_DEEP[Math.floor(Math.random() * FLAME_COLORS_DEEP.length)],
        sizeClass: "small",
        candleIndex: ci,
      });
    }
    // Sparkles
    for (let i = 0; i < 6; i++) {
      targets.push({
        tx: candleX + (Math.random() - 0.5) * 14,
        ty: candleTop - 14 - Math.random() * 18,
        type: "sparkle", color: "#FFD700",
        sizeClass: Math.random() < 0.4 ? "medium" : "small",
        candleIndex: ci,
      });
    }
  }

  // Top cream swirls
  for (let i = 0; i < 24; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * 38 + 8;
    targets.push({
      tx: cx + Math.cos(a) * r,
      ty: topY - topH + Math.sin(a) * r * 0.3 - 5,
      type: "decor", color: "#FFF5EE", sizeClass: "small",
    });
  }

  // Ambient sparkles
  for (let i = 0; i < 30; i++) {
    targets.push({
      tx: Math.random() * cw, ty: Math.random() * ch,
      type: "sparkle", color: "#FFD700", sizeClass: Math.random() < 0.3 ? "medium" : "small",
    });
  }

  return { targets, candleTops };
}

// Particle sprite: solid core + thin glow rim
function createParticleSprite(
  coreR: number, glowR: number, r: number, g: number, b: number
): HTMLCanvasElement {
  const size = Math.ceil(glowR);
  const c = document.createElement("canvas");
  c.width = c.height = size * 2;
  const ctx = c.getContext("2d")!;

  const grad = ctx.createRadialGradient(size, size, coreR * 0.9, size, size, glowR);
  grad.addColorStop(0, `rgba(${r},${g},${b},0.45)`);
  grad.addColorStop(0.4, `rgba(${r},${g},${b},0.12)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size * 2, size * 2);

  const coreGrad = ctx.createRadialGradient(size, size, 0, size, size, coreR);
  coreGrad.addColorStop(0, `rgba(${Math.min(255, r + 40)},${Math.min(255, g + 30)},${Math.min(255, b + 20)},1)`);
  coreGrad.addColorStop(0.7, `rgba(${r},${g},${b},0.95)`);
  coreGrad.addColorStop(1, `rgba(${r},${g},${b},0.7)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(size, size, coreR, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

export default function CakeParticle({ candlesLit, blowIntensity, canvasRef }: CakeParticleProps) {
  const particlesRef = useRef<CakeParticleData[]>([]);
  const candleTopsRef = useRef<number[]>([]);
  const smokeParticlesRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }[]>([]);
  const spriteCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const animFrameRef = useRef<number>(0);
  const interactionRef = useRef<InteractionPoint>({ x: -1000, y: -1000, active: false });
  const timeRef = useRef<number>(0);
  const prevCandlesLitRef = useRef(candlesLit);

  const getSprite = useCallback((color: string, coreR: number, glowR: number): HTMLCanvasElement => {
    const key = `${color}_${coreR}_${glowR}`;
    if (spriteCacheRef.current.has(key)) return spriteCacheRef.current.get(key)!;
    const [r, g, b] = hexToRgb(color);
    const sprite = createParticleSprite(coreR, glowR, r, g, b);
    spriteCacheRef.current.set(key, sprite);
    return sprite;
  }, []);

  const initParticles = useCallback((cw: number, ch: number) => {
    const { targets, candleTops } = generateCakeTargets(cw, ch);
    candleTopsRef.current = candleTops;
    const particles: CakeParticleData[] = [];
    for (const t of targets) {
      const sc = t.sizeClass || "medium";
      let coreRadius: number;
      let glowRadius: number;

      switch (t.type) {
        case "flame":
          coreRadius = sc === "large" ? 4.5 : sc === "medium" ? 3.0 : 1.8;
          glowRadius = coreRadius * 2.5;
          break;
        case "sparkle":
          coreRadius = sc === "large" ? 3.0 : sc === "medium" ? 2.0 : 1.2;
          glowRadius = coreRadius * 3.0;
          break;
        case "cake":
          coreRadius = sc === "large" ? 4.0 : sc === "medium" ? 2.5 : 1.5;
          glowRadius = coreRadius * 1.8;
          break;
        case "decor":
          coreRadius = sc === "large" ? 2.5 : sc === "medium" ? 1.5 : 0.8;
          glowRadius = coreRadius * 2.0;
          break;
        default:
          coreRadius = 2.0;
          glowRadius = 3.5;
      }

      particles.push({
        x: cw / 2 + (Math.random() - 0.5) * cw * 0.8,
        y: ch / 2 + (Math.random() - 0.5) * ch * 0.8,
        tx: t.tx, ty: t.ty,
        vx: 0, vy: 0,
        color: t.color || CAKE_COLORS_MID[Math.floor(Math.random() * CAKE_COLORS_MID.length)],
        coreRadius, glowRadius,
        type: t.type,
        brightness: 0.7 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
        candleIndex: t.candleIndex,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      if (particlesRef.current.length === 0) initParticles(rect.width, rect.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      timeRef.current += 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const cx = w / 2;
      const ip = interactionRef.current;
      const time = timeRef.current;

      // Calculate candle positions
      const bottomY = h - 50;
      const topY = bottomY - 70 - 70;
      const topH = 60;
      const cakeTopSurface = topY - topH;
      const candlePositions = CANDLE_OFFSETS.map(offset => ({
        x: cx + offset,
        baseY: cakeTopSurface,
        topY: cakeTopSurface - CANDLE_HEIGHT,
      }));

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Subtle ambient glow
      const ambGrad = ctx.createRadialGradient(w / 2, h * 0.62, 10, w / 2, h * 0.62, 200);
      ambGrad.addColorStop(0, "rgba(232, 197, 71, 0.1)");
      ambGrad.addColorStop(0.5, "rgba(232, 197, 71, 0.03)");
      ambGrad.addColorStop(1, "rgba(232, 197, 71, 0)");
      ctx.fillStyle = ambGrad;
      ctx.fillRect(0, 0, w, h);

      // Smoke spawning
      if (blowIntensity > 0.3 && candlesLit) {
        for (const cp of candlePositions) {
          if (Math.random() < blowIntensity * 0.6) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
            const speed = blowIntensity * (2 + Math.random() * 3);
            smokeParticlesRef.current.push({
              x: cp.x + (Math.random() - 0.5) * 6,
              y: cp.topY + Math.random() * 10,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: Math.random() * 35 + 15,
              maxLife: 50,
              size: Math.random() * 5 + 3,
            });
          }
        }
      }
      if (!candlesLit && prevCandlesLitRef.current) {
        for (const cp of candlePositions) {
          for (let j = 0; j < 8; j++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
            const speed = 1.5 + Math.random() * 3;
            smokeParticlesRef.current.push({
              x: cp.x + (Math.random() - 0.5) * 8,
              y: cp.topY + Math.random() * 10,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: Math.random() * 40 + 20,
              maxLife: 60,
              size: Math.random() * 6 + 3,
            });
          }
        }
      }
      prevCandlesLitRef.current = candlesLit;

      // === Draw solid candles (before particles so flame particles render on top) ===
      for (let i = 0; i < candlePositions.length; i++) {
        const cp = candlePositions[i];
        const candleX = cp.x;
        const candleBaseY = cp.baseY;
        const candleTopY = cp.topY;

        // Candle body — gradient from light to dark
        const bodyGrad = ctx.createLinearGradient(candleX - CANDLE_WIDTH / 2, 0, candleX + CANDLE_WIDTH / 2, 0);
        if (i % 2 === 0) {
          bodyGrad.addColorStop(0, "#FFB6C1");
          bodyGrad.addColorStop(0.3, "#FFD0D8");
          bodyGrad.addColorStop(0.7, "#FFB6C1");
          bodyGrad.addColorStop(1, "#E8A0AB");
        } else {
          bodyGrad.addColorStop(0, "#FFF8DC");
          bodyGrad.addColorStop(0.3, "#FFFCE8");
          bodyGrad.addColorStop(0.7, "#FFF8DC");
          bodyGrad.addColorStop(1, "#E8DDB0");
        }
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.roundRect(candleX - CANDLE_WIDTH / 2, candleTopY, CANDLE_WIDTH, CANDLE_HEIGHT, [2, 2, 1, 1]);
        ctx.fill();

        // Candle stripe decoration
        ctx.fillStyle = i % 2 === 0 ? "#FF69B4" : "#FFE4B5";
        ctx.fillRect(candleX - 1.5, candleTopY, 3, CANDLE_HEIGHT);

        // Wick
        ctx.strokeStyle = "#444";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(candleX, candleTopY);
        ctx.lineTo(candleX, candleTopY - 6);
        ctx.stroke();
      }

      // === RENDER PARTICLES (cake body, flames, sparkles, decor) ===
      // Sub-layer 1: Glow halos (screen blend)
      ctx.globalCompositeOperation = "screen";
      for (const p of particlesRef.current) {
        // Physics — only non-flame particles repel from cursor
        const springFx = (p.tx - p.x) * SPRING_K;
        const springFy = (p.ty - p.y) * SPRING_K;
        let repFx = 0, repFy = 0;

        // Cake/decor particles repel from cursor; flame/sparkle don't
        if (ip.active && (p.type === "cake" || p.type === "decor")) {
          const dx = p.x - ip.x;
          const dy = p.y - ip.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < REPULSION_RADIUS && dist > 0.1) {
            const t = 1 - dist / REPULSION_RADIUS;
            const force = t * t * REPULSION_FORCE;
            repFx = (dx / dist) * force;
            repFy = (dy / dist) * force;
          }
        }
        p.vx = (p.vx + springFx + repFx) * DAMPING;
        p.vy = (p.vy + springFy + repFy) * DAMPING;

        // Flame particles: lean toward/away from cursor + flicker
        if (p.type === "flame" && p.candleIndex !== undefined) {
          const cp = candlePositions[p.candleIndex];
          const dx = ip.x - cp.x;
          const dy = ip.y - cp.topY;
          const distToCandle = Math.sqrt(dx * dx + dy * dy);

          // Cursor proximity flickering effect
          if (distToCandle < 100 && ip.active) {
            const flickerStrength = Math.max(0, 1 - distToCandle / 100);
            // Lean flame away from cursor
            const leanForce = flickerStrength * 0.5;
            p.vx += (cp.x - ip.x) / Math.max(distToCandle, 1) * leanForce;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Calculate alpha
        let alpha = p.brightness;
        if (p.type === "flame" || p.type === "sparkle") {
          const ci = p.candleIndex ?? 0;
          const perCandleIntensity = candlesLit
            ? Math.max(0, 1 - blowIntensity * (1 + Math.min(3, ci) * 0.1))
            : 0;

          // Cursor proximity flickering — randomly dim the flame
          if (ip.active && p.candleIndex !== undefined) {
            const cp = candlePositions[p.candleIndex];
            const dx = ip.x - cp.x;
            const dy = ip.y - cp.topY;
            const distToCandle = Math.sqrt(dx * dx + dy * dy);
            if (distToCandle < 80) {
              const flickerStrength = Math.max(0, 1 - distToCandle / 80);
              // Random flickering: sometimes dim, sometimes bright
              const flicker = Math.sin(time * 0.3 + ci * 7 + p.phase * 3) * flickerStrength;
              const dimAmount = flickerStrength * 0.6 * Math.max(0, flicker);
              alpha *= perCandleIntensity * (1 - dimAmount);
            } else {
              alpha *= perCandleIntensity;
            }
          } else {
            alpha *= perCandleIntensity;
          }

          if (p.type === "sparkle") {
            alpha *= 0.4 + 0.6 * Math.abs(Math.sin(time * 0.04 + p.phase));
          } else {
            alpha *= 0.7 + 0.3 * Math.sin(time * 0.08 + p.phase);
          }
        }
        if (alpha < 0.01) continue;

        ctx.globalAlpha = alpha;
        const sprite = getSprite(p.color, Math.round(p.coreRadius * 10) / 10, Math.round(p.glowRadius * 10) / 10);
        ctx.drawImage(sprite, p.x - p.glowRadius, p.y - p.glowRadius);
      }

      // Sub-layer 2: Solid cores (normal blend)
      ctx.globalCompositeOperation = "source-over";
      for (const p of particlesRef.current) {
        let alpha = p.brightness;
        if (p.type === "flame" || p.type === "sparkle") {
          const ci = p.candleIndex ?? 0;
          const perCandleIntensity = candlesLit
            ? Math.max(0, 1 - blowIntensity * (1 + Math.min(3, ci) * 0.1))
            : 0;

          if (ip.active && p.candleIndex !== undefined) {
            const cp = candlePositions[p.candleIndex];
            const dx = ip.x - cp.x;
            const dy = ip.y - cp.topY;
            const distToCandle = Math.sqrt(dx * dx + dy * dy);
            if (distToCandle < 80) {
              const flickerStrength = Math.max(0, 1 - distToCandle / 80);
              const flicker = Math.sin(time * 0.3 + ci * 7 + p.phase * 3) * flickerStrength;
              const dimAmount = flickerStrength * 0.6 * Math.max(0, flicker);
              alpha *= perCandleIntensity * (1 - dimAmount);
            } else {
              alpha *= perCandleIntensity;
            }
          } else {
            alpha *= perCandleIntensity;
          }

          if (p.type === "sparkle") {
            alpha *= 0.4 + 0.6 * Math.abs(Math.sin(time * 0.04 + p.phase));
          }
        }
        if (alpha < 0.01) continue;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.coreRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // === Draw solid flame shapes on top of flame particles for a richer look ===
      if (candlesLit) {
        for (let i = 0; i < candlePositions.length; i++) {
          const cp = candlePositions[i];
          const intensity = Math.max(0, 1 - blowIntensity * (1 + i * 0.1));

          // Cursor proximity dimming for solid flame
          let cursorDim = 0;
          if (ip.active) {
            const dx = ip.x - cp.x;
            const dy = ip.y - cp.topY;
            const distToCandle = Math.sqrt(dx * dx + dy * dy);
            if (distToCandle < 80) {
              const flickerStrength = Math.max(0, 1 - distToCandle / 80);
              const flicker = Math.sin(time * 0.3 + i * 7) * flickerStrength;
              cursorDim = flickerStrength * 0.6 * Math.max(0, flicker);
            }
          }

          const flameAlpha = intensity * (1 - cursorDim);
          if (flameAlpha < 0.05) continue;

          const flicker = Math.sin(time * 0.15 + i * 1.5) * 2;
          // Lean direction based on cursor
          let leanX = 0;
          if (ip.active) {
            const dx = cp.x - ip.x;
            const distToCursor = Math.abs(ip.x - cp.x);
            if (distToCursor < 100) {
              leanX = (dx / Math.max(distToCursor, 1)) * 4 * Math.max(0, 1 - distToCursor / 100);
            }
          }

          const flameBaseY = cp.topY - 6;
          ctx.globalAlpha = flameAlpha;

          // Outer glow
          const gradient = ctx.createRadialGradient(
            cp.x + flicker + leanX, flameBaseY - 8, 2,
            cp.x + flicker + leanX, flameBaseY - 8, 22 * flameAlpha
          );
          gradient.addColorStop(0, `rgba(255, 165, 0, ${0.6 * flameAlpha})`);
          gradient.addColorStop(0.4, `rgba(255, 100, 0, ${0.3 * flameAlpha})`);
          gradient.addColorStop(1, "rgba(255, 50, 0, 0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(cp.x + flicker + leanX, flameBaseY - 8, 22 * flameAlpha, 0, Math.PI * 2);
          ctx.fill();

          // Inner flame
          ctx.globalAlpha = flameAlpha;
          ctx.fillStyle = `rgba(255, 200, 0, ${flameAlpha})`;
          ctx.beginPath();
          ctx.moveTo(cp.x + flicker + leanX, flameBaseY - 20 * flameAlpha);
          ctx.quadraticCurveTo(
            cp.x + flicker + leanX + 6 * flameAlpha, flameBaseY - 8,
            cp.x + flicker + leanX, flameBaseY
          );
          ctx.quadraticCurveTo(
            cp.x + flicker + leanX - 6 * flameAlpha, flameBaseY - 8,
            cp.x + flicker + leanX, flameBaseY - 20 * flameAlpha
          );
          ctx.fill();

          // Core flame (white-hot center)
          ctx.fillStyle = `rgba(255, 255, 200, ${flameAlpha})`;
          ctx.beginPath();
          ctx.moveTo(cp.x + flicker + leanX, flameBaseY - 14 * flameAlpha);
          ctx.quadraticCurveTo(
            cp.x + flicker + leanX + 3 * flameAlpha, flameBaseY - 6,
            cp.x + flicker + leanX, flameBaseY
          );
          ctx.quadraticCurveTo(
            cp.x + flicker + leanX - 3 * flameAlpha, flameBaseY - 6,
            cp.x + flicker + leanX, flameBaseY - 14 * flameAlpha
          );
          ctx.fill();
        }
      }

      // --- Smoke particles ---
      ctx.globalCompositeOperation = "source-over";
      smokeParticlesRef.current = smokeParticlesRef.current.filter((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.vy -= 0.02;
        s.vx *= 0.98;
        s.life -= 1;
        if (s.life <= 0) return false;
        const a = (s.life / s.maxLife) * 0.35;
        ctx.globalAlpha = a;
        ctx.fillStyle = "#B8B8B8";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (1 - s.life / s.maxLife * 0.5), 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
      if (smokeParticlesRef.current.length > 80) {
        smokeParticlesRef.current = smokeParticlesRef.current.slice(-80);
      }

      // Cursor hint
      if (ip.active) {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 0.12;
        const cursorGrad = ctx.createRadialGradient(ip.x, ip.y, 0, ip.x, ip.y, REPULSION_RADIUS);
        cursorGrad.addColorStop(0, "rgba(232, 197, 71, 0.3)");
        cursorGrad.addColorStop(1, "rgba(232, 197, 71, 0)");
        ctx.fillStyle = cursorGrad;
        ctx.beginPath();
        ctx.arc(ip.x, ip.y, REPULSION_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [candlesLit, blowIntensity, canvasRef, initParticles, getSprite]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    interactionRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
  }, [canvasRef]);

  const handlePointerLeave = useCallback(() => {
    interactionRef.current = { x: -1000, y: -1000, active: false };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    interactionRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
  }, [canvasRef]);

  const handlePointerUp = useCallback(() => {
    interactionRef.current = { x: -1000, y: -1000, active: false };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-crosshair"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ touchAction: "none" }}
    />
  );
}
