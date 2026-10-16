import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Instagram, ArrowUp } from 'lucide-react';

export default function FloatingSocials() {
  const whatsappNumber = '916398131637';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello%20Bliss%20Yoga%20%26%20Wellness!%20I%20would%20like%20to%20book%20a%20yoga%20class.`;
  const instagramUrl = 'https://instagram.com/devv_aditya_09';

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      if (scrollY > 150) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* FLOATING BACK TO TOP BUTTON - FIXED BOTTOM LEFT */}
      <div className="fixed bottom-5 left-5 z-50 pointer-events-auto">
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              key="scroll-to-top-left-btn"
              onClick={scrollToTop}
              initial={{ opacity: 0, scale: 0.6, x: -15 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.6, x: -15 }}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#161a16]/85 backdrop-blur-md border border-[#c5a059]/40 text-[#c5a059] hover:bg-[#c5a059] hover:text-[#121412] hover:border-[#c5a059] shadow-lg hover:shadow-[#c5a059]/20 transition-all duration-300 cursor-pointer"
              aria-label="Scroll back to the top of the page"
              title="Back to Top"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />

              {/* Tooltip on hover */}
              <span className="absolute left-11 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#161a16]/95 border border-[#c5a059]/40 text-[10px] text-[#c5a059] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl pointer-events-none">
                Back to Top ⬆
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* FLOATING SOCIALS - FIXED BOTTOM RIGHT */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5 pointer-events-auto">
        {/* Floating Tag Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="px-3.5 py-1.5 rounded-2xl bg-[#161a16]/95 border border-[#c5a059]/40 text-[#c5a059] text-[11px] font-semibold tracking-wide shadow-2xl backdrop-blur-md flex items-center gap-1.5 animate-bounce"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>✨ book here</span>
        </motion.div>

        {/* Instagram Button */}
        <motion.a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.1, x: -3 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-xl hover:shadow-pink-500/30 transition-all duration-300"
          aria-label="Follow us on Instagram @devv_aditya_09"
        >
          {/* Glowing Pulse Ring for Instagram */}
          <span className="absolute inset-0 rounded-full bg-rose-500/50 animate-ping opacity-75" />

          <Instagram className="w-6 h-6 stroke-[2] relative z-10" />
          
          {/* Tooltip */}
          <span className="absolute right-14 px-3 py-1.5 rounded-xl bg-[#161a16]/95 border border-white/15 text-[11px] text-[#f4f1ea] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none flex items-center gap-1.5">
            <span>@devv_aditya_09</span>
            <span className="text-[#c5a059]">• Book Here</span>
          </span>
        </motion.a>

        {/* WhatsApp Button */}
        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.1, x: -3 }}
          whileTap={{ scale: 0.95 }}
          transition={{ delay: 0.1 }}
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] text-white shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
          aria-label="Chat with us on WhatsApp"
        >
          {/* Glowing Pulse Ring */}
          <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping opacity-75" />
          
          {/* WhatsApp Icon */}
          <svg
            className="w-6 h-6 fill-current relative z-10"
            viewBox="0 0 24 24"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>

          {/* Tooltip */}
          <span className="absolute right-14 px-3 py-1.5 rounded-xl bg-[#161a16]/95 border border-white/15 text-[11px] text-[#f4f1ea] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none flex items-center gap-1.5">
            <span>Book via WhatsApp (6398131637)</span>
          </span>
        </motion.a>
      </div>
    </>
  );
}
