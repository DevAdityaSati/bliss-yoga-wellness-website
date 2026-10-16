import { motion } from 'motion/react';
import { Award, Users, Sparkles, Globe, HeartHandshake } from 'lucide-react';
import { TRUST_STATS } from '../../data/content';

export default function TrustSection() {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Award':
        return <Award className="w-6 h-6 text-[#c5a059]" />;
      case 'Users':
        return <Users className="w-6 h-6 text-[#c5a059]" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-[#c5a059]" />;
      case 'Globe':
        return <Globe className="w-6 h-6 text-[#c5a059]" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 text-[#c5a059]" />;
      default:
        return <Award className="w-6 h-6 text-[#c5a059]" />;
    }
  };

  return (
    <section id="trust-section" className="py-20 relative z-10 bg-[#121412]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs uppercase font-semibold tracking-widest text-[#c5a059]">
            Proven Excellence & Trust
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#f4f1ea]">
            Guiding Your Journey with <span className="italic text-[#94a388]">Certified Experience</span>
          </h2>
          <div className="w-12 h-0.5 bg-[#c5a059] mx-auto rounded-full mt-2" />
        </div>

        {/* 5 Animated Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {TRUST_STATS.map((stat, idx) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="glass-card rounded-3xl p-6 relative overflow-hidden border border-white/10 hover:border-[#c5a059]/40 transition-all duration-300 group flex flex-col justify-between"
            >
              {/* Background Subtle Gradient Glow */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#2a2e26] rounded-full blur-xl group-hover:bg-[#c5a059]/20 transition-colors duration-500" />

              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:bg-[#c5a059] group-hover:text-[#121412] transition-colors duration-300">
                  <div className="group-hover:text-[#121412] transition-colors">
                    {getIcon(stat.iconName)}
                  </div>
                </div>

                <div className="font-serif text-3xl sm:text-4xl font-semibold text-[#c5a059] tracking-tight mb-1">
                  {stat.value}
                </div>

                <h3 className="font-serif text-base font-medium text-[#f4f1ea] mb-2">
                  {stat.label}
                </h3>
              </div>

              <p className="text-xs text-white/50 leading-relaxed border-t border-white/10 pt-3 mt-2">
                {stat.subtext}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
