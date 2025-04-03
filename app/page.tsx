import HeroSection from '../components/HeroSection';
import PricingSection from '../components/PricingSection';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <main className="flex-1 w-full">
        <HeroSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
