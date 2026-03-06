import Image from "next/image";
import HeroSection from "@/components/HeroSection";
import WhenSection from "@/components/WhenSection";
import WhereSection from "@/components/WhereSection";
import RsvpForm from "@/components/RsvpForm";

export default function Home() {
  return (
    <main className="relative bg-white overflow-x-hidden">
      {/* Corner decorations */}
      <Image
        src="/images/corner-left.jpg"
        alt=""
        width={380}
        height={507}
        className="absolute top-0 left-0 w-28 sm:w-40 md:w-56 lg:w-72 pointer-events-none select-none"
        priority
      />
      {/* Top-right: mirror of corner-left */}
      <Image
        src="/images/corner-left.jpg"
        alt=""
        width={380}
        height={507}
        className="absolute top-0 right-0 w-28 sm:w-40 md:w-56 lg:w-72 pointer-events-none select-none"
        style={{ transform: "scaleX(-1)" }}
        priority
      />
      <Image
        src="/images/corner-bottom-right.jpg"
        alt=""
        width={380}
        height={507}
        className="absolute bottom-0 right-0 w-24 sm:w-36 md:w-48 lg:w-64 pointer-events-none select-none"
      />

      <div className="relative z-10">
        <HeroSection />
        <WhenSection />
        <WhereSection />
        <RsvpForm />

        <footer className="text-forest-green/70 text-center py-8 border-t border-gold/20">
          <p className="font-script text-3xl md:text-4xl text-gold mb-1">
            Cristina &amp; Andrei
          </p>
          <p className="text-sm font-heading tracking-wider text-forest-green/60">
            26 Septembrie 2026
          </p>
          <p className="text-xs mt-3 text-forest-green/40">
            Realizat cu dragoste pentru ziua noastră specială
          </p>
        </footer>
      </div>
    </main>
  );
}
