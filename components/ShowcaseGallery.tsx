"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";

type ShowcaseImage = {
  id: string;
  imageUrl: string;
  caption: string | null;
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ShowcaseGallery({ images }: { images: ShowcaseImage[] }) {
  if (images.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-4 rounded-full bg-brand" aria-hidden />
        <h2 className="font-serif text-lg font-semibold text-ink">Góc trưng bày</h2>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="columns-2 md:columns-3 gap-3 [column-fill:_balance]"
      >
        {images.map((img, i) => (
          <motion.div
            key={img.id}
            variants={item}
            className="relative mb-3 break-inside-avoid rounded-xl overflow-hidden group"
          >
            <div className={`relative w-full ${i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"}`}>
              <Image
                src={img.imageUrl}
                alt={img.caption || ""}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {img.caption && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <p className="text-white text-sm font-medium">{img.caption}</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
