"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryFilter, CategoryKey } from "./CategoryFilter";
import { NewsCard } from "./NewsCard";

interface NewsItem {
  id: string;
  title: string;
  url: string;
  category: string;
  summary: string | null;
  published_at: string | null;
  scraped_at: string;
}

interface NewsGridProps {
  newsItems: NewsItem[];
}

export function NewsGrid({ newsItems }: NewsGridProps) {
  const [activeFilter, setActiveFilter] = useState<CategoryKey>("all");

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") {
      return newsItems;
    }
    return newsItems.filter(
      (item) => item.category.toLowerCase() === activeFilter
    );
  }, [newsItems, activeFilter]);

  const counts = useMemo(() => {
    return {
      all: newsItems.length,
      immigration: newsItems.filter((i) => i.category.toLowerCase() === "immigration").length,
      tech: newsItems.filter((i) => i.category.toLowerCase() === "tech").length,
      finance: newsItems.filter((i) => i.category.toLowerCase() === "finance").length,
    };
  }, [newsItems]);

  return (
    <section>
      {/* Section Header with Filter */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-50">
            Latest Intelligence
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
            {activeFilter !== "all" && ` in ${activeFilter}`}
          </p>
        </div>
        <CategoryFilter
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={counts}
        />
      </div>

      {/* News Grid */}
      {filteredItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-slate-800 bg-slate-900 p-12 text-center"
        >
          <p className="text-slate-400">
            {activeFilter === "all"
              ? "No news items available yet."
              : `No ${activeFilter} news available.`}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {activeFilter === "all"
              ? "Check back later for the latest updates."
              : "Try selecting a different category."}
          </p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <NewsCard
                  title={item.title}
                  category={item.category}
                  summary={item.summary}
                  url={item.url}
                  published_at={item.published_at}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
