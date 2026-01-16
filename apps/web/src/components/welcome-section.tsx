import { Button } from "./ui";

interface WelcomeSectionProps {
  userName: string;
  monthName: string;
  onAddExpense: () => void;
}

export function WelcomeSection({
  userName,
  monthName,
  onAddExpense,
}: WelcomeSectionProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
      <div>
        <h1 className="text-4xl font-extrabold text-charcoal-text mb-2">
          Hello, {userName}.
        </h1>
        <p className="text-lg text-light-grey-text font-light">
          Your minimal financial overview for {monthName}.
        </p>
      </div>
      <Button onClick={onAddExpense} variant="primary" size="md">
        <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">
          add
        </span>
        <span className="font-semibold text-sm">Log Expense</span>
      </Button>
    </div>
  );
}
