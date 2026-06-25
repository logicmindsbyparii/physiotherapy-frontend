import { motion } from 'framer-motion';
import { ArrowRight, Activity, Bone, Waves, Heart, UserPlus, Flame, Home, Stethoscope } from 'lucide-react';

const services = [
  { icon: Activity, title: 'Sports Injury Rehab', desc: 'Advanced recovery for athletes.' },
  { icon: Bone, title: 'Spine Therapy', desc: 'Relief from back & neck pain.' },
  { icon: UserPlus, title: 'Posture Correction', desc: 'Ergonomic alignment solutions.' },
  { icon: Flame, title: 'Dry Needling', desc: 'Targeted muscle pain relief.' },
  { icon: Waves, title: 'Manual Therapy', desc: 'Hands-on joint & soft tissue care.' },
  { icon: Heart, title: 'Neurological Rehab', desc: 'Stroke & nerve recovery.' },
  { icon: Stethoscope, title: 'Orthopedic Rehab', desc: 'Post-surgery care & recovery.' },
  { icon: Home, title: 'Home Visit Therapy', desc: 'Premium care at your doorstep.' },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-wider text-sky-600 uppercase mb-3">Our Expertise</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Premium Rehabilitation Services</h3>
          <p className="text-lg text-slate-600">
            We offer advanced, evidence-based physiotherapy treatments tailored to your specific recovery goals in a luxury setting.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-8 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-sky-600 group-hover:text-white transition-colors duration-300">
                  <Icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h4>
                <p className="text-slate-600 mb-6">{service.desc}</p>
                <a href="#" className="inline-flex items-center text-sm font-semibold text-sky-600 group-hover:text-sky-700">
                  Learn more <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </a>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
