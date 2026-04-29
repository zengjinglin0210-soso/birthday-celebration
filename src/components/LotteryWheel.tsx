import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "./ui/button";

const PRIZES = [
  { label: "iPhone 17\nPro Max", color: "#FF6B6B", icon: "📱" },
  { label: "PS5\n光驱版", color: "#4ECDC4", icon: "🎮" },
  { label: "谢谢\n参与", color: "#95A5A6", icon: "🍀" },
  { label: "奔驰C级\nAMG", color: "#A78BFA", icon: "🚗" },
  { label: "有马空间\n24h门票", color: "#FF8E53", icon: "🎫" },
  { label: "iPhone 17\nPro Max", color: "#FF6B6B", icon: "📱" },
  { label: "PS5\n光驱版", color: "#4ECDC4", icon: "🎮" },
  { label: "谢谢\n参与", color: "#95A5A6", icon: "🍀" },
];

const WHEEL_ITEMS = [
  ...PRIZES,
  ...PRIZES,
];

const LOTTERY_KEY = "birthday_lottery_used";

interface LotteryWheelProps {
  onClose: () => void;
}

export default function LotteryWheel({ onClose }: LotteryWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const segmentAngle = 360 / WHEEL_ITEMS.length;

  useEffect(() => {
    // Check if this user/IP has already played
    const used = localStorage.getItem(LOTTERY_KEY);
    if (used) {
      setAlreadyPlayed(true);
      setResult("🍀 谢谢\n参与");
    }
  }, []);

  const spin = useCallback(() => {
    if (spinning || alreadyPlayed) return;
    setSpinning(true);
    setResult(null);

    // Always land on a "谢谢参与" segment
    const thankYouIndices = WHEEL_ITEMS
      .map((item, i) => item.label === "谢谢\n参与" ? i : -1)
      .filter(i => i >= 0);
    const targetIndex = thankYouIndices[Math.floor(Math.random() * thankYouIndices.length)];
    const targetAngle = 360 - (targetIndex * segmentAngle + segmentAngle / 2);
    const totalRotation = 360 * 8 + targetAngle;

    setRotation(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(WHEEL_ITEMS[targetIndex].icon + " " + WHEEL_ITEMS[targetIndex].label);
      setRotation(targetAngle % 360);
      setAlreadyPlayed(true);
      // Mark as used — one per client
      localStorage.setItem(LOTTERY_KEY, new Date().toISOString());
    }, 4200);
  }, [spinning, alreadyPlayed, segmentAngle]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[hsl(var(--night-deep))]/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex flex-col items-center animate-slide-scale-up" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl sm:text-3xl font-bold text-champagne tracking-[0.15em] mb-6 text-shadow-gatsby">
          幸运大转盘
        </h3>

        {/* Rules hint */}
        <p className="text-xs mb-4 tracking-wider opacity-40" style={{ color: "hsl(var(--champagne-pale))" }}>
          每人限抽一次，重复无效
        </p>

        {/* Wheel container with sparkle glow */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 mb-6">
          {/* Ambient sparkle ring */}
          <div className="absolute -inset-6 rounded-full opacity-30 pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(var(--champagne)/0.2), transparent 70%)", filter: "blur(20px)" }}
          />
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full"
            style={{
              border: "2px solid hsl(var(--champagne)/0.4)",
              boxShadow: "0 0 40px hsl(var(--champagne)/0.15), 0 0 80px hsl(var(--champagne)/0.05)",
            }}
          >
            {/* Decorative gold dots */}
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: "4px", height: "4px",
                  top: "50%", left: "50%",
                  transform: `rotate(${i * 15}deg) translateY(-${140}px)`,
                  marginLeft: "-2px", marginTop: "-2px",
                  backgroundColor: "hsl(var(--champagne))",
                  boxShadow: "0 0 6px hsl(var(--champagne)/0.5)",
                  opacity: 0.6 + Math.sin(i * 0.5) * 0.3,
                }}
              />
            ))}
          </div>

          {/* Spinning wheel */}
          <div
            ref={wheelRef}
            className="absolute inset-4 rounded-full overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? "transform 4s cubic-bezier(0.15, 0.85, 0.25, 1)"
                : "none",
            }}
          >
            <svg viewBox="0 0 300 300" className="w-full h-full">
              {WHEEL_ITEMS.map((item, i) => {
                const startAngle = (i * segmentAngle * Math.PI) / 180 - Math.PI / 2;
                const endAngle = ((i + 1) * segmentAngle * Math.PI) / 180 - Math.PI / 2;
                const x1 = 150 + 150 * Math.cos(startAngle);
                const y1 = 150 + 150 * Math.sin(startAngle);
                const x2 = 150 + 150 * Math.cos(endAngle);
                const y2 = 150 + 150 * Math.sin(endAngle);
                const largeArc = segmentAngle > 180 ? 1 : 0;

                const midAngle = startAngle + (segmentAngle * Math.PI) / 360;
                const textX = 150 + 85 * Math.cos(midAngle);
                const textY = 150 + 85 * Math.sin(midAngle);

                return (
                  <g key={i}>
                    <path
                      d={`M150,150 L${x1},${y1} A150,150 0 ${largeArc},1 ${x2},${y2} Z`}
                      fill={item.color}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="11"
                      fontWeight="bold"
                      transform={`rotate(${(i * segmentAngle + segmentAngle / 2)}, ${textX}, ${textY})`}
                      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                    >
                      {item.icon}
                    </text>
                    <text
                      x={textX}
                      y={textY + 16}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="8"
                      fontWeight="500"
                      transform={`rotate(${(i * segmentAngle + segmentAngle / 2)}, ${textX}, ${textY})`}
                      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                    >
                      {item.label.split("\n")[0]}
                    </text>
                    {item.label.includes("\n") && (
                      <text
                        x={textX}
                        y={textY + 28}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="8"
                        fontWeight="500"
                        transform={`rotate(${(i * segmentAngle + segmentAngle / 2)}, ${textX}, ${textY})`}
                        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                      >
                        {item.label.split("\n")[1]}
                      </text>
                    )}
                  </g>
                );
              })}
              {/* Center circle */}
              <circle cx="150" cy="150" r="35" fill="hsl(var(--night))" stroke="hsl(var(--gold))" strokeWidth="2" />
              <circle cx="150" cy="150" r="28" fill="hsl(var(--night-deep))" />
              <text x="150" y="150" textAnchor="middle" dominantBaseline="middle" fill="hsl(var(--gold-light))" fontSize="12" fontWeight="bold">
                抽奖
              </text>
            </svg>
          </div>

          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div
              className="w-0 h-0"
              style={{
                borderLeft: "14px solid transparent",
                borderRight: "14px solid transparent",
                borderTop: "28px solid hsl(var(--gold))",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
              }}
            />
          </div>
        </div>

        {/* Result display */}
        {result && !spinning && (
          <div className="mb-4 px-6 py-3 rounded-lg bg-[hsl(var(--primary))]/10 border border-[hsl(var(--gold))]/30 animate-bounce-in">
            {alreadyPlayed && !spinning ? (
              <>
                <p className="text-sm" style={{ color: "hsl(var(--champagne-pale))" }}>
                  您已参与过抽奖
                </p>
                <p className="text-lg font-bold whitespace-pre-line" style={{ color: "hsl(var(--champagne-light))" }}>
                  {result}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">恭喜获得：</p>
                <p className="text-lg font-bold text-gradient-gold whitespace-pre-line">{result}</p>
              </>
            )}
          </div>
        )}

        {/* Spin button */}
        <Button
          variant="gold"
          size="lg"
          onClick={spin}
          disabled={spinning || alreadyPlayed}
          className="min-w-40"
        >
          {spinning ? "抽奖中..." : alreadyPlayed ? "已参与" : "开始抽奖"}
        </Button>

        {/* Close button */}
        <Button
          variant="premium"
          size="sm"
          onClick={onClose}
          className="mt-3"
        >
          关闭
        </Button>
      </div>
    </div>
  );
}
