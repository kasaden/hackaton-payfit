"use client";
import { Children, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "./useInView";

interface FadeInStaggerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function FadeInStagger({
  children,
  className,
  staggerDelay = 100,
}: FadeInStaggerProps) {
  const [ref, inView] = useInView();

  return (
    <div ref={ref} className={className}>
      {Children.map(children, (child, index) => (
        <div
          className={cn(
            "transition-all duration-600 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
          style={{
            transitionDelay: inView ? `${index * staggerDelay}ms` : "0ms",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
