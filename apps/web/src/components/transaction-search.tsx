"use client";

interface TransactionSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function TransactionSearch({
  searchQuery,
  onSearchChange,
}: TransactionSearchProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-10 sticky top-20 z-40 py-2 -mx-2 px-2 bg-cream-bg/95 backdrop-blur-sm">
      <div className="relative flex-grow group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-text/40 group-focus-within:text-accent-primary transition-colors">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm text-charcoal-text focus:ring-2 focus:ring-accent-primary/20 placeholder:text-light-grey-text/70 transition-shadow"
          placeholder="Search merchant, category or amount..."
        />
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
        <button className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-white/80 rounded-xl shadow-sm border border-transparent hover:border-charcoal-text/5 text-sm font-bold text-charcoal-text transition-all whitespace-nowrap">
          <span className="material-symbols-outlined text-lg text-charcoal-text/60">
            category
          </span>
          Category
        </button>
        <button className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-white/80 rounded-xl shadow-sm border border-transparent hover:border-charcoal-text/5 text-sm font-bold text-charcoal-text transition-all whitespace-nowrap">
          <span className="material-symbols-outlined text-lg text-charcoal-text/60">
            person
          </span>
          User
        </button>
        <button className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-white/80 rounded-xl shadow-sm border border-transparent hover:border-charcoal-text/5 text-sm font-bold text-charcoal-text transition-all whitespace-nowrap">
          <span className="material-symbols-outlined text-lg text-charcoal-text/60">
            date_range
          </span>
          Date
        </button>
      </div>
    </div>
  );
}
