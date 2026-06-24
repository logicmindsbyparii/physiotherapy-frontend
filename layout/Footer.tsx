import { Link } from 'react-router-dom';
import { Activity, Mail, Phone, MapPin, Globe, MessageCircle, Share2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-white">
              <Activity className="h-8 w-8 text-sky-500" />
              <span className="text-2xl font-bold tracking-tight">PhysioCare</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Luxury care, smarter recovery, modern rehabilitation. Providing world-class physiotherapy and wellness services.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Share2 className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {['Home', 'About Us', 'Our Specialists', 'Testimonials', 'Blog', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-6">Our Services</h3>
            <ul className="space-y-3">
              {['Sports Injury Rehab', 'Spine Therapy', 'Posture Correction', 'Manual Therapy', 'Home Visit Therapy'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-sky-500 shrink-0" />
                <span className="text-sm">123 Wellness Avenue, Premium District, New York, NY 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-sky-500 shrink-0" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-sky-500 shrink-0" />
                <span className="text-sm">hello@physiocare.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} PhysioCare. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
