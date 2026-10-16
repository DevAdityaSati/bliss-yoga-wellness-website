import { motion } from 'motion/react';
import { Check, Sparkles, Users, User, Clock, Globe, ArrowRight, ShieldCheck } from 'lucide-react';

interface PricingPageProps {
  onOpenBookingModal: (programId?: string) => void;
}

export default function PricingPage({ onOpenBookingModal }: PricingPageProps) {
  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-[#c5a059]/30 text-[#c5a059] text-xs font-semibold tracking-wider uppercase backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Straightforward & Accessible</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#f4f1ea]"
        >
          Simple <span className="italic text-[#c5a059]">Transparent Pricing</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg text-white/80 font-light leading-relaxed max-w-2xl mx-auto"
        >
          Invest in your lifelong health and inner balance with clear, flat-rate pricing for live
          interactive online yoga instruction across all global time zones.
        </motion.p>
      </section>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
        {/* Card One: Group Classes */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -6 }}
          className="rounded-3xl bg-white/[0.03] border border-white/10 p-8 sm:p-10 backdrop-blur-xl hover:border-white/25 transition-all duration-300 flex flex-col justify-between space-y-8 shadow-2xl relative overflow-hidden"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[#94a388]">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-white/60 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                Interactive Group
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-3xl text-[#f4f1ea] font-medium">Group Classes</h2>
              <p className="text-xs text-white/70 font-light">
                Small intimate group classes with live verbal guidance and posture feedback.
              </p>
            </div>

            <div className="flex items-baseline gap-2 pt-2 border-t border-white/10">
              <span className="text-5xl font-bold font-serif text-[#f4f1ea]">$20</span>
              <div className="text-xs text-white/60">
                <span className="block font-medium text-[#f4f1ea]">Per Class</span>
                <span className="block text-[11px] font-light">60 Minutes Duration</span>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#94a388] block">
                Included Features
              </span>
              <ul className="space-y-3 text-sm text-white/85 font-light">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#94a388]/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#94a388]" />
                  </div>
                  <span>Live Online Class</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#94a388]/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#94a388]" />
                  </div>
                  <span>Professional Guidance</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#94a388]/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#94a388]" />
                  </div>
                  <span>Interactive Sessions</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#94a388]/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#94a388]" />
                  </div>
                  <span>Suitable For All Levels</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => onOpenBookingModal()}
            className="w-full py-4 rounded-2xl font-semibold text-xs tracking-wider uppercase text-[#f4f1ea] bg-white/10 hover:bg-white/15 border border-white/20 transition-all shadow-lg flex items-center justify-center gap-2 group"
          >
            <span>Book Group Session</span>
            <ArrowRight className="w-4 h-4 text-[#94a388] group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Card Two: Private Session */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          whileHover={{ y: -6 }}
          className="rounded-3xl bg-gradient-to-b from-[#1e221d] via-[#151815] to-[#121412] border-2 border-[#c5a059]/60 p-8 sm:p-10 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between space-y-8 shadow-2xl relative overflow-hidden"
        >
          {/* Most Popular Badge */}
          <div className="absolute top-5 right-6 px-3.5 py-1 rounded-full gold-gradient text-[#121412] font-semibold text-[10px] uppercase tracking-wider shadow-md">
            Most Popular
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#c5a059]">
                <User className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-3xl text-[#f4f1ea] font-medium">Private Session</h2>
              <p className="text-xs text-white/70 font-light">
                Tailored 1-on-1 yoga instruction focused entirely on your individual body and health goals.
              </p>
            </div>

            <div className="flex items-baseline gap-2 pt-2 border-t border-white/10">
              <span className="text-5xl font-bold font-serif text-[#c5a059]">$30</span>
              <div className="text-xs text-white/60">
                <span className="block font-medium text-[#f4f1ea]">Per Session</span>
                <span className="block text-[11px] font-light">60 Minutes Duration</span>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#c5a059] block">
                Included Features
              </span>
              <ul className="space-y-3 text-sm text-white/85 font-light">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#c5a059]/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#c5a059]" />
                  </div>
                  <span>One-to-One Guidance</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#c5a059]/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#c5a059]" />
                  </div>
                  <span>Personalized Practice</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#c5a059]/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#c5a059]" />
                  </div>
                  <span>Customized Progression</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#c5a059]/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#c5a059]" />
                  </div>
                  <span>Flexible Scheduling</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => onOpenBookingModal()}
            className="w-full py-4 rounded-2xl font-semibold text-xs tracking-wider uppercase text-[#121412] gold-gradient gold-gradient-hover shadow-xl flex items-center justify-center gap-2 transition-all"
          >
            <span>Book Private Session</span>
            <ArrowRight className="w-4 h-4 text-[#121412]" />
          </button>
        </motion.div>
      </div>

      {/* Global Guarantee Banner */}
      <section className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#c5a059] shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-[#f4f1ea]">Global Local Timezone Sync</h3>
            <p className="text-xs text-white/70 font-light">
              Sessions automatically adapt to your location worldwide. Live HD video with real-time feedback.
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenBookingModal()}
          className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-[#f4f1ea] font-medium border border-white/15 transition-all shrink-0"
        >
          Check Available Slots
        </button>
      </section>
    </div>
  );
}
