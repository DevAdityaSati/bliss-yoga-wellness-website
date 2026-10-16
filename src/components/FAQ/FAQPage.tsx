import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, Search, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { FAQS } from '../../data/content';

interface FAQPageProps {
  onOpenBookingModal: () => void;
}

export default function FAQPage({ onOpenBookingModal }: FAQPageProps) {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'General', 'Practice', 'Online Experience', 'Preparation', 'Booking'];

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* Page Header */}
      <section className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-[#c5a059]/30 text-[#c5a059] text-xs font-semibold tracking-wider uppercase backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Clear Guidance & Support</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#f4f1ea]"
        >
          Frequently Asked <span className="italic text-[#c5a059]">Questions</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg text-white/80 font-light leading-relaxed max-w-2xl mx-auto"
        >
          Find clear, helpful answers regarding our live online yoga studio, global time zone schedules,
          equipment recommendations, and class options.
        </motion.p>
      </section>

      {/* Search & Category Filter Bar */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="w-4 h-4 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-[#f4f1ea] placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#c5a059] backdrop-blur-md transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-[#c5a059] text-[#121412] font-semibold shadow-md'
                  : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => {
            const isOpen = openId === faq.id;
            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-white/[0.06] border-[#c5a059]/50 shadow-xl'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-serif text-base sm:text-lg text-[#f4f1ea] hover:text-[#c5a059] transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className={`w-5 h-5 shrink-0 ${isOpen ? 'text-[#c5a059]' : 'text-white/40'}`} />
                    <span>{faq.question}</span>
                  </span>
                  <div className={`p-1.5 rounded-full bg-white/5 border border-white/10 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 bg-[#c5a059]/20 text-[#c5a059]' : 'text-white/60'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="px-6 pb-6 pt-2 text-sm text-white/80 leading-relaxed font-light border-t border-white/5"
                    >
                      <p>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12 text-white/60 text-sm font-light">
            No questions found matching your search term.
          </div>
        )}
      </div>

      {/* Still Have Questions Box */}
      <section className="p-8 rounded-3xl bg-gradient-to-br from-[#1e221d] via-[#151815] to-[#121412] border border-[#c5a059]/30 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center mx-auto text-[#c5a059]">
          <MessageCircle className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-2xl text-[#f4f1ea]">Have a Specific Question?</h3>
        <p className="text-xs sm:text-sm text-white/75 max-w-lg mx-auto font-light">
          We are here to help you select the ideal class for your health goals or schedule needs. Feel free to reach out anytime.
        </p>
        <div className="pt-2">
          <button
            onClick={onOpenBookingModal}
            className="px-8 py-3.5 rounded-2xl font-semibold text-xs tracking-wider uppercase text-[#121412] gold-gradient hover:opacity-95 shadow-xl transition-all inline-flex items-center gap-2"
          >
            <span>Book a Session & Ask Questions</span>
            <ArrowRight className="w-4 h-4 text-[#121412]" />
          </button>
        </div>
      </section>
    </div>
  );
}
