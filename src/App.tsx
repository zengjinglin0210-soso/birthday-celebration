import { useState, useRef, useCallback, useEffect, lazy, Suspense } from "react";
import CakeParticle from "./components/CakeParticle";
import StarfieldBackground from "./components/StarfieldBackground";
import { Button } from "./components/ui/button";

// Lazy load non-critical components — they only render on user interaction
const GreetingCard = lazy(() => import("./components/GreetingCard"));
const LotteryWheel = lazy(() => import("./components/LotteryWheel"));

type Stage = "cake" | "celebration";

export default function App() {
  const [stage, setStage] = useState<Stage>("cake");
  const [candlesLit, setCandlesLit] = useState(true);
  const [blowIntensity, setBlowIntensity] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [photoLoaded, setPhotoLoaded] = useState(false);

  const cakeCanvasRef = useRef<HTMLCanvasElement>(null);
  const pressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startBlowing = useCallback(() => {
    if (!candlesLit) return;
    let intensity = 0;
    pressTimerRef.current = setInterval(() => {
      intensity = Math.min(1, intensity + 0.015);
      setBlowIntensity(intensity);
      if (intensity >= 1) {
        setCandlesLit(false);
        setBlowIntensity(0);
        if (pressTimerRef.current) clearInterval(pressTimerRef.current);
        setTimeout(() => {
          setStage("celebration");
        }, 1500);
      }
    }, 30);
  }, [candlesLit]);

  const stopBlowing = useCallback(() => {
    if (pressTimerRef.current) {
      clearInterval(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    let intensity = blowIntensity;
    const fadeTimer = setInterval(() => {
      intensity = Math.max(0, intensity - 0.03);
      setBlowIntensity(intensity);
      if (intensity <= 0) clearInterval(fadeTimer);
    }, 30);
  }, [blowIntensity]);

  useEffect(() => {
    return () => {
      if (pressTimerRef.current) clearInterval(pressTimerRef.current);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gatsby-hero overflow-hidden">
      {/* Starfield background with Taurus constellation & meteors */}
      <StarfieldBackground />

      {/* Stage: Cake */}
      {stage === "cake" && (
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
          {/* Art deco border top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] max-w-2xl h-[1px]"
            style={{ background: "linear-gradient(90deg, transparent, hsl(var(--champagne)/0.4), transparent)" }}
          />

          {/* Cake canvas */}
          <div className="relative w-full h-[55vh] sm:h-[60vh] mb-6">
            <CakeParticle candlesLit={candlesLit} blowIntensity={blowIntensity} canvasRef={cakeCanvasRef} />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at center, transparent 35%, hsl(var(--night-deep)) 85%)" }}
            />
          </div>

          {/* Title */}
          <div className="text-center px-4 mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-champagne tracking-[0.15em] text-shadow-gatsby font-handwriting">
              HAPPY BIRTHDAY
            </h1>
            <p className="mt-2 text-xs sm:text-sm tracking-[0.3em] uppercase opacity-50"
              style={{ color: "hsl(var(--champagne-pale))" }}>
              {candlesLit ? "长按吹灭蜡烛" : "蜡烛已熄灭"}
            </p>
          </div>

          {/* Blow button */}
          {candlesLit && (
            <Button
              variant="gold"
              size="xl"
              className="px-14 py-5 text-lg sm:text-xl font-bold tracking-wider select-none"
              onMouseDown={startBlowing}
              onMouseUp={stopBlowing}
              onMouseLeave={stopBlowing}
              onTouchStart={(e) => { e.preventDefault(); startBlowing(); }}
              onTouchEnd={(e) => { e.preventDefault(); stopBlowing(); }}
              style={{
                transform: blowIntensity > 0 ? `scale(${1 + blowIntensity * 0.05})` : undefined,
                boxShadow: blowIntensity > 0
                  ? `0 0 ${40 + blowIntensity * 40}px hsl(var(--champagne) / ${0.3 + blowIntensity * 0.3})`
                  : undefined,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-3">
                <path d="M17 10V5a3 3 0 0 0-6 0v5H5a3 3 0 0 0 0 6h2.5a7.5 7.5 0 0 0 9.8 3.5l1.7-.85a2 2 0 0 0 1.1-2.6L17 10z" />
              </svg>
              长按吹蜡烛
            </Button>
          )}

          {/* Progress bar */}
          {blowIntensity > 0 && candlesLit && (
            <div className="mt-5 w-56 h-1.5 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-75"
                style={{
                  width: `${blowIntensity * 100}%`,
                  background: "linear-gradient(90deg, hsl(var(--champagne-dark)), hsl(var(--champagne)))",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Stage: Celebration */}
      {stage === "celebration" && (
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
          {/* Art deco frame */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[60%] max-w-md h-[1px]"
            style={{ background: "linear-gradient(90deg, transparent, hsl(var(--champagne)/0.5), transparent)" }}
          />

          <div className="text-center animate-slide-scale-up max-w-lg w-full">
            {/* Photo frame — Birthday Celebration Style */}
            <div className="relative mx-auto w-52 h-52 sm:w-60 sm:h-60 mb-10">
              {/* Animated rotating border ring — static gold ring below serves as fallback */}
              <div className="absolute -inset-2 rounded-full animate-spin-slow"
                style={{
                  background: "conic-gradient(from 0deg, hsl(var(--champagne-dark)/0.1), hsl(var(--gold-spark)/0.8), hsl(var(--champagne)/0.2), hsl(var(--gold-spark)/0.8), hsl(var(--champagne-dark)/0.1))",
                  padding: "2px",
                  WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
              />
              {/* Static gold ring */}
              <div className="absolute -inset-2 rounded-full"
                style={{
                  border: "1.5px solid hsl(var(--champagne)/0.35)",
                }}
              />
              {/* Warm glow */}
              <div className="absolute -inset-6 rounded-full opacity-60 animate-pulseGlow"
                style={{ background: "radial-gradient(circle, hsl(var(--champagne)/0.3), hsl(var(--rose-accent)/0.1) 40%, transparent 70%)" }}
              />
              {/* Outer soft bloom */}
              <div className="absolute -inset-10 rounded-full opacity-30"
                style={{ background: "radial-gradient(circle, hsl(var(--champagne)/0.15), transparent 60%)" }}
              />

              {/* Photo */}
              <div className="relative w-full h-full rounded-full overflow-hidden"
                style={{ border: "3px solid hsl(var(--champagne)/0.5)", boxShadow: "inset 0 0 20px hsl(var(--night-deep)/0.5)" }}
              >
                {!photoLoaded ? (
                  <div className="w-full h-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, hsl(var(--champagne)/0.15), hsl(var(--champagne-dark)/0.1))" }}
                  >
                    <div className="text-center opacity-40">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-2" style={{ color: "hsl(var(--champagne-pale))" }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <p className="text-[10px] tracking-wider" style={{ color: "hsl(var(--champagne-pale))" }}>REPLACE PHOTO</p>
                    </div>
                  </div>
                ) : null}
                <img
                  src={`${import.meta.env.BASE_URL}friend-photo.jpg`}
                  alt="Friend"
                  className={`w-full h-full object-cover ${!photoLoaded ? 'hidden' : ''}`}
                  onLoad={() => setPhotoLoaded(true)}
                  onError={() => setPhotoLoaded(false)}
                />
                {/* Inner light vignette */}
                <div className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle at 30% 25%, hsl(var(--gold-spark)/0.12) 0%, transparent 50%)" }}
                />
              </div>

              {/* Crown / Tiara on top */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl sm:text-3xl animate-float-crown" style={{ filter: "drop-shadow(0 0 8px hsl(var(--champagne)/0.6))" }}>
                <svg width="36" height="28" viewBox="0 0 36 28" fill="none" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
                  <path d="M2 22 L7 8 L12 16 L18 2 L24 16 L29 8 L34 22Z" fill="hsl(var(--champagne))" stroke="hsl(var(--champagne-light))" strokeWidth="1"/>
                  <circle cx="7" cy="8" r="2" fill="hsl(var(--rose-accent))"/>
                  <circle cx="18" cy="2" r="2.5" fill="hsl(var(--gold-spark))"/>
                  <circle cx="29" cy="8" r="2" fill="hsl(var(--rose-accent))"/>
                  <rect x="2" y="22" width="32" height="4" rx="1" fill="hsl(var(--champagne))" stroke="hsl(var(--champagne-light))" strokeWidth="0.5"/>
                </svg>
              </div>

              {/* Sparkle particles around frame */}
              {[
                { angle: 30, dist: 58, size: 4, delay: 0, dur: 2.5 },
                { angle: 100, dist: 62, size: 3, delay: 0.8, dur: 3 },
                { angle: 170, dist: 56, size: 5, delay: 1.5, dur: 2.8 },
                { angle: 230, dist: 64, size: 3, delay: 0.3, dur: 3.2 },
                { angle: 310, dist: 60, size: 4, delay: 1.1, dur: 2.6 },
                { angle: 60, dist: 66, size: 2, delay: 2, dur: 3.5 },
                { angle: 200, dist: 68, size: 3, delay: 0.5, dur: 2.9 },
                { angle: 340, dist: 55, size: 4, delay: 1.8, dur: 3.1 },
              ].map((sp, i) => {
                const rad = (sp.angle * Math.PI) / 180;
                const x = 50 + (sp.dist / 100) * 50 * Math.cos(rad);
                const y = 50 + (sp.dist / 100) * 50 * Math.sin(rad);
                return (
                  <div
                    key={i}
                    className="absolute rounded-full animate-sparkle"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${sp.size}px`,
                      height: `${sp.size}px`,
                      backgroundColor: i % 3 === 0 ? "hsl(var(--rose-accent)/0.7)" : "hsl(var(--gold-spark)/0.8)",
                      boxShadow: `0 0 ${sp.size * 2}px ${i % 3 === 0 ? "hsl(var(--rose-accent)/0.4)" : "hsl(var(--gold-spark)/0.5)"}`,
                      animationDelay: `${sp.delay}s`,
                      animationDuration: `${sp.dur}s`,
                    }}
                  />
                );
              })}

              {/* Art Deco corner ornaments */}
              {[
                { pos: "top-1 left-1/2 -translate-x-1/2 -translate-y-1/2", rotate: 0 },
                { pos: "bottom-1 left-1/2 -translate-x-1/2 translate-y-1/2", rotate: 180 },
                { pos: "left-1 top-1/2 -translate-x-1/2 -translate-y-1/2", rotate: -90 },
                { pos: "right-1 top-1/2 translate-x-1/2 -translate-y-1/2", rotate: 90 },
              ].map((corner, i) => (
                <div
                  key={`corner-${i}`}
                  className={`absolute ${corner.pos}`}
                  style={{ transform: `${corner.pos.includes("translate") ? "" : ""}rotate(${corner.rotate}deg)`, color: "hsl(var(--champagne)/0.5)", fontSize: "8px" }}
                >
                  ✦
                </div>
              ))}
            </div>

            {/* Birthday text */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold shimmer-gatsby mb-4 text-shadow-gatsby tracking-wider">
              生日快乐～
            </h2>
            <div className="flex justify-center gap-3 flex-wrap">
              <span className="inline-block px-5 py-1.5 text-xs tracking-[0.2em] uppercase font-handwriting"
                style={{
                  background: "hsl(var(--champagne)/0.08)",
                  border: "1px solid hsl(var(--champagne)/0.2)",
                  borderRadius: "9999px",
                  color: "hsl(var(--champagne-light))",
                }}
              >
                Happy Birthday
              </span>
              <span className="inline-block px-5 py-1.5 text-xs tracking-[0.2em] uppercase font-handwriting"
                style={{
                  background: "hsl(var(--rose-accent)/0.08)",
                  border: "1px solid hsl(var(--rose-accent)/0.2)",
                  borderRadius: "9999px",
                  color: "hsl(var(--rose-light))",
                }}
              >
                Forever Young
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-5 mt-12 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <Button variant="gold" size="lg" onClick={() => setShowCard(true)} className="min-w-40 tracking-wider">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              查看美女留言
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setShowWheel(true)} className="min-w-40 tracking-wider">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="12,6 12,12 16,14" />
              </svg>
              幸运抽奖
            </Button>
          </div>

          {/* Floating sparkles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {["✦", "◆", "◇", "⬩", "✧", "✦", "◆", "⬥"].map((sym, i) => (
              <span
                key={i}
                className="absolute text-xl sm:text-2xl opacity-20 animate-float"
                style={{
                  left: `${8 + (i * 12) % 84}%`,
                  top: `${5 + (i * 15) % 70}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3.5 + i * 0.4}s`,
                  color: "hsl(var(--champagne))",
                }}
              >
                {sym}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Greeting Card — lazy loaded */}
      {showCard && (
        <Suspense fallback={null}>
          <GreetingCard onClose={() => setShowCard(false)} />
        </Suspense>
      )}

      {/* Lottery Wheel — lazy loaded */}
      {showWheel && (
        <Suspense fallback={null}>
          <LotteryWheel onClose={() => setShowWheel(false)} />
        </Suspense>
      )}
    </div>
  );
}
