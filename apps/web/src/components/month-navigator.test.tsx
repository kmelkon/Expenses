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
  it("displays the formatted month name", () => {
    render(
      <MonthNavigator
        currentMonth="2025-06"
        onPrevious={() => {}}
        onNext={() => {}}
      />
    );
    expect(screen.getByText("June 2025")).toBeInTheDocument();
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
});
