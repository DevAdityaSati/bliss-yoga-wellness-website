import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Clock, Users, UserCheck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PROGRAMS } from '../../data/content';

interface ProgramsPageProps {
  onViewDetail: (programId: string) => void;
  onOpenBookingModal: (programId?: string) => void;
}

export default function ProgramsPage({ onViewDetail, onOpenBookingModal }: ProgramsPageProps) {
  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Premium Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-[#c5a059]/30 text-[#c5a059] text-xs font-semibold tracking-wider uppercase backdrop-blur-md shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mindful Practice for Every Journey</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#f4f1ea] leading-tight"
        >
          Explore Our <span className="italic text-[#c5a059]">Yoga Programs</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-white/80 leading-relaxed max-w-3xl mx-auto font-light"
        >
          Discover thoughtfully designed yoga programs that support strength, flexibility, mobility,
          mindfulness, stress management, and overall well-being. Whether you are beginning your yoga
          journey or deepening your existing practice, there is a program designed for your goals.
        </motion.p>
      </section>

      {/* 4 Premium Glassmorphism Cards Grid with Subtle 3D Hover Effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
        {PROGRAMS.map((program, index) => (
          <motion.div
            key={program.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="group relative rounded-3xl bg-white/[0.04] border border-white/10 p-6 sm:p-8 backdrop-blur-xl hover:border-[#c5a059]/50 hover:bg-white/[0.07] transition-all duration-500 flex flex-col justify-between shadow-2xl overflow-hidden"
          >
            {/* Ambient Gold Glow on Card Hover */}
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-[#c5a059]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="space-y-6">
              {/* High Quality Program Image */}
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                <img
                  src={program.image}
                  alt={program.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121412] via-transparent to-transparent opacity-80" />
                
                {/* Duration Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#121412]/80 backdrop-blur-md border border-white/15 text-xs text-[#f4f1ea] flex items-center gap-1.5 shadow-md">
                  <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>{program.duration || '60 Minutes'}</span>
                </div>
              </div>

              {/* Title & Short Description */}
              <div className="space-y-2">
                <h2 className="font-serif text-2xl sm:text-3xl text-[#f4f1ea] font-medium group-hover:text-[#c5a059] transition-colors">
                  {program.title}
                </h2>
                <p className="text-sm text-white/75 leading-relaxed font-light">
                  {program.description}
                </p>
              </div>

              {/* Key Benefits Teaser */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#94a388] block">
                  Key Focus Areas
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs text-white/80">
                  {program.benefits.slice(0, 4).map((b) => (
                    <div key={b} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                      <span className="truncate">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Glassmorphism Pricing Box */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-white/60 text-[11px] flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#94a388]" /> Group Class
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-semibold text-[#f4f1ea]">${program.groupPrice}</span>
                    <span className="text-[10px] text-white/50">/ 60 mins</span>
                  </div>
                </div>

                <div className="space-y-1 border-l border-white/10 pl-3">
                  <span className="text-white/60 text-[11px] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#c5a059]" /> Private 1-on-1
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-semibold text-[#c5a059]">${program.privatePrice}</span>
                    <span className="text-[10px] text-white/50">/ 60 mins</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 mt-6 border-t border-white/10 grid grid-cols-2 gap-3">
              <button
                onClick={() => onViewDetail(program.id)}
                className="w-full py-3 px-4 rounded-xl text-xs font-medium tracking-wide text-[#f4f1ea] bg-white/5 border border-white/15 hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-1.5 group/btn"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#94a388] group-hover/btn:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onOpenBookingModal(program.id)}
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold tracking-wider uppercase text-[#121412] gold-gradient hover:opacity-95 shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Book Session</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
