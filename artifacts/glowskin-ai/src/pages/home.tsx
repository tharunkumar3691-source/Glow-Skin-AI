import { Link } from "wouter";
import { GlowButton } from "@/components/ui-elements";
import { Camera, Activity, Sun, Droplets, Mic, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const features = [
  { icon: Camera,   title: "AI Skin Scan",        description: "Instantly analyze your skin using advanced computer vision.",              color: "bg-rose-100   text-rose-600"   },
  { icon: Activity, title: "Health Dashboard",     description: "Track your 0–100 skin score and predicted recovery timeline.",            color: "bg-emerald-100 text-emerald-600" },
  { icon: Sun,      title: "Environmental Risk",   description: "7-day localized forecast protecting you from UV and pollution.",          color: "bg-amber-100   text-amber-600"  },
  { icon: Droplets, title: "Habit Coach",          description: "Personalized daily routines tailored to your unique skin profile.",      color: "bg-blue-100    text-blue-600"   },
  { icon: Mic,      title: "Voice Dermatologist",  description: "Ask questions naturally to our AI Nova Sonic specialist.",               color: "bg-purple-100  text-purple-600" },
  { icon: Shield,   title: "Skin Protection",      description: "Preventive advice and product recommendations powered by Bedrock AI.",   color: "bg-pink-100    text-pink-600"   },
];


// Orbiting dots config
const orbits = [
  { r: 130, duration: 8,  dots: 3, size: 5,  opacity: 0.8, color: "#e88c9a" },
  { r: 170, duration: 13, dots: 5, size: 3,  opacity: 0.5, color: "#9b8fe8" },
  { r: 210, duration: 18, dots: 7, size: 2,  opacity: 0.35, color: "#8fb8e8" },
];

function AnimatedOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const t = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = 420;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;

    function drawFrame() {
      t.current += 0.012;
      ctx!.clearRect(0, 0, size, size);

      // --- Outer glow rings ---
      for (let i = 3; i >= 1; i--) {
        const glow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 95 + i * 18);
        glow.addColorStop(0,   `rgba(220, 100, 130, ${0.08 * i})`);
        glow.addColorStop(0.5, `rgba(160, 80, 200, ${0.05 * i})`);
        glow.addColorStop(1,   "rgba(0,0,0,0)");
        ctx!.beginPath();
        ctx!.arc(cx, cy, 95 + i * 18, 0, Math.PI * 2);
        ctx!.fillStyle = glow;
        ctx!.fill();
      }

      // --- Core orb ---
      const grad = ctx!.createRadialGradient(cx - 25, cy - 25, 0, cx, cy, 90);
      grad.addColorStop(0,   "#ff9bb5");
      grad.addColorStop(0.3, "#d4609a");
      grad.addColorStop(0.65, "#8a4fcf");
      grad.addColorStop(1,   "#2a1a4a");
      ctx!.beginPath();
      ctx!.arc(cx, cy, 90, 0, Math.PI * 2);
      ctx!.fillStyle = grad;
      ctx!.fill();

      // Specular highlight
      const hi = ctx!.createRadialGradient(cx - 30, cy - 30, 0, cx - 20, cy - 20, 50);
      hi.addColorStop(0, "rgba(255,255,255,0.35)");
      hi.addColorStop(1, "rgba(255,255,255,0)");
      ctx!.beginPath();
      ctx!.arc(cx, cy, 90, 0, Math.PI * 2);
      ctx!.fillStyle = hi;
      ctx!.fill();

      // --- Scan line (sweeps vertically) ---
      const scanY = cy - 80 + ((Math.sin(t.current * 0.8) + 1) / 2) * 160;
      const scanGrad = ctx!.createLinearGradient(cx - 80, scanY - 6, cx - 80, scanY + 6);
      scanGrad.addColorStop(0,   "rgba(255,180,210,0)");
      scanGrad.addColorStop(0.5, "rgba(255,180,210,0.8)");
      scanGrad.addColorStop(1,   "rgba(255,180,210,0)");
      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(cx, cy, 88, 0, Math.PI * 2);
      ctx!.clip();
      ctx!.fillRect(cx - 88, scanY - 6, 176, 12);
      ctx!.fillStyle = scanGrad;
      ctx!.fillRect(cx - 88, scanY - 6, 176, 12);
      ctx!.restore();

      // --- Orbiting dots ---
      orbits.forEach(({ r, duration, dots, size: ds, opacity, color }) => {
        for (let d = 0; d < dots; d++) {
          const angle = t.current * (Math.PI * 2 / duration) + (d * Math.PI * 2 / dots);
          const dx = cx + Math.cos(angle) * r;
          const dy = cy + Math.sin(angle) * r * 0.35; // flatten into ellipse
          const depthScale = (Math.sin(angle) + 1.5) / 2.5;
          ctx!.beginPath();
          ctx!.arc(dx, dy, ds * depthScale, 0, Math.PI * 2);
          ctx!.fillStyle = color + Math.round(opacity * depthScale * 255).toString(16).padStart(2, "0");
          ctx!.fill();
        }
      });

      // --- Corner bracket decorations ---
      ctx!.strokeStyle = "rgba(220,140,180,0.4)";
      ctx!.lineWidth = 2;
      const bSize = 20;
      const br = 95;
      const corners: [number, number, number, number][] = [
        [cx - br, cy - br,  1,  1],
        [cx + br, cy - br, -1,  1],
        [cx - br, cy + br,  1, -1],
        [cx + br, cy + br, -1, -1],
      ];
      corners.forEach(([bx, by, sx, sy]) => {
        ctx!.beginPath();
        ctx!.moveTo(bx + sx * bSize, by);
        ctx!.lineTo(bx, by);
        ctx!.lineTo(bx, by + sy * bSize);
        ctx!.stroke();
      });

      // --- Floating data points on the orb surface ---
      const points = [
        { angle: t.current * 0.5,  label: "Acne: Clear",    col: "#6ee7b7" },
        { angle: t.current * 0.5 + 2.1, label: "UV: Safe",  col: "#fbbf24" },
        { angle: t.current * 0.5 + 4.2, label: "Hydrated",  col: "#93c5fd" },
      ];
      ctx!.font = "bold 9px 'Outfit', sans-serif";
      points.forEach(({ angle, label, col }) => {
        const px = cx + Math.cos(angle) * 65;
        const py = cy + Math.sin(angle) * 65;
        const pulse = 0.7 + 0.3 * Math.sin(t.current * 2 + angle);
        ctx!.globalAlpha = pulse;
        ctx!.fillStyle = col;
        ctx!.beginPath();
        ctx!.arc(px, py, 3, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.globalAlpha = pulse * 0.85;
        ctx!.fillStyle = col;
        ctx!.fillText(label, px + 6, py + 3);
        ctx!.globalAlpha = 1;
      });

      animRef.current = requestAnimationFrame(drawFrame);
    }

    drawFrame();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ maxWidth: 420, maxHeight: 420 }} />;
}


export default function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-12">
      {/* Hero */}
      <section className="relative flex flex-col lg:flex-row items-center justify-between gap-12 mt-8 md:mt-12">

        {/* Left — copy */}
        <div className="flex-1 text-center lg:text-left z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 border border-primary/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Powered by Amazon Bedrock
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-foreground"
          >
            Reveal your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-pink-400 to-purple-400">
              healthiest skin
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
          >
            Your personal AI dermatologist. Scan your face, get clinical-grade insights, and unlock a customized routine that adapts to your environment.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
          >
            <Link href="/scan">
              <GlowButton className="w-full sm:w-auto text-lg px-10">
                Start Free Scan <ArrowRight className="w-5 h-5" />
              </GlowButton>
            </Link>
            <Link href="/voice">
              <GlowButton variant="outline" className="w-full sm:w-auto text-lg px-10">
                Talk to AI Doc
              </GlowButton>
            </Link>
          </motion.div>

          {/* Quick stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="flex gap-8 mt-10 justify-center lg:justify-start"
          >
            {[
              { n: "10K+", label: "Scans done" },
              { n: "98%",  label: "Accuracy" },
              { n: "7",    label: "AI features" },
            ].map(({ n, label }) => (
              <div key={label} className="text-center lg:text-left">
                <p className="text-2xl font-bold text-primary">{n}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — animated orb */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="flex-1 relative flex items-center justify-center w-full"
          style={{ minHeight: 420 }}
        >
          {/* Outer glow halo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.45, 0.25] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-72 h-72 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(210,80,130,0.35) 0%, transparent 70%)" }}
            />
          </div>

          {/* Canvas orb */}
          <div className="relative z-10 w-[340px] h-[340px] md:w-[420px] md:h-[420px]">
            <AnimatedOrb />
          </div>

          {/* Floating metric cards */}
          <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9, type: "spring" }}
            className="absolute top-[4%] right-[4%] bg-white/80 backdrop-blur-md border border-border rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 z-20">
            <span className="text-xl text-emerald-500">✦</span>
            <div><p className="text-xs text-muted-foreground">Skin Score</p><p className="text-lg font-bold text-emerald-600">94<span className="text-xs font-normal ml-0.5 opacity-60">/100</span></p></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1, type: "spring" }}
            className="absolute bottom-[22%] right-[0%] bg-white/80 backdrop-blur-md border border-border rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 z-20">
            <span className="text-xl text-blue-500">◈</span>
            <div><p className="text-xs text-muted-foreground">Hydration</p><p className="text-lg font-bold text-blue-600">87<span className="text-xs font-normal ml-0.5 opacity-60">%</span></p></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.3, type: "spring" }}
            className="absolute bottom-[4%] left-[2%] bg-white/80 backdrop-blur-md border border-border rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 z-20">
            <span className="text-xl text-amber-500">☀</span>
            <div><p className="text-xs text-muted-foreground">UV Risk</p><p className="text-lg font-bold text-amber-600">Low</p></div>
          </motion.div>

          {/* Scan indicator badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="absolute top-[22%] left-[0%] bg-primary/20 border border-primary/40 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2 z-20"
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2 h-2 rounded-full bg-primary block"
            />
            <span className="text-xs text-primary font-semibold">AI Scanning…</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="pt-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Skin Intelligence</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Everything you need to understand, protect, and transform your skin.</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, type: "spring", stiffness: 120 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.09)] hover:border-primary/20 transition-all group cursor-default"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
