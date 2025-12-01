import { Newspaper } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Newspaper className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-bold tracking-tight text-slate-50">
            The Alfred Brief
          </span>
        </div>
      </div>
    </nav>
  );
}
