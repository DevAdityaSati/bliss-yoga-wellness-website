import { Leaf, Instagram, Mail, MessageCircle, Heart, ShieldCheck } from 'lucide-react';
import { NavigationPage } from '../types';

interface FooterProps {
  onNavigate: (page: NavigationPage, sectionId?: string) => void;
  onOpenBookingModal: () => void;
}

export default function Footer({ onNavigate, onOpenBookingModal }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const quickLinks: { label: string; page: NavigationPage; sectionId?: string }[] = [
    { label: 'Home', page: 'home' },
    { label: 'About', page: 'about' },
    { label: 'Programs', page: 'programs' },
    { label: 'Pricing', page: 'pricing' },
    { label: 'Testimonials', page: 'testimonials' },
    { label: 'FAQ', page: 'faq' },
    { label: 'Book Session', page: 'book' },
    { label: 'Student Portal', page: 'student-dashboard' },
  ];

  const handleLinkClick = (page: NavigationPage, sectionId?: string) => {
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
    <footer id="global-footer" className="bg-[#0d0f0d] text-[#f4f1ea] relative z-10 pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1e221d] border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
                <Leaf className="w-5 h-5 transform -rotate-12 text-[#94a388]" />
              </div>
              <span className="font-serif text-2xl font-semibold text-[#f4f1ea] tracking-tight">
                Bliss Yoga <span className="text-[#c5a059] font-normal">&</span> Wellness
              </span>
            </div>

            <p className="font-serif text-lg italic text-[#c5a059] font-light">
              Move with Purpose. Live with Balance.
            </p>

            <p className="text-xs text-white/50 max-w-sm leading-relaxed font-light">
              Authentic online yoga studio welcoming students worldwide. Experience Hatha, Chair, Therapeutic Yoga, and Guided Meditation live from anywhere in the world.
            </p>

            {/* Social Icons */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://instagram.com/devv_aditya_09"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram @devv_aditya_09"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-[#121412] hover:bg-[#c5a059] transition-colors"
                title="Instagram: @devv_aditya_09"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/916398131637?text=Hello%20Bliss%20Yoga%20%26%20Wellness!"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp 6398131637"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-[#121412] hover:bg-[#25D366] transition-colors"
                title="WhatsApp: 6398131637"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="mailto:support@blissyoga.com"
                aria-label="Email Support"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-[#121412] hover:bg-[#c5a059] transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-4 space-y-4 px-2 sm:px-4">
            <h4 className="font-serif text-base text-[#c5a059] font-medium uppercase tracking-wider text-xs">
              Quick Navigation
            </h4>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs text-white/70">
              {quickLinks.map((link) => (
                <li key={link.label} className="py-0.5">
                  <button
                    onClick={() => handleLinkClick(link.page, link.sectionId)}
                    className="hover:text-[#c5a059] transition-colors inline-block text-left font-medium leading-relaxed"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio Hours & Regions */}
          <div className="md:col-span-3 space-y-3 text-xs text-white/70">
            <h4 className="font-serif text-base text-[#c5a059] font-medium uppercase tracking-wider text-xs">
              Online Studio
            </h4>
            <p className="leading-relaxed">
              Live interactive sessions scheduled seamlessly across all global time zones.
            </p>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/60">
              <p className="font-semibold text-[#f4f1ea] mb-1">Global Community:</p>
              <p>• 100% Live Online Classes</p>
              <p>• Automatic Time Zone Sync</p>
              <p>• Welcoming Students Worldwide</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-white/50 gap-4 pt-6 border-t border-white/10 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 leading-relaxed">
            <span>© {new Date().getFullYear()} Bliss Yoga & Wellness.</span>
            <span className="inline-flex items-center gap-1">
              <span>Crafted with</span>
              <Heart className="w-3.5 h-3.5 text-[#c5a059] fill-current inline-block" />
              <span>for mindful living.</span>
              <button
                onClick={() => handleLinkClick('admin-login')}
                className="p-1 rounded-md text-white/30 hover:text-[#c5a059] hover:bg-white/5 transition-all duration-300 cursor-pointer inline-flex items-center ml-0.5"
                title="Admin Portal"
                aria-label="Admin Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]/70 hover:text-[#c5a059] transition-colors" />
              </button>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
