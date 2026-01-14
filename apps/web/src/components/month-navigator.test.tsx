import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MonthNavigator } from "./month-navigator";

vi.mock("@expenses/shared", () => ({
  getCurrentMonth: () => "2025-06",
  formatMonthDisplay: (yyyyMM: string) => {
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    const [year, month] = yyyyMM.split("-");
    return `${months[parseInt(month) - 1]} ${year}`;
  },
}));

describe("MonthNavigator", () => {
  it("displays the formatted month name in uppercase", () => {
    render(
      <MonthNavigator
        currentMonth="2025-06"
        onPrevious={() => {}}
        onNext={() => {}}
      />
    );
    expect(screen.getByText("JUNE 2025")).toBeInTheDocument();
  });

  it("calls onPrevious when previous button is clicked", () => {
    const onPrevious = vi.fn();
    render(
      <MonthNavigator
        currentMonth="2025-06"
        onPrevious={onPrevious}
        onNext={() => {}}
      />
    );

    const prevButton = screen.getByRole("button", { name: /previous month/i });
    fireEvent.click(prevButton);

    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it("calls onNext when next button is clicked", () => {
    const onNext = vi.fn();
    render(
      <MonthNavigator
        currentMonth="2025-05"
        onPrevious={() => {}}
        onNext={onNext}
      />
    );

    const nextButton = screen.getByRole("button", { name: /next month/i });
    fireEvent.click(nextButton);

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("disables next button when viewing current month", () => {
    const onNext = vi.fn();
    render(
      <MonthNavigator
        currentMonth="2025-06"
        onPrevious={() => {}}
        onNext={onNext}
      />
    );

    const nextButton = screen.getByRole("button", { name: /next month/i });
    expect(nextButton).toBeDisabled();
  });

  it("shows calendar icon in a circle container", () => {
    render(
      <MonthNavigator
        currentMonth="2025-06"
        onPrevious={() => {}}
        onNext={() => {}}
      />
    );
    const iconContainer = screen.getByTestId("calendar-icon-circle");
    expect(iconContainer).toHaveClass("rounded-full");
    expect(iconContainer).toHaveClass("bg-[var(--terracotta-100)]");
  });

  it("shows month in uppercase format", () => {
    render(
      <MonthNavigator
        currentMonth="2025-06"
        onPrevious={() => {}}
        onNext={() => {}}
      />
    );
    // Should have uppercase styling
    const monthLabel = screen.getByText("JUNE 2025");
    expect(monthLabel).toBeInTheDocument();
    expect(monthLabel).toHaveClass("uppercase");
  });
});
