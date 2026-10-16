import { motion } from 'motion/react';
import { Clock, Users, User, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { PROGRAMS } from '../../data/content';
import { ProgramItem } from '../../types';

interface ProgramPreviewProps {
  onSelectProgram: (program: ProgramItem) => void;
  onOpenBookingModal: (programId?: string) => void;
}

export default function ProgramPreview({ onSelectProgram, onOpenBookingModal }: ProgramPreviewProps) {
  return (
    <section id="programs" className="py-24 relative z-10 bg-[#121412] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#c5a059] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tailored Online Offerings</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#f4f1ea] leading-tight">
              Our Curated <span className="italic font-normal text-[#94a388]">Yoga Programs</span>
            </h2>
            <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">
              Designed for every age, fitness level, and mobility goal. Experience interactive video instruction live from anywhere in the world.
            </p>
          </div>

          <div className="hidden md:block">
            <span className="text-xs text-[#c5a059] uppercase font-semibold tracking-widest block text-right">
              Live Interactive Classes
            </span>
            <span className="font-serif text-sm italic text-[#94a388] block text-right">
              Group & Private Options
            </span>
          </div>
        </div>

        {/* 4 Premium Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PROGRAMS.map((program, idx) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: idx * 0.12 }}
              whileHover={{ y: -8 }}
              className="glass-card rounded-[2rem] overflow-hidden border border-white/10 hover:border-[#c5a059]/50 transition-all duration-300 shadow-2xl flex flex-col justify-between group"
            >
              <div>
                {/* Image Container with Hover Zoom & Badge */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-[0.7] contrast-[1.1]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121412] via-black/20 to-transparent" />

                  {/* Class Duration Tag */}
                  {program.duration && (
                    <div className="absolute top-4 left-4 bg-[#121412]/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-semibold text-[#f4f1ea] flex items-center gap-1.5 shadow-md border border-white/10">
                      <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>{program.duration}</span>
                    </div>
                  )}

                  {/* Title Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-serif text-2xl font-medium tracking-tight text-[#f4f1ea] drop-shadow-md">
                      {program.title}
                    </h3>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-5">
                  <p className="text-xs text-white/60 leading-relaxed line-clamp-3">
                    {program.description}
                  </p>

                  {/* Highlight Benefits List */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    {program.benefits.slice(0, 2).map((benefit, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2 text-[11px] text-white/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                        <span className="truncate">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Box */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-white/60">
                        <Users className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span>Group Class</span>
                      </div>
                      <span className="font-serif font-bold text-base text-[#c5a059]">
                        ${program.groupPrice}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/10">
                      <div className="flex items-center gap-1.5 text-white/60">
                        <User className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span>Private Session</span>
                      </div>
                      <span className="font-serif font-bold text-base text-[#c5a059]">
                        ${program.privatePrice}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-6 pt-0 space-y-2">
                <button
                  onClick={() => onSelectProgram(program)}
                  className="w-full py-3 px-4 rounded-full text-xs font-semibold tracking-wider uppercase text-[#f4f1ea] glass-card border border-white/20 hover:bg-[#c5a059] hover:text-[#121412] hover:border-[#c5a059] transition-all duration-300 flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onOpenBookingModal(program.id)}
                  className="w-full py-2.5 px-4 rounded-full text-[11px] font-medium text-[#c5a059] hover:text-white hover:underline transition-all text-center"
                >
                  Quick Book Session →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
