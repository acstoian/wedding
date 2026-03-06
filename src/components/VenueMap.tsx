export default function VenueMap() {
  return (
    <section className="py-20 bg-cream-dark">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-heading text-burgundy text-center mb-4">
          Locația
        </h2>
        <p className="text-center text-burgundy/60 mb-12 font-body">
          Numele Localului — Adresa completă, Oraș
        </p>

        <div className="rounded-2xl overflow-hidden shadow-lg border border-gold/10">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2848.889!2d26.1025!3d44.4268!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDTCsDI1JzM2LjUiTiAyNsKwMDYnMDkuMCJF!5e0!3m2!1sro!2sro!4v1!5m2!1sro!2sro"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Locația nunții"
          />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gold/10">
            <h3 className="font-heading text-xl text-burgundy mb-2">
              ⛪ Ceremonia
            </h3>
            <p className="text-burgundy/60 text-sm">
              Biserica — Adresa bisericii
            </p>
            <p className="text-gold font-heading mt-2">Ora 16:00</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gold/10">
            <h3 className="font-heading text-xl text-burgundy mb-2">
              🥂 Recepția
            </h3>
            <p className="text-burgundy/60 text-sm">
              Restaurantul — Adresa restaurantului
            </p>
            <p className="text-gold font-heading mt-2">Ora 18:00</p>
          </div>
        </div>
      </div>
    </section>
  );
}
