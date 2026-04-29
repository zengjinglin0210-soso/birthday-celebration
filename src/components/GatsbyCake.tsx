import { useRef, useEffect, useCallback, useState } from "react";

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
  type: "cake" | "candle" | "flame" | "gift" | "decor" | "sparkle";
  brightness: number;
  phase: number;
}

interface InteractionPoint {
  x: number;
  y: number;
  active: boolean;
}

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
const FLAME_COLORS_MID = ["#FFA500", "#FFB347", "#FFD700"];

const GIFT_COLORS = ["#E8B870", "#D4A860", "#F0C878", "#C8A058", "#DEB468"];
const GIFT_COLORS_LIGHT = ["#F0D898", "#E8C888", "#F8E0A8"];
const GIFT_COLORS_DARK = ["#C89848", "#B88838", "#D0A050"];

function generateCakeTargets(cw: number, ch: number) {
  const targets: { tx: number; ty: number; type: CakeParticleData["type"]; color?: string; sizeClass?: "large" | "medium" | "small" }[] = [];
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
  const bottomY = ch - 45;
  const bottomH = 65;
  const bottomW = 200;
  for (let i = 0; i < 140; i++) {
    const ty = bottomY - Math.random() * bottomH;
    targets.push({
      tx: cx + (Math.random() - 0.5) * bottomW, ty,
      type: "cake", color: pickCakeColor(bottomY - ty, bottomH), sizeClass: pickSize(),
    });
  }
  for (let i = 0; i < 22; i++) {
    targets.push({
      tx: cx - bottomW / 2 + (bottomW / 22) * (i + 0.5),
      ty: bottomY - bottomH + Math.sin(i * 0.5) * 4,
      type: "decor", color: "#FFF8EE", sizeClass: "small",
    });
  }

  // Middle layer
  const midY = bottomY - bottomH;
  const midH = 65;
  const midW = 165;
  for (let i = 0; i < 110; i++) {
    const ty = midY - Math.random() * midH;
    targets.push({
      tx: cx + (Math.random() - 0.5) * midW, ty,
      type: "cake", color: pickCakeColor(midY - ty, midH), sizeClass: pickSize(),
    });
  }
  for (let i = 0; i < 18; i++) {
    targets.push({
      tx: cx - midW / 2 + (midW / 18) * (i + 0.5),
      ty: midY - midH + Math.sin(i * 0.6) * 3,
      type: "decor", color: "#FFF8EE", sizeClass: "small",
    });
  }

  // Top layer
  const topY = midY - midH;
  const topH = 55;
  const topW = 120;
  for (let i = 0; i < 85; i++) {
    const ty = topY - Math.random() * topH;
    targets.push({
      tx: cx + (Math.random() - 0.5) * topW, ty,
      type: "cake", color: pickCakeColor(topY - ty, topH), sizeClass: pickSize(),
    });
  }
  for (let i = 0; i < 15; i++) {
    targets.push({
      tx: cx - topW / 2 + (topW / 15) * (i + 0.5),
      ty: topY - topH + Math.sin(i * 0.7) * 3,
      type: "decor", color: "#FFF8EE", sizeClass: "small",
    });
  }

  // Gift boxes
  const giftPositions = [
    { x: cx - 48, y: midY - 18 }, { x: cx + 42, y: midY - 12 },
    { x: cx - 50, y: bottomY - 22 }, { x: cx + 48, y: bottomY - 18 },
    { x: cx + 18, y: topY - 8 },
  ];
  for (const gp of giftPositions) {
    const gSize = 18;
    for (let dy = gSize; dy >= 0; dy -= 4) {
      for (let dx = -gSize / 2; dx <= gSize / 2; dx += 4) {
        if (Math.random() < 0.5) {
          const gColor = Math.random() < 0.5
            ? GIFT_COLORS[Math.floor(Math.random() * GIFT_COLORS.length)]
            : Math.random() < 0.5
              ? GIFT_COLORS_LIGHT[Math.floor(Math.random() * GIFT_COLORS_LIGHT.length)]
              : GIFT_COLORS_DARK[Math.floor(Math.random() * GIFT_COLORS_DARK.length)];
          targets.push({ tx: gp.x + dx, ty: gp.y - dy, type: "gift", color: gColor, sizeClass: pickSize() });
        }
      }
    }
    for (let dy = gSize; dy >= 0; dy -= 3) {
      targets.push({ tx: gp.x, ty: gp.y - dy, type: "gift", color: "#FFD700", sizeClass: "small" });
    }
    for (let dx = -gSize / 2 + 4; dx <= gSize / 2 - 4; dx += 3) {
      targets.push({ tx: gp.x + dx, ty: gp.y - gSize / 2, type: "gift", color: "#FFD700", sizeClass: "small" });
    }
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 6 + 2;
      targets.push({ tx: gp.x + Math.cos(a) * r, ty: gp.y - gSize - 1 + Math.sin(a) * r, type: "gift", color: "#FFD700", sizeClass: "medium" });
    }
  }

  // Candles
  const candleXs = [cx - 40, cx - 13, cx + 13, cx + 40];
  for (const candleX of candleXs) {
    const candleTop = topY - topH - 50;
    for (let dy = 0; dy < 45; dy += 3) {
      for (let dx = -2; dx <= 2; dx += 3) {
        if (Math.random() < 0.5) {
          targets.push({
            tx: candleX + dx, ty: candleTop + dy,
            type: "candle", color: Math.random() > 0.5 ? "#FFE4E1" : "#FFF8DC",
            sizeClass: "small",
          });
        }
      }
    }
    // Flame — bright inner
    for (let i = 0; i < 10; i++) {
      targets.push({
        tx: candleX + (Math.random() - 0.5) * 6,
        ty: candleTop - Math.random() * 10,
        type: "flame", color: FLAME_COLORS_BRIGHT[Math.floor(Math.random() * FLAME_COLORS_BRIGHT.length)],
        sizeClass: Math.random() < 0.3 ? "large" : "medium",
      });
    }
    // Flame — deep outer
    for (let i = 0; i < 8; i++) {
      targets.push({
        tx: candleX + (Math.random() - 0.5) * 10,
        ty: candleTop - 8 - Math.random() * 8,
        type: "flame", color: FLAME_COLORS_DEEP[Math.floor(Math.random() * FLAME_COLORS_DEEP.length)],
        sizeClass: "small",
      });
    }
    for (let i = 0; i < 5; i++) {
      targets.push({
        tx: candleX + (Math.random() - 0.5) * 12,
        ty: candleTop - 12 - Math.random() * 16,
        type: "sparkle", color: "#FFD700", sizeClass: Math.random() < 0.4 ? "medium" : "small",
      });
    }
  }

  // Top cream swirls
  for (let i = 0; i < 20; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * 35 + 8;
    targets.push({
      tx: cx + Math.cos(a) * r,
      ty: topY - topH + Math.sin(a) * r * 0.3 - 4,
      type: "decor", color: "#FFF5EE", sizeClass: "small",
    });
  }

  // Ambient sparkles
  for (let i = 0; i < 25; i++) {
    targets.push({
      tx: Math.random() * cw, ty: Math.random() * ch,
      type: "sparkle", color: "#FFD700", sizeClass: Math.random() < 0.3 ? "medium" : "small",
    });
  }

  return targets;
}

// New sprite: solid core + thin glow rim
function createParticleSprite(
  coreR: number, glowR: number, r: number, g: number, b: number
): HTMLCanvasElement {
  const size = Math.ceil(glowR);
  const c = document.createElement("canvas");
  c.width = c.height = size * 2;
  const ctx = c.getContext("2d")!;

  // Thin glow halo
  const grad = ctx.createRadialGradient(size, size, coreR * 0.9, size, size, glowR);
  grad.addColorStop(0, `rgba(${r},${g},${b},0.45)`);
  grad.addColorStop(0.4, `rgba(${r},${g},${b},0.12)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size * 2, size * 2);

  // Solid bright core
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

export default function GatsbyCake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<CakeParticleData[]>([]);
  const spriteCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const animFrameRef = useRef<number>(0);
  const interactionRef = useRef<InteractionPoint>({ x: -1000, y: -1000, active: false });
  const timeRef = useRef<number>(0);
  const [, setCanvasSize] = useState({ w: 600, h: 500 });

  const getSprite = useCallback((color: string, coreR: number, glowR: number): HTMLCanvasElement => {
    const key = `${color}_${coreR}_${glowR}`;
    if (spriteCacheRef.current.has(key)) return spriteCacheRef.current.get(key)!;
    const [r, g, b] = hexToRgb(color);
    const sprite = createParticleSprite(coreR, glowR, r, g, b);
    spriteCacheRef.current.set(key, sprite);
    return sprite;
  }, []);

  const initParticles = useCallback((cw: number, ch: number) => {
    const targets = generateCakeTargets(cw, ch);
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
        case "candle":
          coreRadius = sc === "large" ? 2.5 : sc === "medium" ? 1.5 : 1.0;
          glowRadius = coreRadius * 1.6;
          break;
        case "gift":
          coreRadius = sc === "large" ? 3.5 : sc === "medium" ? 2.0 : 1.2;
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
      setCanvasSize({ w: rect.width, h: rect.height });
      if (particlesRef.current.length === 0) initParticles(rect.width, rect.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      timeRef.current += 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

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

      const ip = interactionRef.current;

      // Sub-layer 1: Glow halos via sprites (screen blend for atmosphere without washout)
      ctx.globalCompositeOperation = "screen";
      for (const p of particlesRef.current) {
        // Physics
        const springFx = (p.tx - p.x) * SPRING_K;
        const springFy = (p.ty - p.y) * SPRING_K;
        let repFx = 0, repFy = 0;
        if (ip.active) {
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
        p.x += p.vx;
        p.y += p.vy;

        // Calculate alpha
        let alpha = p.brightness;
        if (p.type === "sparkle") {
          alpha *= 0.4 + 0.6 * Math.abs(Math.sin(timeRef.current * 0.04 + p.phase));
        } else if (p.type === "flame") {
          alpha *= 0.7 + 0.3 * Math.sin(timeRef.current * 0.08 + p.phase);
        }

        ctx.globalAlpha = alpha;
        const sprite = getSprite(p.color, Math.round(p.coreRadius * 10) / 10, Math.round(p.glowRadius * 10) / 10);
        ctx.drawImage(sprite, p.x - p.glowRadius, p.y - p.glowRadius);
      }

      // Sub-layer 2: Solid cores with normal blend for crisp definition
      ctx.globalCompositeOperation = "source-over";
      for (const p of particlesRef.current) {
        let alpha = p.brightness;
        if (p.type === "sparkle") {
          alpha *= 0.4 + 0.6 * Math.abs(Math.sin(timeRef.current * 0.04 + p.phase));
        }
        if (alpha < 0.01) continue;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.coreRadius, 0, Math.PI * 2);
        ctx.fill();
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
  }, [initParticles, getSprite]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    interactionRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
  }, []);

  const handlePointerLeave = useCallback(() => {
    interactionRef.current = { x: -1000, y: -1000, active: false };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    interactionRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
  }, []);

  const handlePointerUp = useCallback(() => {
    interactionRef.current = { x: -1000, y: -1000, active: false };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ touchAction: "none" }}
    />
  );
}
