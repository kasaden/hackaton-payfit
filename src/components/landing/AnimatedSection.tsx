"use client";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "./useInView";

type AnimationVariant =
  | "fadeUp"
  | "fadeDown"
  | "fadeLeft"
  | "fadeRight"
  | "fadeIn"
  | "scaleUp";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  variant?: AnimationVariant;
  delay?: number;
  as?: "div" | "section" | "article" | "aside";
}

const variantStyles: Record<
  AnimationVariant,
  { hidden: string; visible: string }
> = {
  fadeUp: {
    hidden: "opacity-0 translate-y-8",
    visible: "opacity-100 translate-y-0",
  },
  fadeDown: {
    hidden: "opacity-0 -translate-y-8",
    visible: "opacity-100 translate-y-0",
  },
  fadeLeft: {
    hidden: "opacity-0 translate-x-8",
    visible: "opacity-100 translate-x-0",
  },
  fadeRight: {
    hidden: "opacity-0 -translate-x-8",
    visible: "opacity-100 translate-x-0",
  },
  fadeIn: {
    hidden: "opacity-0",
    visible: "opacity-100",
  },
  scaleUp: {
    hidden: "opacity-0 scale-95",
    visible: "opacity-100 scale-100",
  },
};

export function AnimatedSection({
  children,
  className,
  variant = "fadeUp",
  delay = 0,
  as: Component = "div",
}: AnimatedSectionProps) {
  const [ref, inView] = useInView();
  const styles = variantStyles[variant];

  return (
    <Component
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        inView ? styles.visible : styles.hidden,
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Component>
  );
}
