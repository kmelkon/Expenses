import { Card } from "./ui";

export function SpendingFlowChart() {
  return (
    <Card variant="blue" hover>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-charcoal-text">Spending Flow</h3>
        <div className="flex gap-2">
          <button className="px-4 py-1.5 bg-white/60 hover:bg-white text-xs font-bold rounded-full transition-colors text-charcoal-text shadow-sm">
            30 Days
          </button>
        </div>
      </div>

      {/* Placeholder chart SVG */}
      <div className="w-full h-48">
        <svg
          className="w-full h-full overflow-visible"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 478 150"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint0_linear_pastel"
              x1="236"
              x2="236"
              y1="1"
              y2="149"
            >
              <stop stopColor="#7FB3D5" stopOpacity="0.2" />
              <stop offset="1" stopColor="#7FB3D5" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line
            stroke="#ffffff"
            strokeDasharray="6 6"
            strokeOpacity="0.6"
            strokeWidth="2"
            x1="0"
            x2="478"
            y1="149"
            y2="149"
          />
          <line
            stroke="#ffffff"
            strokeDasharray="6 6"
            strokeOpacity="0.6"
            strokeWidth="2"
            x1="0"
            x2="478"
            y1="75"
            y2="75"
          />
          <path
            d="M0 109C18.15 109 18.15 21 36.31 21C54.46 21 54.46 41 72.62 41C90.77 41 90.77 93 108.92 93C127.08 93 127.08 33 145.23 33C163.38 33 163.38 101 181.54 101C199.69 101 199.69 61 217.85 61C236 61 236 45 254.15 45C272.31 45 272.31 121 290.46 121C308.62 121 308.62 149 326.77 149C344.92 149 344.92 1 363.08 1C381.23 1 381.23 81 399.38 81C417.54 81 417.54 129 435.69 129C453.85 129 453.85 25 472 25V149H0V109Z"
            fill="url(#paint0_linear_pastel)"
          />
          <path
            d="M0 109C18.15 109 18.15 21 36.31 21C54.46 21 54.46 41 72.62 41C90.77 41 90.77 93 108.92 93C127.08 93 127.08 33 145.23 33C163.38 33 163.38 101 181.54 101C199.69 101 199.69 61 217.85 61C236 61 236 45 254.15 45C272.31 45 272.31 121 290.46 121C308.62 121 308.62 149 326.77 149C344.92 149 344.92 1 363.08 1C381.23 1 381.23 81 399.38 81C417.54 81 417.54 129 435.69 129C453.85 129 453.85 25 472 25"
            stroke="#7FB3D5"
            strokeLinecap="round"
            strokeWidth="4"
          />
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between px-2 mt-4">
        <p className="text-charcoal-text/50 text-xs font-semibold">Oct 01</p>
        <p className="text-charcoal-text/50 text-xs font-semibold">Oct 08</p>
        <p className="text-charcoal-text/50 text-xs font-semibold">Oct 15</p>
        <p className="text-charcoal-text/50 text-xs font-semibold">Oct 22</p>
        <p className="text-charcoal-text/50 text-xs font-semibold">Oct 29</p>
      </div>
    </Card>
  );
}
