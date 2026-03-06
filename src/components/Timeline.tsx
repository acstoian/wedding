const events = [
  {
    time: "16:00",
    title: "Ceremonia Religioasă",
    description: "Biserica — Ceremonia de cununie religioasă",
    icon: "⛪",
  },
  {
    time: "18:00",
    title: "Recepția",
    description: "Cocktail de bun venit și aperitive",
    icon: "🥂",
  },
  {
    time: "19:00",
    title: "Cina Festivă",
    description: "Cină servită și discursuri",
    icon: "🍽️",
  },
  {
    time: "21:00",
    title: "Primul Dans",
    description: "Primul dans al mirilor, urmat de petrecere",
    icon: "💃",
  },
  {
    time: "22:00",
    title: "Petrecerea",
    description: "Muzică, dans și distracție până în zori",
    icon: "🎶",
  },
];

export default function Timeline() {
  return (
    <section className="py-20 bg-cream">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-heading text-burgundy text-center mb-16">
          Programul Zilei
        </h2>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gold/40 -translate-x-1/2" />

          {events.map((event, idx) => (
            <div
              key={idx}
              className={`relative flex items-start mb-12 ${
                idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              {/* Dot on the line */}
              <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-gold rounded-full border-4 border-cream -translate-x-1/2 z-10" />

              {/* Content card */}
              <div
                className={`ml-16 md:ml-0 md:w-5/12 ${
                  idx % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12 md:ml-auto"
                }`}
              >
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gold/10 hover:shadow-md transition-shadow">
                  <div className="text-2xl mb-2">{event.icon}</div>
                  <div className="text-gold font-heading text-lg mb-1">
                    {event.time}
                  </div>
                  <h3 className="text-xl font-heading text-burgundy mb-2">
                    {event.title}
                  </h3>
                  <p className="text-sm text-burgundy/60">{event.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
