import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Users, Activity } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-slate-50">
      {/* Background with abstract shapes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-sky-50 rounded-bl-[100px] opacity-70"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 z-10 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              Premium Care & Rehabilitation
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
              Advanced Physiotherapy & <span className="text-sky-600">Rehabilitation</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-lg">
              Luxury care, smarter recovery, modern rehabilitation. Experience world-class treatment tailored to your unique needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#book" className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full text-base font-medium hover:bg-sky-600 transition-all duration-300 shadow-lg hover:shadow-sky-200">
                Book Appointment
                <ArrowRight className="w-5 h-5" />
              </a>
              <a href="#services" className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full text-base font-medium hover:bg-slate-50 transition-all duration-300">
                Explore Services
              </a>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-6 pt-8 border-t border-slate-200">
              <div>
                <p className="text-3xl font-bold text-slate-900 mb-1">15+</p>
                <p className="text-sm text-slate-500 font-medium">Years Experience</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 mb-1">10k+</p>
                <p className="text-sm text-slate-500 font-medium">Happy Patients</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 mb-1">98%</p>
                <p className="text-sm text-slate-500 font-medium">Recovery Rate</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:ml-auto"
          >
            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl z-10 w-full max-w-lg mx-auto">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173ff9e5ee5?q=80&w=2069&auto=format&fit=crop" 
                alt="Physiotherapy Treatment" 
                className="w-full h-auto object-cover object-center aspect-[4/5]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>

            {/* Floating Cards */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -left-12 top-1/4 glass p-4 rounded-2xl shadow-xl z-20 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Easy Booking</p>
                <p className="text-xs text-slate-500">Available Today</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -right-8 bottom-1/4 glass p-4 rounded-2xl shadow-xl z-20 flex items-center gap-4"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <img 
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white"
                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
                    alt="Patient"
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">10k+ Patients</p>
                <div className="flex text-yellow-400 text-xs">
                  ★ ★ ★ ★ ★
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
