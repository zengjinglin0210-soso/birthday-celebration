import { useRef, useEffect } from "react";

// ─── Taurus Constellation Data ───
// Approximate normalized positions (0-1) based on celestial coordinates
// Right Ascension mapped to X, Declination mapped to Y

interface ConstellationStar {
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  mag: number; // visual magnitude (smaller = brighter)
  name?: string;
}

// Main Taurus stars — spread 2.5x for visibility around centered content
// Original offsets from center (0.44, 0.42) multiplied by 2.5
const TAURUS_STARS: ConstellationStar[] = [
  // Hyades cluster (V-shape head)
  { x: 0.54, y: 0.42, mag: 0.85, name: "α Aldebaran" },   // Aldebaran - the eye, brightest
  { x: 0.44, y: 0.32, mag: 2.1, name: "γ" },               // Gamma Tauri
  { x: 0.34, y: 0.47, mag: 2.0, name: "δ₁" },              // Delta1 Tauri
  { x: 0.39, y: 0.57, mag: 1.9, name: "ε" },               // Epsilon Tauri
  { x: 0.64, y: 0.52, mag: 2.0, name: "θ₂" },              // Theta2 Tauri
  // Horn tips
  { x: 0.09, y: 0.07, mag: 1.65, name: "β Elnath" },       // Elnath - horn tip
  { x: 0.74, y: 0.12, mag: 2.2, name: "ζ" },               // Zeta Tauri - other horn
  // Body extension
  { x: 0.24, y: 0.245, mag: 2.5, name: "λ" },              // Lambda Tauri
  { x: 0.49, y: 0.27, mag: 2.8 },
  { x: 0.59, y: 0.345, mag: 2.7 },
  // Pleiades cluster (upper shoulder area)
  { x: 0.19, y: 0.67, mag: 1.6, name: "η Alcyone" },       // Alcyone - Pleiades center
  { x: 0.14, y: 0.62, mag: 2.9 },                           // Pleiades star
  { x: 0.24, y: 0.72, mag: 2.8 },                           // Pleiades star
  { x: 0.165, y: 0.745, mag: 3.0 },                         // Pleiades star
  { x: 0.09, y: 0.695, mag: 3.2 },                          // Pleiades star
  { x: 0.265, y: 0.62, mag: 3.1 },                          // Pleiades star
  // Extra body stars
  { x: 0.69, y: 0.67, mag: 2.6 },
  { x: 0.79, y: 0.57, mag: 2.9 },
  { x: 0.29, y: 0.87, mag: 3.0 },
];

// Constellation lines connecting stars (by index)
const TAURUS_LINES: [number, number][] = [
  // V-shape (Hyades)
  [1, 0], [0, 4], [4, 3], [3, 2], [2, 1],
  // Left horn
  [1, 7], [7, 5],
  // Right horn
  [4, 8], [8, 6],
  // Body to Pleiades
  [2, 9],
  // Pleiades connections
  [9, 10], [10, 13], [9, 12], [12, 11], [11, 10],
  // Lower body
  [3, 16], [16, 18],
  [4, 15], [15, 17],
];

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  maxLife: number;
  brightness: number;
  width: number;
}

interface BackgroundStar {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  phase: number;
  speed: number;
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<BackgroundStar[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const nextMeteorRef = useRef<number>(120 + Math.random() * 300); // frames until next meteor

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Generate background stars
    const generateStars = (w: number, h: number) => {
      const count = Math.floor((w * h) / 2800); // density based on screen size
      const stars: BackgroundStar[] = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() < 0.05 ? 1.5 + Math.random() : 0.5 + Math.random() * 0.8,
          baseAlpha: 0.15 + Math.random() * 0.55,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.7,
        });
      }
      return stars;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      starsRef.current = generateStars(rect.width, rect.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // Spawn a single meteor
    const spawnMeteor = (w: number, h: number) => {
      // Random direction - mostly upper-left to lower-right
      const angle = (Math.PI / 6) + Math.random() * (Math.PI / 4); // 30-75 degrees
      const speed = 6 + Math.random() * 10;
      const isShower = Math.random() < 0.3; // 30% chance of shower (multiple)

      const count = isShower ? 3 + Math.floor(Math.random() * 5) : 1;
      for (let i = 0; i < count; i++) {
        meteorsRef.current.push({
          x: Math.random() * w * 0.8,
          y: Math.random() * h * 0.3,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          length: 40 + Math.random() * 80,
          life: 30 + Math.random() * 40,
          maxLife: 30 + Math.random() * 40,
          brightness: 0.6 + Math.random() * 0.4,
          width: 0.8 + Math.random() * 1.5,
        });
        // Slight offset for shower meteors
        if (isShower && i > 0) {
          meteorsRef.current[meteorsRef.current.length - 1].x -= i * (10 + Math.random() * 20);
          meteorsRef.current[meteorsRef.current.length - 1].y -= i * (5 + Math.random() * 10);
        }
      }
    };

    const animate = () => {
      timeRef.current += 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const time = timeRef.current;

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // ─── Background Stars ───
      for (const star of starsRef.current) {
        const twinkle = star.baseAlpha * (0.6 + 0.4 * Math.sin(time * 0.02 * star.speed + star.phase));
        if (twinkle < 0.05) continue;
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = "#E8DFC8";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ─── Taurus Constellation ───
      // Position constellation so horns & Pleiades extend beyond centered content
      const cx = w * 0.5;
      const cy = h * 0.3;
      const scale = Math.max(w, h) * 0.45;

      // Map star position to screen
      const starPos = (s: ConstellationStar) => ({
        sx: cx + (s.x - 0.44) * scale,
        sy: cy + (s.y - 0.42) * scale,
      });

      // Draw constellation lines
      ctx.globalCompositeOperation = "screen";
      for (const [a, b] of TAURUS_LINES) {
        if (a >= TAURUS_STARS.length || b >= TAURUS_STARS.length) continue;
        const pa = starPos(TAURUS_STARS[a]);
        const pb = starPos(TAURUS_STARS[b]);

        // Breathing opacity for lines
        const lineAlpha = 0.12 + 0.06 * Math.sin(time * 0.015);
        ctx.globalAlpha = lineAlpha;
        ctx.strokeStyle = "#C9A030";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(pa.sx, pa.sy);
        ctx.lineTo(pb.sx, pb.sy);
        ctx.stroke();
      }

      // Draw constellation stars
      ctx.globalCompositeOperation = "screen";
      for (const star of TAURUS_STARS) {
        const pos = starPos(star);
        // Brightness based on magnitude (invert: lower mag = brighter)
        const brightness = Math.max(0.15, 1 - star.mag * 0.25);
        const twinkle = brightness * (0.7 + 0.3 * Math.sin(time * 0.03 + star.x * 20 + star.y * 15));

        // Glow halo
        const glowSize = star.mag < 1 ? 8 : star.mag < 2 ? 5 : 3;
        const grad = ctx.createRadialGradient(pos.sx, pos.sy, 0, pos.sx, pos.sy, glowSize);
        grad.addColorStop(0, `rgba(232, 197, 71, ${twinkle * 0.6})`);
        grad.addColorStop(0.4, `rgba(232, 197, 71, ${twinkle * 0.2})`);
        grad.addColorStop(1, "rgba(232, 197, 71, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pos.sx, pos.sy, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Star core
        const coreSize = star.mag < 1 ? 2 : star.mag < 2 ? 1.5 : 1;
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = star.mag < 1.5 ? "#FFF5D0" : "#E8DFC8";
        ctx.beginPath();
        ctx.arc(pos.sx, pos.sy, coreSize, 0, Math.PI * 2);
        ctx.fill();

        // Cross sparkle for bright stars
        if (star.mag < 1.8) {
          const sparkleLen = star.mag < 1 ? 12 : 6;
          const sparkleAlpha = twinkle * 0.25 * (0.5 + 0.5 * Math.sin(time * 0.05 + star.x * 10));
          ctx.globalAlpha = sparkleAlpha;
          ctx.strokeStyle = "#FFF5D0";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(pos.sx - sparkleLen, pos.sy);
          ctx.lineTo(pos.sx + sparkleLen, pos.sy);
          ctx.moveTo(pos.sx, pos.sy - sparkleLen);
          ctx.lineTo(pos.sx, pos.sy + sparkleLen);
          ctx.stroke();
        }
      }

      // ─── "Taurus" label ───
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.18 + 0.07 * Math.sin(time * 0.01);
      ctx.fillStyle = "#C9A030";
      ctx.font = "italic 13px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("Taurus ♉", cx, cy + scale * 0.28);

      // ─── Meteors ───
      ctx.globalCompositeOperation = "screen";

      // Meteor spawning logic
      nextMeteorRef.current -= 1;
      if (nextMeteorRef.current <= 0) {
        spawnMeteor(w, h);
        // Next meteor in 3-12 seconds (at 60fps)
        nextMeteorRef.current = 180 + Math.floor(Math.random() * 540);
      }

      meteorsRef.current = meteorsRef.current.filter((m) => {
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 1;
        if (m.life <= 0) return false;

        const progress = m.life / m.maxLife;
        const alpha = m.brightness * progress;
        if (alpha < 0.01) return true; // skip drawing but keep alive

        // Meteor tail direction (opposite of velocity)
        const speed = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
        const nx = -m.vx / speed;
        const ny = -m.vy / speed;
        const tailLen = m.length * progress;

        // Tail gradient
        const tailX = m.x + nx * tailLen;
        const tailY = m.y + ny * tailLen;
        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 248, 220, ${alpha})`);
        grad.addColorStop(0.15, `rgba(232, 197, 71, ${alpha * 0.7})`);
        grad.addColorStop(0.6, `rgba(232, 197, 71, ${alpha * 0.15})`);
        grad.addColorStop(1, "rgba(232, 197, 71, 0)");

        ctx.globalAlpha = 1;
        ctx.strokeStyle = grad;
        ctx.lineWidth = m.width * progress;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Head glow
        ctx.globalAlpha = alpha * 0.8;
        const headGrad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 4);
        headGrad.addColorStop(0, `rgba(255, 255, 230, ${alpha})`);
        headGrad.addColorStop(1, "rgba(255, 248, 220, 0)");
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 4, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
