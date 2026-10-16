import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Clock, Users, User, ArrowRight, Sparkles } from 'lucide-react';
import { ProgramItem } from '../types';

interface ProgramModalProps {
  program: ProgramItem | null;
  onClose: () => void;
  onBookProgram: (programId: string) => void;
}

export default function ProgramModal({ program, onClose, onBookProgram }: ProgramModalProps) {
  if (!program) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-[#FAF9F5] rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#7C9070]/20 z-10 my-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#222522] hover:bg-white transition-colors border border-[#7C9070]/20 shadow-sm"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header Image */}
          <div className="relative h-64 overflow-hidden">
            <img
              src={program.image}
              alt={program.title}
              className="w-full h-full object-cover filter brightness-[0.95]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F5] via-transparent to-black/30" />
            
            <div className="absolute bottom-4 left-6 right-6">
              <span className="text-xs uppercase font-semibold tracking-wider px-3 py-1 rounded-full bg-[#5F7153] text-white inline-block mb-2">
                Online Program Preview
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#222522] font-semibold">
                {program.title}
              </h2>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 sm:p-8 space-y-6">
            <p className="text-sm sm:text-base text-[#4A5049] leading-relaxed">
              {program.description}
            </p>

            {/* Recommended For */}
            <div className="p-4 rounded-2xl bg-[#E9EFE6] border border-[#7C9070]/20 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5F7153]">
                Ideal For
              </span>
              <p className="text-xs text-[#222522] font-medium">{program.recommendedFor}</p>
            </div>

            {/* Core Benefits Grid */}
            <div className="space-y-3">
              <h4 className="font-serif text-base text-[#222522] font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                <span>Program Highlights</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {program.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-[#4A5049] bg-white p-2.5 rounded-xl border border-[#7C9070]/15">
                    <CheckCircle2 className="w-4 h-4 text-[#5F7153] shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Options */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-[#7C9070]/20 text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-xs text-[#7C9070]">
                  <Users className="w-3.5 h-3.5" />
                  <span>Group Class</span>
                </div>
                <div className="font-serif text-2xl font-bold text-[#222522]">
                  ${program.groupPrice}
                </div>
                <p className="text-[10px] text-[#6B7268]">per practitioner</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#7C9070]/20 text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-xs text-[#7C9070]">
                  <User className="w-3.5 h-3.5" />
                  <span>Private 1-on-1</span>
                </div>
                <div className="font-serif text-2xl font-bold text-[#222522]">
                  ${program.privatePrice}
                </div>
                <p className="text-[10px] text-[#6B7268]">personalized session</p>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  onClose();
                  onBookProgram(program.id);
                }}
                className="w-full py-4 rounded-full text-xs font-semibold tracking-wider uppercase text-white bg-gradient-to-r from-[#5F7153] to-[#4D5D41] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Book This Class Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
