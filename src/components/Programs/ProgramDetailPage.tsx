import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle2,
  Users,
  ShieldCheck,
  ChevronDown,
  HelpCircle,
  BookOpen,
  Target,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PROGRAMS } from '../../data/content';

interface ProgramDetailPageProps {
  programId: string;
  onBackToPrograms: () => void;
  onSelectProgram: (id: string) => void;
  onOpenBookingModal: (id?: string) => void;
}

export default function ProgramDetailPage({
  programId,
  onBackToPrograms,
  onSelectProgram,
  onOpenBookingModal,
}: ProgramDetailPageProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const program = PROGRAMS.find((p) => p.id === programId) || PROGRAMS[0];
  const relatedPrograms = PROGRAMS.filter((p) => p.id !== program.id);

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Top Navigation Back Link */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <button
          onClick={onBackToPrograms}
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#94a388] hover:text-[#c5a059] transition-colors p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Programs</span>
        </button>

        <span className="text-xs text-white/50 hidden sm:inline-block">
          Bliss Yoga & Wellness Online Studio
        </span>
      </motion.div>

      {/* Large Hero Image & Headline Block */}
      <section className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#181a18]">
        <div className="relative h-72 sm:h-96 md:h-[420px] w-full">
          <img
            src={program.image}
            alt={program.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121412] via-[#121412]/60 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <span className="px-3.5 py-1.5 rounded-full bg-[#121412]/80 backdrop-blur-md border border-white/20 text-xs font-medium text-[#c5a059] flex items-center gap-1.5 shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Interactive Online Program</span>
            </span>

            <span className="px-3.5 py-1.5 rounded-full bg-[#121412]/80 backdrop-blur-md border border-white/20 text-xs text-[#f4f1ea] flex items-center gap-1.5 shadow-lg">
              <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>{program.duration || '60 Minutes'}</span>
            </span>
          </div>

          {/* Title and Short Details Overlay */}
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 max-w-3xl space-y-3">
            <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#f4f1ea] tracking-tight">
              {program.title}
            </h1>
            <p className="text-sm sm:text-base text-white/85 font-light leading-relaxed">
              {program.description}
            </p>
          </div>
        </div>

        {/* Pricing Bar */}
        <div className="p-6 bg-[#181a18]/90 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[#c5a059]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-white/60 block">Group Live Class</span>
              <span className="text-xl font-bold text-[#f4f1ea]">${program.groupPrice} <span className="text-xs font-normal text-white/50">/ 60 mins</span></span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:border-l md:border-white/10 md:pl-6">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[#c5a059]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-white/60 block">Private 1-on-1 Session</span>
              <span className="text-xl font-bold text-[#c5a059]">${program.privatePrice} <span className="text-xs font-normal text-white/50">/ 60 mins</span></span>
            </div>
          </div>

          <div className="md:text-right">
            <button
              onClick={() => onOpenBookingModal(program.id)}
              className="w-full md:w-auto px-8 py-3.5 rounded-2xl font-semibold text-xs tracking-wider uppercase text-[#121412] gold-gradient hover:opacity-95 shadow-xl transition-all"
            >
              Book {program.title}
            </button>
          </div>
        </div>
      </section>

      {/* Program Overview & Benefits Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content (2 Columns) */}
        <div className="lg:col-span-2 space-y-12">
          {/* Program Overview */}
          <section className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-[#c5a059]">
              <BookOpen className="w-5 h-5" />
              <h2 className="text-xs font-semibold uppercase tracking-wider">Program Overview</h2>
            </div>
            <p className="text-base text-white/85 leading-relaxed font-light">
              {program.overview || program.description}
            </p>
          </section>

          {/* Benefits */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-[#c5a059]">
              <Target className="w-5 h-5" />
              <h2 className="text-xs font-semibold uppercase tracking-wider">Key Benefits</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {program.benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3 hover:border-[#c5a059]/40 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#c5a059] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#f4f1ea] font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </section>

          {/* What You Will Learn */}
          {program.whatYouWillLearn && (
            <section className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 space-y-6">
              <div className="flex items-center gap-2 text-[#94a388]">
                <Layers className="w-5 h-5" />
                <h2 className="text-xs font-semibold uppercase tracking-wider">What You Will Learn</h2>
              </div>
              <ul className="space-y-3">
                {program.whatYouWillLearn.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/80 font-light">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#c5a059]/20 text-[#c5a059] text-[11px] font-semibold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Class Structure */}
          {program.classStructure && (
            <section className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 space-y-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#c5a059]">
                Class Structure (60 Minutes)
              </h2>
              <div className="space-y-3">
                {program.classStructure.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white/85 flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#c5a059] shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Program FAQs */}
          {program.faqs && program.faqs.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-[#c5a059]">
                <HelpCircle className="w-5 h-5" />
                <h2 className="text-xs font-semibold uppercase tracking-wider">
                  Program FAQs
                </h2>
              </div>
              <div className="space-y-3">
                {program.faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-5 text-left flex items-center justify-between font-medium text-sm text-[#f4f1ea] hover:text-[#c5a059] transition-colors"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#c5a059] transition-transform duration-300 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-5 pb-5 text-xs text-white/75 leading-relaxed font-light border-t border-white/5 pt-3"
                          >
                            {faq.answer}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Info & Suitable For */}
        <div className="space-y-8">
          {/* Who It Is For / Suitable For */}
          <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 space-y-4">
            <h3 className="font-serif text-xl text-[#f4f1ea] font-medium">Who It Is For</h3>
            <p className="text-xs text-white/70 font-light leading-relaxed">
              {program.recommendedFor}
            </p>

            {program.suitableFor && (
              <div className="pt-3 space-y-2 border-t border-white/10">
                <span className="text-[11px] font-semibold uppercase text-[#94a388] block">
                  Recommended Audiences
                </span>
                <div className="flex flex-wrap gap-2">
                  {program.suitableFor.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/85 font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {program.supports && (
              <div className="pt-3 space-y-2 border-t border-white/10">
                <span className="text-[11px] font-semibold uppercase text-[#c5a059] block">
                  Target Support Areas
                </span>
                <div className="flex flex-wrap gap-2">
                  {program.supports.map((sup) => (
                    <span
                      key={sup}
                      className="px-3 py-1 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 text-xs text-[#c5a059] font-medium"
                    >
                      {sup}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Booking CTA Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#1e221d] to-[#121412] border border-[#c5a059]/40 space-y-4 text-center">
            <h3 className="font-serif text-xl text-[#f4f1ea]">Ready to Start?</h3>
            <p className="text-xs text-white/75 font-light">
              Join practitioners worldwide with live interactive guidance adapted to your local time zone.
            </p>
            <button
              onClick={() => onOpenBookingModal(program.id)}
              className="w-full py-3.5 rounded-xl font-semibold text-xs tracking-wider uppercase text-[#121412] gold-gradient hover:opacity-95 shadow-lg transition-all"
            >
              Book {program.title}
            </button>
          </div>
        </div>
      </div>

      {/* Related Programs Section */}
      <section className="pt-12 border-t border-white/10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#94a388] block">
              Explore More
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#f4f1ea]">Related Programs</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedPrograms.map((relProg) => (
            <div
              key={relProg.id}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#c5a059]/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="h-40 rounded-xl overflow-hidden">
                  <img
                    src={relProg.image}
                    alt={relProg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif text-lg text-[#f4f1ea] group-hover:text-[#c5a059] transition-colors">
                  {relProg.title}
                </h3>
                <p className="text-xs text-white/70 line-clamp-2 font-light">
                  {relProg.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#c5a059]">${relProg.groupPrice} / class</span>
                <button
                  onClick={() => onSelectProgram(relProg.id)}
                  className="text-xs text-white/80 hover:text-white flex items-center gap-1 font-medium"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#c5a059]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
