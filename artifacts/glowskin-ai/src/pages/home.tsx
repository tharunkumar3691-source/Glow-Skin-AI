import { Link } from "wouter";
import { GlowButton } from "@/components/ui-elements";
import { Camera, Activity, Sun, Droplets, Mic, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Camera,
    title: "AI Skin Scan",
    description: "Instantly analyze your skin's health using advanced computer vision.",
    color: "bg-rose-100 text-rose-600"
  },
  {
    icon: Activity,
    title: "Health Dashboard",
    description: "Track your 0-100 skin score and predicted recovery timeline.",
    color: "bg-emerald-100 text-emerald-600"
  },
  {
    icon: Sun,
    title: "Environmental Risk",
    description: "7-day localized forecast protecting you from UV and pollution.",
    color: "bg-amber-100 text-amber-600"
  },
  {
    icon: Droplets,
    title: "Habit Coach",
    description: "Personalized daily routines tailored to your unique skin profile.",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: Mic,
    title: "Voice Dermatologist",
    description: "Ask questions naturally to our AI Nova Sonic specialist.",
    color: "bg-purple-100 text-purple-600"
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-12">
      {/* Hero Section */}
      <section className="relative flex flex-col lg:flex-row items-center justify-between gap-12 mt-8 md:mt-12">
        <div className="flex-1 text-center lg:text-left z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 border border-primary/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Powered by Amazon Bedrock
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-foreground"
          >
            Reveal your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">healthiest skin</span>
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
              <GlowButton variant="outline" className="w-full sm:w-auto text-lg px-10 bg-white/50 backdrop-blur-sm">
                Talk to AI Doc
              </GlowButton>
            </Link>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex-1 relative w-full max-w-lg lg:max-w-none"
        >
          <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/20 border-8 border-white/50">
            <img 
              src={`${import.meta.env.BASE_URL}images/hero-abstract.png`} 
              alt="Soft elegant abstract skincare"
              className="w-full h-full object-cover animate-float"
            />
            {/* Decorative overlay elements */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent mix-blend-overlay"></div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="pt-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Skin Intelligence</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Everything you need to understand, protect, and improve your skin.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all group"
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
