export default function WhenSection() {
  return (
    <section id="when" className="py-10 md:py-12 text-burgundy text-center">
      <div className="max-w-3xl mx-auto px-6">
        <p className="font-body italic text-burgundy/40 text-xs uppercase tracking-[0.3em] mb-6">
          Alături ne vor fi
        </p>

        {/* Parents — two columns */}
        <div className="grid grid-cols-2 gap-6 md:gap-16 mb-6">
          <div>
            <p className="text-gold text-xs uppercase tracking-[0.25em] font-body mb-2">
              Părinții Miresei
            </p>
            <p className="font-heading text-base md:text-lg">Ilie Șiclovan</p>
            <p className="font-heading text-base md:text-lg">Elisabeta Șiclovan</p>
          </div>
          <div>
            <p className="text-gold text-xs uppercase tracking-[0.25em] font-body mb-2">
              Părinții Mirelui
            </p>
            <p className="font-heading text-base md:text-lg">Nicolae Stoian</p>
            <p className="font-heading text-base md:text-lg">Iuliana Stoian</p>
          </div>
        </div>

        <div className="thin-divider" />

        {/* Godparents */}
        <div className="my-6">
          <p className="text-gold text-xs uppercase tracking-[0.25em] font-body mb-2">
            Nașii
          </p>
          <p className="font-heading text-lg md:text-xl">
            Matei Liberis &amp; Ioana Liberis
          </p>
        </div>

        <div className="thin-divider" />
      </div>
    </section>
  );
}
