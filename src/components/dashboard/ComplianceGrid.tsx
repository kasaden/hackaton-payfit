"use client";

import { useState, useEffect } from "react";

interface ComplianceGridProps {
  onStatusChange: (allChecked: boolean) => void;
}

const complianceItems = [
  "Longueur 800-1200 mots",
  "Titre H1 contient le mot-clé + année",
  "Définition claire en intro (GEO)",
  "Sources légales citées",
  "FAQ incluse (3-4 questions)",
  "CTA PayFit naturel",
  "Aucune donnée inventée",
  "Tonalité PayFit respectée",
];

export function ComplianceGrid({ onStatusChange }: ComplianceGridProps) {
  const [checked, setChecked] = useState<boolean[]>(
    new Array(complianceItems.length).fill(false)
  );

  const checkedCount = checked.filter(Boolean).length;
  const allChecked = checkedCount === complianceItems.length;

  useEffect(() => {
    onStatusChange(allChecked);
  }, [allChecked, onStatusChange]);

  const toggleItem = (index: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {checkedCount} / {complianceItems.length} vérifications
        </span>
        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2E7D32] rounded-full transition-all duration-300"
            style={{
              width: `${(checkedCount / complianceItems.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {complianceItems.map((item, i) => (
          <label
            key={i}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              checked[i]
                ? "bg-green-50 border-green-200"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() => toggleItem(i)}
              className="w-4 h-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32] cursor-pointer"
            />
            <span
              className={`text-sm ${
                checked[i]
                  ? "text-[#2E7D32] line-through"
                  : "text-gray-700"
              }`}
            >
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
