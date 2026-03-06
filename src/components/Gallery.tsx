import Image from "next/image";

const GALLERY_IMAGES = [
  { src: "/images/gallery-bouquet.jpg", alt: "Buchet nupțial" },
  { src: "/images/gallery-table.jpg", alt: "Aranjament masă" },
  { src: "/images/gallery-venue.jpg", alt: "Locație" },
  { src: "/images/gallery-cake.jpg", alt: "Tort nupțial" },
  { src: "/images/gallery-rings.jpg", alt: "Verighete" },
  { src: "/images/floral-corner.jpg", alt: "Aranjament floral" },
];

export default function Gallery() {
  return (
    <section className="py-20 bg-cream">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-heading text-forest-green text-center mb-4">
          Galerie Foto
        </h2>
        <p className="text-center text-forest-green/60 mb-12 font-body">
          Momente speciale din povestea noastră
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {GALLERY_IMAGES.map((img, idx) => (
            <div
              key={idx}
              className="aspect-square rounded-xl overflow-hidden shadow-sm border border-gold/10 hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
