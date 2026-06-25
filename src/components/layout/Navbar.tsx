// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { , Activity } from 'lucide-react';
// import { motion } from 'framer-motion';

// const Navbar = () => {
//   const [isScrolled, setIsScrolled] = useState(false);
//   , setMobileMenuOpen] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 20);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const navLinks = [
//     { name: 'Home', path: '/' },
//     { name: 'About', path: '/#about' },
//     { name: 'Services', path: '/#services' },
//     { name: 'Specialists', path: '/#specialists' },
//     { name: 'Testimonials', path: '/#testimonials' },
//     { name: 'Contact', path: '/#contact' },
//   ];

//   return (
//     <motion.header
//       initial={{ y: -100 }}
//       animate={{ y: 0 }}
//       transition={{ duration: 0.5 }}
//       className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
//         isScrolled ? 'bg-white/90 backdrop-blur-md shadow-soft py-3' : 'bg-transparent py-5'
//       }`}
//     >
//       <div className="container mx-auto px-4 md:px-6">
//         <div className="flex items-center justify-between">
//           <Link to="/" className="flex items-center gap-2">
//             <Activity className="h-8 w-8 text-sky-600" />
//             <span className="text-xl font-bold tracking-tight text-slate-900">PhysioCare</span>
//           </Link>

//           {/* Desktop Nav */}
//           <nav className="hidden md:flex items-center gap-8">
//             {navLinks.map((link) => (
//               <a
//                 key={link.name}
//                 href={link.path}
//                 className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors"
//               >
//                 {link.name}
//               </a>
//             ))}
//             <a
//               href="#book"
//               className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-sky-600 transition-colors shadow-lg shadow-slate-200"
//             >
//               Book Appointment
//             </a>
//           </nav>

//           {/* Mobile Menu Toggle */}
//           <button
//             className="md:hidden p-2 text-slate-600"
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//           >
//             {mobileMenuOpen ? </> : <Menu />}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Nav */}
//       {mobileMenuOpen && (
//         <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-100 p-4 shadow-xl">
//           <div className="flex flex-col gap-4">
//             {navLinks.map((link) => (
//               <a
//                 key={link.name}
//                 href={link.path}
//                 className="text-base font-medium text-slate-700 p-2"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 {link.name}
//               </a>
//             ))}
//             <a
//               href="#book"
//               className="bg-slate-900 text-white text-center px-6 py-3 rounded-full text-sm font-medium"
//               onClick={() => setMobileMenuOpen(false)}
//             >
//               Book Appointment
//             </a>
//           </div>
//         </div>
//       )}
//     </motion.header>
//   );
// };

// export default Navbar;


import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // add useLocation
import { Activity, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section (only works on homepage)
  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      // If not on homepage, navigate home first then scroll
      window.location.href = `/#${sectionId}`;
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', scrollId: null },
    { name: 'About', path: null, scrollId: 'about' },
    { name: 'Services', path: null, scrollId: 'services' },
    { name: 'Specialists', path: null, scrollId: 'specialists' },
    { name: 'Testimonials', path: null, scrollId: 'testimonials' },
    { name: 'Contact', path: null, scrollId: 'contact' },
  ];

  const handleNavClick = (link: typeof navLinks[0]) => {
    if (link.path) {
      // Navigate to a different page
      window.location.href = link.path; // or use useNavigate but keep simple
    } else if (link.scrollId) {
      scrollToSection(link.scrollId);
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-soft py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-sky-600" />
            <span className="text-xl font-bold tracking-tight text-slate-900">PhysioCare</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link)}
                className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors"
              >
                {link.name}
              </button>
            ))}
            <button
              onClick={() => scrollToSection('book')}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-sky-600 transition-colors shadow-lg shadow-slate-200"
            >
              Book Appointment
            </button>
          </nav>

          {/* Mobile menu toggle & mobile nav similar changes */}
          {/* ... rest remains same but replace <a> with <button> and use handleNavClick */}
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;