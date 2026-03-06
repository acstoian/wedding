export default function CoupleCards() {
  return (
    <section className="py-16 md:py-24 bg-cream text-burgundy">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bride */}
          <div className="bg-white rounded-2xl border border-gold/20 p-8 text-center">
            <p className="text-gold text-sm uppercase tracking-[0.3em] font-body mb-3">
              Mireasa
            </p>
            <p className="text-burgundy/50 font-body text-sm mb-1">
              Familia [Numele de familie]
            </p>
            <h3 className="font-heading text-3xl md:text-4xl mb-4">Cristina</h3>
            <div className="thin-divider" />
            <p className="font-heading italic text-burgundy/60 mt-4 text-sm leading-relaxed">
              &ldquo;Cu inima plină de bucurie, abia aștept să împart această zi specială cu voi.&rdquo;
            </p>
          </div>

          {/* Groom */}
          <div className="bg-white rounded-2xl border border-gold/20 p-8 text-center">
            <p className="text-gold text-sm uppercase tracking-[0.3em] font-body mb-3">
              Mirele
            </p>
            <p className="text-burgundy/50 font-body text-sm mb-1">
              Familia [Numele de familie]
            </p>
            <h3 className="font-heading text-3xl md:text-4xl mb-4">Andrei</h3>
            <div className="thin-divider" />
            <p className="font-heading italic text-burgundy/60 mt-4 text-sm leading-relaxed">
              &ldquo;Vă mulțumim că sunteți parte din povestea noastră de dragoste.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
