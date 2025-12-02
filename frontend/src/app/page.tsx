import { createClient } from "@/utils/supabase/server";
import { DashboardHeader } from "@/components/DashboardHeader";
import { NewsGrid } from "@/components/NewsGrid";

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
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Compact Dashboard Header with Subscribe */}
      <DashboardHeader />

      {/* News Section with Filtering */}
      <div className="mt-6">
        <NewsGrid newsItems={(newsItems as NewsItem[]) || []} />
      </div>
    </main>
  );
}
