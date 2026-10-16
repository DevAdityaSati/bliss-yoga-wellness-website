import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import {
  Flower2,
  Heart,
  CheckCircle2,
  Feather,
  TrendingUp,
  Users,
  Shield,
  Star,
  Compass,
  Target,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { CORE_VALUES, heroImg } from '../../data/content';

interface AboutPageProps {
  onOpenBookingModal: () => void;
  onNavigateHome: () => void;
}

export default function AboutPage({ onOpenBookingModal, onNavigateHome }: AboutPageProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flower2':
        return <Flower2 className="w-5 h-5 text-[#c5a059]" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-[#c5a059]" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-5 h-5 text-[#c5a059]" />;
      case 'Feather':
        return <Feather className="w-5 h-5 text-[#c5a059]" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-[#c5a059]" />;
      case 'Users':
        return <Users className="w-5 h-5 text-[#c5a059]" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-[#c5a059]" />;
      case 'Star':
        return <Star className="w-5 h-5 text-[#c5a059]" />;
      default:
        return <Flower2 className="w-5 h-5 text-[#c5a059]" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-24 pb-20 bg-[#121412] min-h-screen text-[#f4f1ea]"
    >
      {/* About Hero Section */}
      <section ref={heroRef} className="relative pt-8 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Top Editorial Header & Narrative Teaser */}
          <div className="max-w-4xl mx-auto text-center space-y-5">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center justify-center gap-2 text-xs text-white/50">
              <button onClick={onNavigateHome} className="hover:text-[#c5a059] transition-colors">
                Home
              </button>
              <span>/</span>
              <span className="text-[#f4f1ea] font-semibold">About Us</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#c5a059] text-xs font-semibold uppercase tracking-wider backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Our Story & Philosophy</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-4xl sm:text-6xl lg:text-7xl text-[#f4f1ea] leading-tight font-normal"
            >
              About <span className="italic text-[#94a388]">Bliss Yoga</span> & Wellness
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-xl text-white/80 font-light max-w-2xl mx-auto leading-relaxed"
            >
              Where authentic ancient yoga traditions meet thoughtful, personalized online guidance for holistic wellness.
            </motion.p>
          </div>

          {/* Grand Editorial Hero Image Container (70-80% Viewport Height) */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/15 sage-glow group max-w-6xl mx-auto"
          >
            {/* Image occupying 70-80vh with smooth parallax motion */}
            <motion.div
              style={{ y: imageY, scale: imageScale }}
              className="w-full h-[65vh] sm:h-[75vh] min-h-[500px] max-h-[780px]"
            >
              <img
                src={heroImg}
                alt="Male yoga practitioner performing a perfectly aligned full handstand (Adho Mukha Vrksasana) on a peaceful beach during golden hour sunrise"
                className="w-full h-full object-cover object-center filter contrast-[1.05] brightness-[0.98] group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            {/* Subtle dark gradient only at bottom edge to preserve subject visibility */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#121412]/80 via-[#121412]/20 to-transparent pointer-events-none" />

            {/* Small Premium Badge in Upper Right Corner */}
            <div className="absolute top-6 right-6 z-10">
              <span className="px-4 py-2 rounded-full bg-[#121412]/70 backdrop-blur-xl border border-white/20 text-xs font-semibold tracking-wider uppercase text-[#c5a059] flex items-center gap-1.5 shadow-2xl">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Adho Mukha Vrksasana</span>
              </span>
            </div>
          </motion.div>

          {/* Separate Glassmorphism Information Panel Placed BELOW the Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-6xl mx-auto p-6 sm:p-8 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
          >
            {/* Col 1: Lead Instructor */}
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[#c5a059] block">
                LEAD YOGA INSTRUCTOR
              </span>
              <p className="text-sm font-bold text-[#f4f1ea] flex items-center justify-center md:justify-start gap-1.5">
                <span>DEV</span>
              </p>
              <p className="text-xs text-white/60 font-light">Certified Hatha & Vinyasa Instructor</p>
            </div>

            {/* Col 2: Years Experience */}
            <div className="space-y-1 text-center md:border-x md:border-white/10 md:px-6">
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#f4f1ea]">
                5+ Years
              </h3>
              <p className="text-xs text-white/70 font-light">of Certified Practice & Teaching</p>
            </div>

            {/* Col 3: Pillars */}
            <div className="space-y-1 text-center md:text-right">
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[#94a388] block">
                CORE PILLARS
              </span>
              <p className="text-xs sm:text-sm font-medium tracking-wide text-[#f4f1ea]">
                Strength <span className="text-[#c5a059] mx-1">•</span> Balance <span className="text-[#c5a059] mx-1">•</span> Discipline <span className="text-[#c5a059] mx-1">•</span> Inner Peace
              </p>
            </div>
          </motion.div>

          {/* Narrative Biography & Story Section */}
          <div className="max-w-4xl mx-auto pt-8 space-y-8">
            <div className="p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6 backdrop-blur-md">
              <div className="flex items-center gap-3.5 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-[#f4f1ea]">
                    DEV
                  </h3>
                  <p className="text-xs text-[#c5a059] font-medium">Lead Yoga Instructor & Certified Hatha & Vinyasa Master</p>
                </div>
              </div>

              <p className="text-lg sm:text-xl font-serif text-[#f4f1ea] italic border-l-2 border-[#c5a059] pl-6 py-1 leading-relaxed">
                "Welcome to Bliss Yoga & Wellness, where authentic yoga meets personalized online guidance. Our mission is to support your journey toward functional physical health and lasting mental clarity."
              </p>

              <div className="space-y-4 text-sm sm:text-base text-white/75 leading-relaxed font-light">
                <p>
                  As Lead Instructor, <strong className="font-semibold text-[#f4f1ea]">DEV</strong> founded Bliss Yoga & Wellness to bridge authentic yoga traditions with personalized online guidance. With over five years of dedicated teaching experience in Hatha and Vinyasa Yoga, DEV has created a sanctuary where students worldwide can practice mindfulness with confidence.
                </p>

                <p>
                  Over the years, <strong className="font-semibold text-[#f4f1ea]">DEV</strong> has guided more than 1,000 students across various global time zones with diverse health goals — including improving spinal posture, increasing joint mobility, building core strength, managing stress, and establishing sustainable daily self-care routines.
                </p>

                <p>
                  Every class is designed with careful attention to proper biomechanical alignment, conscious breathing techniques, and individual progression. Whether your goal is fitness, stress relief, mobility, or inner peace, every session is tailored to meet your unique needs.
                </p>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#c5a059]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#f4f1ea] block">Live Online Studio</span>
                    <span className="text-[11px] text-white/50">1-on-1 & Group Classes Worldwide</span>
                  </div>
                </div>

                <button
                  onClick={onOpenBookingModal}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-xs font-bold tracking-widest uppercase text-[#121412] gold-gradient gold-gradient-hover shadow-xl transition-all"
                >
                  <span>Book a Private Session</span>
                  <ArrowRight className="w-4 h-4 text-[#121412]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 relative z-10 bg-[#181a18]/80 my-12 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card p-8 sm:p-10 rounded-[2rem] border border-white/10 space-y-4 shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#c5a059]">
                <Target className="w-6 h-6 text-[#c5a059]" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#f4f1ea]">Our Mission</h2>
              <p className="text-sm sm:text-base text-white/60 leading-relaxed font-light">
                To make authentic yoga accessible to people of all ages and experience levels through professional online instruction.
              </p>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="glass-card p-8 sm:p-10 rounded-[2rem] border border-white/10 space-y-4 shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#c5a059]">
                <Compass className="w-6 h-6 text-[#c5a059]" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#f4f1ea]">Our Vision</h2>
              <p className="text-sm sm:text-base text-white/60 leading-relaxed font-light">
                To inspire healthier, happier, and more balanced lives by making yoga an enjoyable part of everyday living.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs uppercase font-semibold tracking-widest text-[#c5a059]">
              Guiding Principles
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#f4f1ea]">
              Our Core <span className="italic text-[#94a388]">Values</span>
            </h2>
            <div className="w-12 h-0.5 bg-[#c5a059] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CORE_VALUES.map((val, idx) => (
              <motion.div
                key={val.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                whileHover={{ y: -4 }}
                className="glass-card p-6 rounded-3xl border border-white/10 space-y-3 shadow-md hover:shadow-2xl transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  {getIcon(val.iconName)}
                </div>
                <h3 className="font-serif text-lg font-medium text-[#f4f1ea]">{val.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{val.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
