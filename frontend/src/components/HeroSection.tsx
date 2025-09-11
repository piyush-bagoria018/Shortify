// HeroSection.tsx
"use client";
import { motion } from "framer-motion";

interface HeroSectionProps {
  compact?: boolean;
}

export default function HeroSection({ compact = false }: HeroSectionProps) {
  return (
    <div className="relative w-full">
      <section
        className={`${
          compact ? "mt-4" : "mt-12"
        } flex flex-col items-center justify-center ${
          compact ? "min-h-[12vh]" : "min-h-[22vh]"
        } transition-colors duration-300`}
      >
        {/* Animated Gradient Headline */}
        <motion.h1
          className={`pb-3.5 ${
            compact
              ? "text-3xl sm:text-4xl md:text-5xl"
              : "text-4xl sm:text-5xl md:text-6xl"
          } font-extrabold text-center bg-gradient-to-r from-brandPink via-brandBlue to-brandPink bg-clip-text text-transparent animate-gradient-x ${
            compact ? "mb-2" : "mb-3"
          }`}
          style={{ backgroundSize: "200% 200%" }} // ensures animation works
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          Shorten Your Loooong Links :)
        </motion.h1>

        {/* Description */}
        <motion.p
          className={`${
            compact ? "text-base" : "text-lg"
          } text-center max-w-xl ${
            compact ? "mb-4" : "mb-8"
          } text-gray-300 dark:text-gray-400`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          Shortify is an efficient and easy-to-use URL shortening service that
          streamlines your online experience.
        </motion.p>
      </section>
    </div>
  );
}
