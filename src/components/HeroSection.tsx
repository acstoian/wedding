import Countdown from "./Countdown";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="text-center px-6 pt-16 sm:pt-20 pb-8 text-burgundy"
    >
      {/* Invitation opener */}
      <p className="font-body italic text-burgundy/40 text-xs sm:text-sm mb-4 tracking-wide">
        Cu inimile pline de bucurie, vă invităm la nunta noastră
      </p>

      {/* Couple names */}
      <h1 className="font-script text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-burgundy leading-tight">
        Cristina
      </h1>
      <div className="font-body text-gold text-xl sm:text-2xl my-1 tracking-widest">
        &amp;
      </div>
      <h1 className="font-script text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-burgundy leading-tight">
        Andrei
      </h1>

      {/* Date */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6 mb-1 px-2">
        <div className="flex-1 h-px bg-gold/40" />
        <span className="text-[10px] sm:text-xs font-body uppercase tracking-[0.2em] sm:tracking-[0.3em] text-burgundy/50 whitespace-nowrap">Sâmbătă</span>
        <div className="flex-1 h-px bg-gold/40" />
        <span className="font-heading text-4xl sm:text-5xl md:text-6xl text-forest-green font-light">26</span>
        <div className="flex-1 h-px bg-gold/40" />
        <span className="text-[10px] sm:text-xs font-body uppercase tracking-[0.2em] sm:tracking-[0.3em] text-burgundy/50 whitespace-nowrap">Septembrie</span>
        <div className="flex-1 h-px bg-gold/40" />
      </div>
      <p className="font-heading text-lg text-burgundy/40 tracking-widest mb-6">2026</p>

      {/* Countdown */}
      <Countdown />
    </section>
  );
}
