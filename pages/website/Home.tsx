import HeroSection from '../../components/website/HeroSection';
import ServicesSection from '../../components/website/ServicesSection';
import AboutSection from '../../components/website/AboutSection';
import SpecialistsSection from '../../components/website/SpecialistsSection';
import WhyChooseUsSection from '../../components/website/WhyChooseUsSection';
import AppointmentSection from '../../components/website/AppointmentSection';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <SpecialistsSection />
      <WhyChooseUsSection />
      <AppointmentSection />
    </div>
  );
};

export default Home;
