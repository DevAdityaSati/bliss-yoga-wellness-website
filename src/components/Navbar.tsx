import { useState, useEffect } from 'react';
import { Leaf, Menu, X, ArrowRight, Sparkles, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NavigationPage } from '../types';

interface NavbarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage, sectionId?: string) => void;
  onOpenBookingModal: () => void;
}

export default function Navbar({ currentPage, onNavigate, onOpenBookingModal }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { label: string; page: NavigationPage; sectionId?: string }[] = [
    { label: 'Home', page: 'home' },
    { label: 'About', page: 'about' },
    { label: 'Programs', page: 'programs' },
    { label: 'Pricing', page: 'pricing' },
    { label: 'Testimonials', page: 'testimonials' },
    { label: 'FAQ', page: 'faq' },
  ];

  const handleNavClick = (page: NavigationPage, sectionId?: string) => {
    setIsMobileMenuOpen(false);
    if (page === 'book') {
      onOpenBookingModal();
      return;
    }
    if (page === 'contact') {
      onNavigate('home', 'cta-section');
      return;
    }
    onNavigate(page, sectionId);
  };

  return (
    <header
      id="global-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'glass-nav py-3 shadow-2xl'
          : 'bg-gradient-to-b from-[#121412]/95 via-[#121412]/70 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo & Name */}
          <button
            onClick={() => handleNavClick('home')}
            className="group flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a059] rounded-xl p-1"
            aria-label="Bliss Yoga & Wellness Home"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#1e221d] to-[#121412] border border-[#c5a059]/40 shadow-md group-hover:scale-105 transition-transform duration-300">
              <Leaf className="w-5 h-5 text-[#94a388] transform -rotate-12 group-hover:rotate-0 transition-transform duration-300" />
              <Sparkles className="w-2.5 h-2.5 text-[#c5a059] absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#f4f1ea] block leading-none">
                Bliss Yoga <span className="text-[#c5a059] font-normal">&</span> Wellness
              </span>
              <span className="text-[10px] tracking-widest uppercase font-medium text-[#94a388] block mt-0.5">
                Worldwide Online Studio
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1.5 rounded-full border border-white/10 shadow-lg backdrop-blur-md">
            {navItems.map((item) => {
              const isActive =
                currentPage === item.page &&
                (!item.sectionId || (item.sectionId && currentPage === 'home'));

              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.page, item.sectionId)}
                  className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-300 relative ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-white/70 hover:text-[#c5a059] hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-[#c5a059]/20 rounded-full -z-10 border border-[#c5a059]/40 shadow-xs"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* CTA Button & Mobile Hamburger */}
          <div className="flex items-center gap-2.5 sm:gap-3 md:gap-3.5 ml-2">
            <button
              onClick={() => onNavigate('student-dashboard')}
              className="px-3.5 py-2 rounded-full text-xs font-semibold text-[#c5a059] hover:text-white bg-[#c5a059]/10 border border-[#c5a059]/30 hover:bg-[#c5a059]/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Student Portal"
            >
              <User className="w-3.5 h-3.5 text-[#c5a059]" />
              <span className="hidden sm:inline">Student</span>
            </button>

            <button
              onClick={onOpenBookingModal}
              className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#121412] gold-gradient gold-gradient-hover shadow-lg shadow-[#c5a059]/20 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Book Session</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#121412]" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-2xl bg-white/10 text-white border border-white/15 hover:bg-white/20 transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden border-b border-white/10 bg-[#121412]/98 backdrop-blur-2xl overflow-hidden shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs uppercase font-semibold tracking-widest text-[#c5a059]">
                  Menu
                </span>
                <span className="text-xs text-[#94a388] font-medium bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                  Online Studio
                </span>
              </div>
              {navItems.map((item, idx) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleNavClick(item.page, item.sectionId)}
                  className="flex items-center justify-between py-3 px-4 rounded-xl text-left font-serif text-lg text-[#f4f1ea] hover:bg-white/5 hover:text-[#c5a059] transition-colors"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-4 h-4 text-[#c5a059]" />
                </motion.button>
              ))}
              <div className="pt-3 mt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenBookingModal();
                  }}
                  className="w-full py-3.5 rounded-xl font-semibold text-xs tracking-wider uppercase text-center text-[#121412] gold-gradient shadow-md flex items-center justify-center gap-2"
                >
                  <span>Book Your Online Session</span>
                  <ArrowRight className="w-4 h-4 text-[#121412]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
