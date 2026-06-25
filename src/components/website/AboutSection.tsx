import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <img 
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop" 
              alt="Modern Clinic" 
              className="rounded-2xl shadow-2xl z-10 relative"
            />
            <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-2xl shadow-xl z-20 max-w-xs hidden md:block">
              <p className="text-4xl font-bold text-sky-600 mb-2">15+</p>
              <p className="text-slate-600 font-medium text-sm">Years of excellence in advanced physiotherapy care.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-sm font-bold tracking-wider text-sky-600 uppercase mb-3">About PhysioCare</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Recovery-centered care in a luxury environment.</h3>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              Our philosophy combines advanced medical science with a premium wellness experience. We utilize cutting-edge rehabilitation equipment and personalized treatment plans to ensure a smarter, faster recovery.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                'Personalized treatment plans tailored to you',
                'Advanced rehabilitation equipment & technology',
                'Holistic approach to health and wellness',
                'Expert team of certified specialists'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-sky-500 shrink-0" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
            <a href="#specialists" className="inline-flex items-center justify-center bg-slate-900 text-white px-8 py-4 rounded-full text-base font-medium hover:bg-sky-600 transition-colors duration-300">
              Meet Our Team
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
