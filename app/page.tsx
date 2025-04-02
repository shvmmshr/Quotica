// import { Button } from "@/components/ui/button";
// import Link from "next/link";
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <main className="flex-1 w-full">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}
