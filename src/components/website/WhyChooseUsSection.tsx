import { motion } from 'framer-motion';
import { Award, HeartPulse, Microscope, Trophy, Fingerprint, Sparkles } from 'lucide-react';

const reasons = [
  { icon: Award, title: 'Certified Experts', desc: 'Internationally recognized therapists with advanced qualifications.' },
  { icon: Fingerprint, title: 'Personalized Care', desc: 'Every treatment plan is uniquely crafted for your body and goals.' },
  { icon: Microscope, title: 'Modern Equipment', desc: 'State-of-the-art rehabilitation tech for faster recovery.' },
  { icon: Trophy, title: 'Athlete Trusted', desc: 'The chosen clinic for professional athletes and sports teams.' },
  { icon: HeartPulse, title: 'Scientific Treatment', desc: 'Evidence-based methods that guarantee results.' },
  { icon: Sparkles, title: 'Holistic Wellness', desc: 'We treat the root cause, not just the symptoms.' },
];

const WhyChooseUsSection = () => {
  return (
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-sky-900/20 rounded-bl-[100px] opacity-70"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-wider text-sky-400 uppercase mb-3">The PhysioCare Difference</h2>
          <h3 className="text-3xl md:text-4xl font-bold mb-6">Why Choose Us?</h3>
          <p className="text-lg text-slate-300">
            We blend luxury healthcare with medical excellence to provide an unparalleled recovery experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, idx) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-dark p-8 rounded-2xl group hover:border-sky-500/50 transition-colors duration-300"
              >
                <div className="w-12 h-12 bg-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold mb-3">{reason.title}</h4>
                <p className="text-slate-400 leading-relaxed text-sm">{reason.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
