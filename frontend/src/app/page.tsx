import { createClient } from "@/utils/supabase/server";
import { NewsCard } from "@/components/NewsCard";
import { SubscribeHero } from "@/components/SubscribeHero";

interface NewsItem {
  id: string;
  title: string;
  url: string;
  category: string;
  summary: string | null;
  published_at: string | null;
  scraped_at: string;
}

export const revalidate = 300; // Revalidate every 5 minutes

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: newsItems, error } = await supabase
    .from("news_items")
    .select("*")
    .order("scraped_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching news:", error);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Subscribe Hero */}
      <SubscribeHero />

      {/* News Section */}
      <section className="mt-12">
        <header className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-50">
            Latest Intelligence
          </h2>
          <p className="mt-2 text-slate-400">
            Today&apos;s updates on UK Immigration, Tech & Finance
          </p>
        </header>

        {!newsItems || newsItems.length === 0 ? (
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-12 text-center">
            <p className="text-slate-400">No news items available yet.</p>
            <p className="mt-2 text-sm text-slate-500">
              Check back later for the latest updates.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {newsItems.map((item: NewsItem) => (
              <NewsCard
                key={item.id}
                title={item.title}
                category={item.category}
                summary={item.summary}
                url={item.url}
                published_at={item.published_at}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
