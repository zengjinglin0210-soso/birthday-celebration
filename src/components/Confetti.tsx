import { useEffect, useRef, useCallback } from "react";

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: "rect" | "circle";
}

interface ConfettiProps {
  active: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const CONFETTI_COLORS = [
  "#FFD700", "#FF6B6B", "#4ECDC4", "#FF8E53", "#A78BFA",
  "#FF69B4", "#F7DC6F", "#82E0AA", "#F0B27A", "#85C1E9",
  "#FF1493", "#00CED1", "#FFD700", "#FF6347",
];

export default function Confetti({ active, canvasRef }: ConfettiProps) {
  const particlesRef = useRef<ConfettiPiece[]>([]);
  const animFrameRef = useRef<number>(0);

  const spawnConfetti = useCallback((w: number, _h: number) => {
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < 15; i++) {
      pieces.push({
        x: Math.random() * w,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        size: Math.random() * 10 + 6,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        shape: Math.random() > 0.5 ? "rect" : "circle",
      });
    }
    return pieces;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    if (active) {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      particlesRef.current.push(...spawnConfetti(w, h));
    }

    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.vx *= 0.999;
        p.rotation += p.rotationSpeed;

        if (p.y > h + 50) return false;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, (h - p.y + 50) / 200);

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
        return true;
      });

      if (active && Math.random() < 0.3) {
        const w2 = canvas.offsetWidth;
        particlesRef.current.push(...spawnConfetti(w2, 0));
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [active, canvasRef, spawnConfetti]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-50"
    />
  );
}
