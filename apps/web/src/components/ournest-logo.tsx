interface OurNestLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function OurNestLogo({
  size = "md",
  showText = true,
  className = "",
}: OurNestLogoProps) {
  const sizes = {
    sm: { icon: "h-8 w-8", iconText: "text-[16px]", text: "text-base" },
    md: { icon: "h-10 w-10", iconText: "text-[20px]", text: "text-lg" },
    lg: { icon: "h-16 w-16", iconText: "text-[32px]", text: "text-2xl" },
  };

  const { icon, iconText, text } = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${icon} rounded-full bg-pastel-peach flex items-center justify-center text-charcoal-text/70`}
      >
        <span className={`material-symbols-outlined ${iconText}`}>cottage</span>
      </div>
      {showText && (
        <span className={`font-bold ${text} tracking-tight text-charcoal-text`}>
          OurNest
        </span>
      )}
    </div>
  );
}
