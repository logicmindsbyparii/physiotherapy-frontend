import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, FileText, CheckCircle2, Activity } from 'lucide-react';

const AppointmentSection = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => setSubmitted(true), 1000);
  };

  return (
    <section id="book" className="py-24 bg-sky-50 relative">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Info Side */}
          <div className="bg-slate-900 text-white p-12 lg:w-2/5 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1932&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">Book Your Session</h3>
              <p className="text-slate-300 mb-8 leading-relaxed">
                Take the first step towards recovery. Schedule a consultation with our premium specialists today.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Call Us Directly</p>
                    <p className="font-medium">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Email Address</p>
                    <p className="font-medium">appointments@physiocare.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Side */}
          <div className="p-12 lg:w-3/5">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12"
              >
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900">Request Sent Successfully!</h4>
                <p className="text-slate-600 max-w-sm">
                  We've received your appointment request. Our reception team will contact you shortly via WhatsApp to confirm your slot.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-2 bg-slate-100 text-slate-700 rounded-full font-medium hover:bg-slate-200 transition-colors"
                >
                  Book Another Session
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><User className="w-4 h-4"/> Full Name</label>
                    <input required type="text" placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Phone className="w-4 h-4"/> Phone Number</label>
                    <input required type="tel" placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Activity className="w-4 h-4"/> Select Service</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all bg-white">
                      <option value="">Choose a service...</option>
                      <option value="sports">Sports Injury Rehab</option>
                      <option value="spine">Spine Therapy</option>
                      <option value="neuro">Neurological Rehab</option>
                      <option value="general">General Consultation</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><User className="w-4 h-4"/> Select Therapist</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all bg-white">
                      <option value="">Any available...</option>
                      <option value="sarah">Dr. Sarah Jenkins</option>
                      <option value="michael">Dr. Michael Chen</option>
                      <option value="emily">Dr. Emily Carter</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><CalendarIcon className="w-4 h-4"/> Preferred Date</label>
                    <input required type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Clock className="w-4 h-4"/> Preferred Time</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all bg-white">
                      <option value="">Morning (9AM - 12PM)</option>
                      <option value="">Afternoon (12PM - 4PM)</option>
                      <option value="">Evening (4PM - 8PM)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><FileText className="w-4 h-4"/> Additional Notes</label>
                  <textarea rows={3} placeholder="Briefly describe your symptoms or reason for visit..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all resize-none"></textarea>
                </div>

                <button type="submit" className="w-full bg-sky-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-900 transition-colors duration-300 shadow-lg shadow-sky-200 flex items-center justify-center gap-2">
                  Request Appointment
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppointmentSection;
