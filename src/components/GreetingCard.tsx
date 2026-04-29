import { useState, useCallback } from "react";
import { Button } from "./ui/button";
import GatsbyCake from "./GatsbyCake";

interface GreetingCardProps {
  onClose: () => void;
}

const BLESSING_MESSAGE = `叮叮叮！
零点准时报到，祝臭宝 29岁生日快乐～
是为你庆祝的第6个生日啦，作为你一路升级打怪的见证人，看到你越来越好，我比谁都为你骄傲。
新的一岁，希望你下意识笑的时候要比皱眉头的时候多，希望你允许自己间歇性喘口气，希望你白白胖胖健健康康。
最爱你的琳琳`;

export default function GreetingCard({ onClose }: GreetingCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const openCard = useCallback(() => setIsOpen(true), []);

  // Ambient sparkle spots
  const decoSpots = Array.from({ length: 16 }, (_, i) => ({
    x: 5 + Math.random() * 90,
    y: 5 + Math.random() * 90,
    delay: Math.random() * 3,
    size: Math.random() * 3 + 1,
  }));

  if (!isOpen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-40 p-4">
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
        {/* Gatsby Envelope */}
        <div
          className="relative z-10 w-72 h-48 sm:w-84 sm:h-56 cursor-pointer animate-bounce-in hover:scale-105 transition-transform duration-500 perspective-1000"
          onClick={openCard}
        >
          {/* Outer glow */}
          <div className="absolute -inset-2 rounded-xl opacity-50 blur-md"
            style={{ background: "linear-gradient(135deg, hsl(43,88%,58%/0.5), transparent 50%, hsl(43,88%,58%/0.2))" }}
          />
          <div className="relative w-full h-full rounded-xl overflow-hidden" style={{
            background: "linear-gradient(160deg, hsl(240,28%,6%), hsl(240,32%,4%))",
            boxShadow: "0 12px 60px rgba(0,0,0,0.7), 0 0 0 1px hsl(43,40%,20%)",
          }}>
            {/* Art deco lines */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="absolute left-4 right-4" style={{ top: `${20 + i * 12}%`, height: "1px", background: `hsl(43,88%,58%/${0.05 + i * 0.02})` }} />
            ))}
            {/* Envelope flap */}
            <div className="absolute inset-0" style={{
              clipPath: "polygon(0 0, 100% 0, 50% 58%)",
              background: "linear-gradient(160deg, hsl(46,92%,72%/0.2), hsl(43,88%,58%/0.1), transparent)",
            }} />
            {/* Wax seal */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "radial-gradient(circle at 40% 35%, hsl(43,88%,65%), hsl(41,70%,35%))",
                  boxShadow: "0 0 40px hsl(43,88%,58%/0.4), 0 4px 16px rgba(0,0,0,0.5)",
                }}
              >
                <span className="text-2xl font-bold" style={{ color: "hsl(240,35%,6%)", textShadow: "0 1px 2px rgba(255,255,255,0.2)" }}>G</span>
              </div>
            </div>
            {/* Hint text */}
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="text-[10px] tracking-[0.3em] uppercase font-handwriting" style={{ color: "hsl(var(--champagne-pale))", opacity: 0.5 }}>
                CLICK TO OPEN
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 p-2 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

      {/* Ambient sparkles */}
      {decoSpots.map((spot, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-sparkle pointer-events-none"
          style={{
            left: `${spot.x}%`, top: `${spot.y}%`,
            width: `${spot.size}px`, height: `${spot.size}px`,
            backgroundColor: "hsl(var(--champagne))",
            animationDelay: `${spot.delay}s`,
            boxShadow: `0 0 ${spot.size * 4}px hsl(var(--champagne)/0.5)`,
          }}
        />
      ))}

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg animate-card-open-gatsby" onClick={(e) => e.stopPropagation()} style={{ animationDelay: "0.3s" }}>
        {/* Gold glow border */}
        <div className="absolute -inset-1 rounded-2xl opacity-30 blur-lg pointer-events-none"
          style={{ background: "linear-gradient(135deg, hsl(var(--champagne)), transparent 40%, hsl(var(--champagne-light)), transparent 70%)" }}
        />

        <div className="relative card-gatsby rounded-xl overflow-hidden">
          {/* Top gold line */}
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg, hsl(41,70%,30%), hsl(43,88%,58%), hsl(46,92%,72%), hsl(43,88%,58%), hsl(41,70%,30%))" }} />

          {/* Interactive Particle Cake */}
          <div className="w-full h-[260px] sm:h-[300px] relative cursor-crosshair">
            <GatsbyCake />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at center, transparent 45%, hsl(240,35%,3%) 95%)" }}
            />
            {/* Touch/click hint */}
            <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
              <span className="text-[10px] tracking-wider opacity-30" style={{ color: "hsl(var(--champagne-pale))" }}>
                触碰蛋糕 · 粒子散开
              </span>
            </div>
          </div>

          {/* Art deco divider */}
          <div className="flex items-center justify-center gap-3 px-6 py-1">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, hsl(43,88%,58%/0.3))" }} />
            <div className="w-1.5 h-1.5 rotate-45" style={{ border: "1px solid hsl(43,88%,58%/0.4)" }} />
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, hsl(43,88%,58%/0.3), transparent)" }} />
          </div>

          {/* Title */}
          <div className="text-center pt-3 pb-1 px-6">
            <h2 className="text-2xl sm:text-3xl font-bold shimmer-gatsby tracking-[0.2em] text-shadow-gatsby font-handwriting">
              HAPPY BIRTHDAY
            </h2>
          </div>

          {/* Message */}
          <div className="px-6 pb-5">
            <div className="rounded-lg p-5 text-sm leading-relaxed whitespace-pre-line"
              style={{
                background: "linear-gradient(135deg, hsl(240,18%,12%), hsl(240,15%,15%))",
                border: "1px solid hsl(43,40%,15%)",
                color: "hsl(42,30%,85%)",
              }}
            >
              {BLESSING_MESSAGE}
            </div>
          </div>

          {/* Art deco bottom bars */}
          <div className="h-10 px-8 flex items-center justify-between opacity-20">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="w-px" style={{
                height: `${10 + Math.sin(i * 0.8) * 6}px`,
                backgroundColor: "hsl(var(--champagne))",
              }} />
            ))}
          </div>

          {/* Close */}
          <div className="flex justify-center pb-6">
            <Button variant="premium" size="sm" onClick={onClose} className="opacity-50 hover:opacity-100">
              关闭
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
