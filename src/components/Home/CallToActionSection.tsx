import { motion } from 'motion/react';
import { ArrowRight, Compass, Sparkles, Leaf } from 'lucide-react';

interface CallToActionSectionProps {
  onOpenBookingModal: () => void;
  onExplorePrograms: () => void;
}

export default function CallToActionSection({
  onOpenBookingModal,
  onExplorePrograms,
}: CallToActionSectionProps) {
  return (
    <section id="cta-section" className="py-24 relative z-10 bg-[#121412] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-[2.5rem] bg-gradient-to-br from-[#1c1e1a] via-[#121412] to-[#1a1c1a] text-[#f4f1ea] p-10 sm:p-16 overflow-hidden shadow-2xl border border-[#c5a059]/30 sage-glow"
        >
          {/* Ambient Organic Background Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#2a2e26] rounded-full blur-[120px] opacity-40 pointer-events-none animate-pulse-glow" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#1c1e1a] rounded-full blur-[100px] opacity-30 pointer-events-none animate-float" />
          
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
            {/* Top Leaf Icon */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/40 text-[#c5a059] shadow-lg mx-auto">
              <Leaf className="w-7 h-7 transform -rotate-12 text-[#c5a059]" />
            </div>

            {/* Heading */}
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#f4f1ea] leading-tight">
              Begin Your <span className="italic text-[#c5a059]">Wellness Journey</span> Today
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-lg text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
              Take the first step toward improved strength, flexibility, balance, and inner peace with expert-led online yoga sessions designed to fit your goals and lifestyle.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={onOpenBookingModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-xs font-bold tracking-widest uppercase text-[#121412] gold-gradient gold-gradient-hover shadow-xl shadow-[#c5a059]/20 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span>Book Your Session</span>
                <ArrowRight className="w-4 h-4 text-[#121412]" />
              </button>

              <button
                onClick={onExplorePrograms}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-xs font-semibold tracking-wider uppercase text-white glass-card hover:bg-white/10 border border-white/20 transition-all duration-300"
              >
                <Compass className="w-4 h-4 text-[#c5a059]" />
                <span>Explore Programs</span>
              </button>
            </div>

            {/* Location Notice */}
            <div className="pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-white/60">
              <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Welcoming practitioners globally across all countries and time zones</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
