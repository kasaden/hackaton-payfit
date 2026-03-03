"use client"; // Obligatoire pour l'interactivité

import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  Calculator,
  CheckCircle,
  Calendar,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button"; // Assurez-vous que ce chemin est correct

// Les données des fonctionnalités (sorties du composant pour la lisibilité)
const featureCardsData = [
  {
    icon: <Calculator className="w-6 h-6 text-[#0066CC]" />,
    title: "Génération de la paie",
    description:
      "Fiches de paie automatisées et mises à jour selon la convention collective.",
  },
  {
    icon: <CheckCircle className="w-6 h-6 text-[#0066CC]" />,
    title: "Déclarations sociales (DSN)",
    description:
      "Envoi automatique de vos déclarations à l'URSSAF et aux organismes.",
  },
  {
    icon: <Calendar className="w-6 h-6 text-[#0066CC]" />,
    title: "Congés & Absences",
    description:
      "Validation en un clic par les managers, impact direct sur la paie.",
  },
  {
    icon: <Receipt className="w-6 h-6 text-[#0066CC]" />,
    title: "Notes de frais",
    description:
      "Numérisation des reçus et remboursement direct sur la fiche de paie.",
  },
  // Ajoutons-en une 5ème pour bien voir l'effet carrousel
  {
    icon: <CheckCircle className="w-6 h-6 text-[#0066CC]" />,
    title: "Suivi du temps",
    description:
      "Feuilles de temps simplifiées pour les salariés et validation RH.",
  },
];

// Sous-composant pour les cartes fonctionnalités
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 border border-gray-200 rounded-xl hover:border-[#0066CC] transition-colors hover:shadow-sm group cursor-pointer h-full flex flex-col bg-white">
      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors shrink-0">
        {icon}
      </div>
      <h3 className="font-semibold text-lg text-[#152330] mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed flex-grow">
        {description}
      </p>
    </div>
  );
}

// COMPOSANT PRINCIPAL DU CARROUSEL
export function FeaturesCarousel() {
  // 1. Initialisation d'Embla avec options (loop: true pour l'illimité)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 768px)": { slidesToScroll: 2 },
      "(min-width: 1024px)": { slidesToScroll: 3 },
    },
  });

  // États pour gérer l'affichage des contrôles
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // Fonctions de navigation
  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );
  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi],
  );

  // Mise à jour des états quand le carrousel défile
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  // Initialisation et écouteurs d'événements
  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="mt-16 border-t border-gray-200 pt-12 relative overflow-hidden group">
      <h2 className="text-2xl font-bold text-[#152330] mb-8 text-center">
        Retrouvez toutes nos fonctionnalités
      </h2>

      {/* Conteneur principal avec flèches superposées */}
      <div className="relative px-4 lg:px-0">
        {/* Viewport Embla (la zone visible) */}
        <div className="overflow-hidden" ref={emblaRef}>
          {/* Container des slides (flex) */}
          <div className="flex -ml-4">
            {featureCardsData.map((feature, index) => (
              // Slide container (définition des largeurs responsives)
              <div
                key={index}
                className="pl-4 shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 snap-start"
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>

        {/* Boutons de navigation (visibles au survol du groupe) */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2 pointer-events-none z-10">
          <Button
            onClick={scrollPrev}
            variant="outline"
            size="icon"
            className={`w-10 h-10 rounded-full bg-white/90 shadow-md backdrop-blur-sm pointer-events-auto transition-opacity duration-300 border-gray-200 hover:bg-white hover:border-[#0066CC] hover:text-[#0066CC] ${prevBtnEnabled ? "opacity-100" : "opacity-0"}`}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            onClick={scrollNext}
            variant="outline"
            size="icon"
            className={`w-10 h-10 rounded-full bg-white/90 shadow-md backdrop-blur-sm pointer-events-auto transition-opacity duration-300 border-gray-200 hover:bg-white hover:border-[#0066CC] hover:text-[#0066CC] ${nextBtnEnabled ? "opacity-100" : "opacity-0"}`}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Points de pagination (Dots) */}
      <div className="flex justify-center gap-2 mt-8">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? "bg-[#0066CC] w-6" // Point actif plus large
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Aller à la diapositive ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
