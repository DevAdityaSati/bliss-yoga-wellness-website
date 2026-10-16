import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Sparkles, ArrowRight, Compass, ShieldCheck, ChevronDown, Play } from 'lucide-react';
import { heroImg } from '../../data/content';

interface HeroSectionProps {
  onOpenBookingModal: () => void;
  onExplorePrograms: () => void;
}

export default function HeroSection({ onOpenBookingModal, onExplorePrograms }: HeroSectionProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 800], [0, 200]);
  const opacityText = useTransform(scrollY, [0, 500], [1, 0.2]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section id="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Background Image with Parallax & Soft Gradient Overlays */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 overflow-hidden">
        <motion.img
          src={heroImg}
          alt="Yoga handstand on sunrise beach"
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.6] contrast-[1.1] mix-blend-luminosity"
          referrerPolicy="no-referrer"
          animate={{
            x: mousePos.x * 0.5,
            y: mousePos.y * 0.5,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        />
        {/* Editorial Dark Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121412] via-[#121412]/70 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121412] via-[#121412]/80 to-transparent" />
      </motion.div>

      {/* Floating Organic Glowing Blobs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#2a2e26] rounded-full blur-[120px] opacity-40 pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/3 right-10 w-80 h-80 bg-[#1c1e1a] rounded-full blur-[100px] opacity-30 pointer-events-none animate-float-delayed" />

      {/* Main Hero Container */}
      <motion.div
        style={{ opacity: opacityText }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-8 space-y-8">
            {/* Top Pill Tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-card border border-[#c5a059]/30 shadow-md"
            >
              <span className="flex h-2 w-2 rounded-full bg-[#c5a059] animate-ping" />
              <span className="text-xs font-semibold tracking-wider text-[#c5a059] uppercase">
                Premium Online Yoga Studio
              </span>
              <span className="text-xs font-serif text-white/60 italic hidden sm:inline">
                • Global & Worldwide Sessions
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#f4f1ea] leading-[1.08]"
            >
              Transform Your <span className="italic font-light text-[#94a388]">Mind</span>,{' '}
              <span className="font-normal text-white">Body</span> &{' '}
              <span className="italic text-[#c5a059]">Life</span> Through Online Yoga
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg sm:text-xl text-white/60 max-w-2xl font-light leading-relaxed"
            >
              Experience personalized online yoga classes designed to improve strength, flexibility, mobility, mindfulness, and overall well-being from the comfort of your home.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
            >
              <button
                onClick={onOpenBookingModal}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-xs font-bold tracking-widest uppercase text-[#121412] gold-gradient gold-gradient-hover shadow-xl shadow-[#c5a059]/20 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span>Book Your Session</span>
                <ArrowRight className="w-4 h-4 text-[#121412] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExplorePrograms}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-xs font-semibold tracking-wider uppercase text-white glass-card hover:bg-white/10 border border-white/20 transition-all duration-300"
              >
                <Compass className="w-4 h-4 text-[#c5a059]" />
                <span>Explore Programs</span>
              </button>
            </motion.div>

            {/* Quick Micro Highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="pt-4 flex flex-wrap items-center gap-6 text-xs text-white/70 font-medium"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
                <span>5+ Years Teaching Experience</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#94a388]" />
                <span>Live Interactive Online Classes</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: 3D Floating Feature Card */}
          <div className="lg:col-span-4 hidden lg:block relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              style={{
                transform: `rotateY(${mousePos.x * 0.4}deg) rotateX(${-mousePos.y * 0.4}deg)`,
              }}
              className="glass-card p-6 rounded-3xl border border-white/10 shadow-2xl space-y-6 transform transition-transform duration-200 ease-out sage-glow"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/15 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059]">
                    <Play className="w-5 h-5 fill-current ml-0.5 text-[#c5a059]" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-semibold text-[#f4f1ea]">Live Sessions</h4>
                    <p className="text-xs text-white/50">Direct Guidance</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#c5a059]">
                  Interactive
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50">Target Audience</span>
                  <span className="font-medium text-[#f4f1ea]">Beginner to Advanced</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="gold-gradient h-full w-3/4 rounded-full" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <p className="text-xs text-white/70 italic">
                  "Mindful alignment & breathwork tailored to your specific daily needs."
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-6 h-6 rounded-full gold-gradient text-[#121412] text-[10px] flex items-center justify-center font-bold">
                    BY
                  </div>
                  <span className="text-[11px] font-semibold text-[#f4f1ea]">Bliss Studio Master</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 cursor-pointer text-white/50 hover:text-[#c5a059] transition-colors"
        onClick={onExplorePrograms}
      >
        <span className="text-[10px] tracking-widest uppercase font-semibold">Scroll to Explore</span>
        <ChevronDown className="w-4 h-4 text-[#c5a059]" />
      </motion.div>
    </section>
  );
}
