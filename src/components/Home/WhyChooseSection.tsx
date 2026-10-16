import { motion } from 'motion/react';
import {
  Compass,
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Calendar,
  Sun,
  Activity,
  Heart,
  Video,
} from 'lucide-react';
import { WHY_CHOOSE_FEATURES } from '../../data/content';

export default function WhyChooseSection() {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass':
        return <Compass className="w-5 h-5 text-[#c5a059]" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-[#c5a059]" />;
      case 'UserCheck':
        return <UserCheck className="w-5 h-5 text-[#c5a059]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-[#c5a059]" />;
      case 'Calendar':
        return <Calendar className="w-5 h-5 text-[#c5a059]" />;
      case 'Sun':
        return <Sun className="w-5 h-5 text-[#c5a059]" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-[#c5a059]" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-[#c5a059]" />;
      case 'Video':
        return <Video className="w-5 h-5 text-[#c5a059]" />;
      default:
        return <Compass className="w-5 h-5 text-[#c5a059]" />;
    }
  };

  return (
    <section id="why-choose" className="py-24 relative z-10 bg-[#121412]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase font-semibold tracking-widest text-[#c5a059]">
            The Bliss Difference
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#f4f1ea]">
            Why Practitioners Choose <span className="italic text-[#94a388]">Bliss Yoga</span>
          </h2>
          <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">
            Combining traditional yogic mindfulness with modern biomechanics and attentive live online coaching.
          </p>
          <div className="w-16 h-0.5 bg-[#c5a059] mx-auto rounded-full mt-3" />
        </div>

        {/* 9 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_CHOOSE_FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              whileHover={{ y: -5 }}
              className="glass-card rounded-3xl p-7 border border-white/10 hover:border-[#c5a059]/40 transition-all duration-300 shadow-xl group space-y-4"
            >
              <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#c5a059] group-hover:text-[#121412] transition-colors duration-300">
                <div className="group-hover:text-[#121412] transition-colors">
                  {getIcon(feature.iconName)}
                </div>
              </div>

              <h3 className="font-serif text-xl font-medium text-[#f4f1ea] tracking-tight">
                {feature.title}
              </h3>

              <p className="text-xs text-white/60 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
