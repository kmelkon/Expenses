import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  toYYYYMM,
  toYYYYMMDD,
  monthBounds,
  getPreviousMonth,
  getNextMonth,
  getCurrentMonth,
  getTodayYYYYMMDD,
  formatMonthDisplay,
  formatExpenseDate,
} from "./date";

describe("toYYYYMM", () => {
  it("returns correct format for a regular date", () => {
    expect(toYYYYMM(new Date(2025, 5, 15))).toBe("2025-06");
  });

  it("pads single digit months with leading zero", () => {
    expect(toYYYYMM(new Date(2025, 0, 1))).toBe("2025-01");
    expect(toYYYYMM(new Date(2025, 8, 1))).toBe("2025-09");
  });

  it("handles December correctly", () => {
    expect(toYYYYMM(new Date(2025, 11, 31))).toBe("2025-12");
  });
});

describe("toYYYYMMDD", () => {
  it("returns correct ISO date format", () => {
    expect(toYYYYMMDD(new Date(2025, 5, 15))).toBe("2025-06-15");
  });

  it("pads single digit day and month", () => {
    expect(toYYYYMMDD(new Date(2025, 0, 5))).toBe("2025-01-05");
  });

  it("handles last day of month", () => {
    expect(toYYYYMMDD(new Date(2025, 11, 31))).toBe("2025-12-31");
  });
});

describe("monthBounds", () => {
  it("returns correct start date (first of month)", () => {
    const [start] = monthBounds("2025-06");
    expect(start).toBe("2025-06-01");
  });

  it("returns correct end date for 31-day month", () => {
    const [, end] = monthBounds("2025-01");
    expect(end).toBe("2025-01-31");
  });

  it("returns correct end date for 30-day month", () => {
    const [, end] = monthBounds("2025-04");
    expect(end).toBe("2025-04-30");
  });

  it("handles February in non-leap year", () => {
    const [, end] = monthBounds("2025-02");
    expect(end).toBe("2025-02-28");
  });

  it("handles February in leap year", () => {
    const [, end] = monthBounds("2024-02");
    expect(end).toBe("2024-02-29");
  });

  it("handles December correctly", () => {
    const [start, end] = monthBounds("2025-12");
    expect(start).toBe("2025-12-01");
    expect(end).toBe("2025-12-31");
  });
});

describe("getPreviousMonth", () => {
  it("returns previous month correctly", () => {
    expect(getPreviousMonth("2025-06")).toBe("2025-05");
  });

  it("handles January -> December year rollback", () => {
    expect(getPreviousMonth("2025-01")).toBe("2024-12");
  });

  it("maintains YYYY-MM format with padding", () => {
    expect(getPreviousMonth("2025-10")).toBe("2025-09");
  });
});

describe("getNextMonth", () => {
  it("returns next month correctly", () => {
    expect(getNextMonth("2025-06")).toBe("2025-07");
  });

  it("handles December -> January year rollover", () => {
    expect(getNextMonth("2025-12")).toBe("2026-01");
  });

  it("maintains YYYY-MM format with padding", () => {
    expect(getNextMonth("2025-09")).toBe("2025-10");
  });
});

describe("getCurrentMonth", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns current month in YYYY-MM format", () => {
    vi.setSystemTime(new Date(2025, 5, 15));
    expect(getCurrentMonth()).toBe("2025-06");
  });

  it("handles year boundaries", () => {
    vi.setSystemTime(new Date(2025, 11, 31));
    expect(getCurrentMonth()).toBe("2025-12");
  });
});

describe("getTodayYYYYMMDD", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns today in YYYY-MM-DD format", () => {
    vi.setSystemTime(new Date(2025, 5, 15));
    expect(getTodayYYYYMMDD()).toBe("2025-06-15");
  });
});

describe("formatMonthDisplay", () => {
  it("returns 'January 2025' format", () => {
    expect(formatMonthDisplay("2025-01")).toBe("January 2025");
  });

  it("handles all months correctly", () => {
    expect(formatMonthDisplay("2025-06")).toBe("June 2025");
    expect(formatMonthDisplay("2025-12")).toBe("December 2025");
  });
});

describe("formatExpenseDate", () => {
  it("returns 'Jan 15' format", () => {
    expect(formatExpenseDate("2025-01-15")).toBe("Jan 15");
  });

  it("handles single digit day", () => {
    expect(formatExpenseDate("2025-06-5")).toBe("Jun 5");
  });

  it("handles various months", () => {
    expect(formatExpenseDate("2025-12-25")).toBe("Dec 25");
    expect(formatExpenseDate("2025-07-04")).toBe("Jul 4");
  });
});
