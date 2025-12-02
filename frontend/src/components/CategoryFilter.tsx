"use client";

import { motion } from "framer-motion";

export type CategoryKey = "all" | "immigration" | "tech" | "finance";

interface CategoryFilterProps {
  activeFilter: CategoryKey;
  onFilterChange: (filter: CategoryKey) => void;
  counts?: Record<CategoryKey, number>;
}

interface FilterTab {
  key: CategoryKey;
  label: string;
  activeColor: string;
  hoverColor: string;
}

const filters: FilterTab[] = [
  { key: "all", label: "All", activeColor: "bg-slate-600", hoverColor: "hover:bg-slate-700" },
  { key: "immigration", label: "Immigration", activeColor: "bg-blue-600", hoverColor: "hover:bg-blue-700/50" },
  { key: "tech", label: "Tech", activeColor: "bg-emerald-600", hoverColor: "hover:bg-emerald-700/50" },
  { key: "finance", label: "Finance", activeColor: "bg-amber-600", hoverColor: "hover:bg-amber-700/50" },
];

export function CategoryFilter({ activeFilter, onFilterChange, counts }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.key;
        const count = counts?.[filter.key];

        return (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              isActive
                ? `${filter.activeColor} text-white`
                : `bg-slate-800 text-slate-400 ${filter.hoverColor} hover:text-slate-300`
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeFilter"
                className={`absolute inset-0 rounded-lg ${filter.activeColor}`}
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {filter.label}
              {count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs ${
                    isActive ? "bg-white/20" : "bg-slate-700"
                  }`}
                >
                  {count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
