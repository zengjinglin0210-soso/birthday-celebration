import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  prefix: "",
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        border: "hsl(var(--border))", input: "hsl(var(--input))", ring: "hsl(var(--ring))",
        background: "hsl(var(--background))", foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        champagne: {
          DEFAULT: "hsl(var(--champagne))",
          light: "hsl(var(--champagne-light))",
          dark: "hsl(var(--champagne-dark))",
          pale: "hsl(var(--champagne-pale))",
          spark: "hsl(var(--gold-spark))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))", light: "hsl(var(--gold-light))", dark: "hsl(var(--gold-dark))",
        },
        rose: { DEFAULT: "hsl(var(--rose-accent))", light: "hsl(var(--rose-light))" },
        night: { DEFAULT: "hsl(var(--night))", deep: "hsl(var(--night-deep))" },
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      boxShadow: {
        gatsby: "0 0 80px hsl(var(--champagne) / 0.2), 0 0 160px hsl(var(--champagne) / 0.06)",
        "gatsby-card": "0 8px 50px rgba(0,0,0,0.7), 0 0 0 1px hsl(var(--champagne) / 0.15)",
        "gatsby-btn": "0 0 30px hsl(var(--champagne) / 0.3), 0 0 60px hsl(var(--champagne) / 0.1)",
        glow: "0 0 80px hsl(var(--primary) / 0.4)",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-20px)" } },
        pulseGlow: { "0%,100%": { opacity: "0.6" }, "50%": { opacity: "1" } },
        "shimmer-gatsby": { "0%": { backgroundPosition: "300% 0" }, "100%": { backgroundPosition: "-300% 0" } },
        sparkle: { "0%,100%": { opacity: "0", transform: "scale(0)" }, "50%": { opacity: "1", transform: "scale(1)" } },
        "fade-in-up": { "0%": { opacity: "0", transform: "translateY(30px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "slide-scale-up": { "0%": { transform: "scale(0.3) translateY(100px)", opacity: "0" }, "100%": { transform: "scale(1) translateY(0)", opacity: "1" } },
        "wheel-spin-fast": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(2520deg)" } },
        "bounce-in": { "0%": { transform: "scale(0)", opacity: "0" }, "50%": { transform: "scale(1.1)" }, "100%": { transform: "scale(1)", opacity: "1" } },
        "confetti-fall": { "0%": { transform: "translateY(-10vh) rotate(0deg)", opacity: "1" }, "100%": { transform: "translateY(110vh) rotate(720deg)", opacity: "0" } },
        "card-open-gatsby": {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "gold-sweep": {
          "0%": { backgroundPosition: "-100% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin-slow": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
        "float-crown": {
          "0%,100%": { transform: "translateX(-50%) translateY(0px)" },
          "50%": { transform: "translateX(-50%) translateY(-6px)" },
        },
        "art-deco-appear": {
          "0%": { opacity: "0", clipPath: "inset(0 100% 0 0)" },
          "100%": { opacity: "1", clipPath: "inset(0 0 0 0)" },
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
        "shimmer-gatsby": "shimmer-gatsby 4s ease-in-out infinite",
        sparkle: "sparkle 1.5s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        "slide-scale-up": "slide-scale-up 0.6s ease-out forwards",
        "wheel-spin-fast": "wheel-spin-fast 4s cubic-bezier(0.15, 0.85, 0.25, 1) forwards",
        "bounce-in": "bounce-in 0.6s ease-out forwards",
        "confetti-fall": "confetti-fall 3s ease-in forwards",
        "card-open-gatsby": "card-open-gatsby 1s cubic-bezier(0.25, 0.1, 0.25, 1) forwards",
        "gold-sweep": "gold-sweep 3s linear infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "float-crown": "float-crown 3s ease-in-out infinite",
        "art-deco-appear": "art-deco-appear 0.8s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
