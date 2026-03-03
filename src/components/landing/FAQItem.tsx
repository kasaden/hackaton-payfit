"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItemProps {
  question: string;
  answer: string;
}

export function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [answer]);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left cursor-pointer group"
        aria-expanded={isOpen}
      >
        <h3 className="text-base font-medium text-gray-900 pr-4 group-hover:text-[#0066CC] transition-colors">
          {question}
        </h3>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300",
            isOpen && "rotate-180 text-[#0066CC]"
          )}
        />
      </button>
      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? `${height}px` : "0px" }}
      >
        <div
          ref={contentRef}
          className="pb-5 text-gray-600 text-sm leading-relaxed"
        >
          {answer}
        </div>
      </div>
    </div>
  );
}
