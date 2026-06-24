import { motion } from 'framer-motion';
import { Globe, MessageCircle, Mail } from 'lucide-react';

const specialists = [
  {
    name: 'Dr. Sarah Jenkins',
    role: 'Lead Physiotherapist',
    exp: '15+ Years Exp.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop',
    cert: 'PhD in Sports Rehabilitation'
  },
  {
    name: 'Dr. Michael Chen',
    role: 'Orthopedic Specialist',
    exp: '12+ Years Exp.',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop',
    cert: 'MSc in Orthopedic Medicine'
  },
  {
    name: 'Dr. Emily Carter',
    role: 'Neurological Therapist',
    exp: '10+ Years Exp.',
    image: 'https://images.unsplash.com/photo-1594824432258-f7b57b12ec7d?q=80&w=2070&auto=format&fit=crop',
    cert: 'Specialist in Neuro Rehab'
  }
];

const SpecialistsSection = () => {
  return (
    <section id="specialists" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-wider text-sky-600 uppercase mb-3">Our Experts</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">World-Class Specialists</h3>
          <p className="text-lg text-slate-600">
            Meet our team of highly certified experts dedicated to your complete recovery and holistic wellness.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {specialists.map((spec, idx) => (
            <motion.div
              key={spec.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <img 
                  src={spec.image} 
                  alt={spec.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 gap-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-sky-500 transition-colors"><Globe className="w-5 h-5" /></a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-sky-500 transition-colors"><MessageCircle className="w-5 h-5" /></a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-sky-500 transition-colors"><Mail className="w-5 h-5" /></a>
                </div>
              </div>
              <div className="p-6 text-center">
                <h4 className="text-xl font-bold text-slate-900 mb-1">{spec.name}</h4>
                <p className="text-sky-600 font-medium text-sm mb-3">{spec.role}</p>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-6">
                  <span className="bg-slate-200 px-2 py-1 rounded">{spec.exp}</span>
                  <span className="bg-slate-200 px-2 py-1 rounded">{spec.cert}</span>
                </div>
                <a href="#book" className="block w-full py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors duration-300">
                  Book Appointment
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialistsSection;
