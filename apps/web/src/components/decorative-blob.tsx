interface DecorativeBlobProps {
  variant?: "mint" | "lavender" | "peach" | "blue";
  size?: "sm" | "md" | "lg";
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}

export function DecorativeBlob({
  variant = "mint",
  size = "md",
  position = "top-left",
  className = "",
}: DecorativeBlobProps) {
  const colors = {
    mint: "bg-pastel-mint/30",
    lavender: "bg-pastel-lavender/30",
    peach: "bg-pastel-peach/40",
    blue: "bg-pastel-blue/30",
  };

  const sizes = {
    sm: "w-[200px] h-[200px]",
    md: "w-[300px] h-[300px]",
    lg: "w-[400px] h-[400px]",
  };

  const positions = {
    "top-left": "top-[-20%] left-[-20%]",
    "top-right": "top-[-20%] right-[-20%]",
    "bottom-left": "bottom-[-10%] left-[-10%]",
    "bottom-right": "bottom-[-10%] right-[-10%]",
  };

  return (
    <div
      className={`absolute ${positions[position]} ${sizes[size]} ${colors[variant]} rounded-full blur-3xl opacity-60 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}

interface DecorativeDotsProps {
  className?: string;
}

export function DecorativeDots({ className = "" }: DecorativeDotsProps) {
  return (
    <>
      <div
        className={`absolute -top-4 right-10 w-8 h-8 bg-pastel-blue rounded-full opacity-60 ${className}`}
        style={{ animation: "bounce 3s infinite" }}
        aria-hidden="true"
      />
      <div
        className={`absolute -bottom-2 left-10 w-6 h-6 bg-accent-warning rounded-full opacity-40 ${className}`}
        style={{ animation: "bounce 4s infinite 1s" }}
        aria-hidden="true"
      />
    </>
  );
}
