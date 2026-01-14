import { describe, it, expect } from "vitest";
import {
  formatSEK,
  formatAmount,
  parseAmountInput,
  centsToInputValue,
  splitAmount,
  calculateTrendPercentage,
} from "./money";

describe("formatSEK", () => {
  it("returns '0.00 SEK' for 0 cents", () => {
    expect(formatSEK(0)).toBe("0.00 SEK");
  });

  it("returns '1.00 SEK' for 100 cents", () => {
    expect(formatSEK(100)).toBe("1.00 SEK");
  });

  it("returns '123.45 SEK' for 12345 cents", () => {
    expect(formatSEK(12345)).toBe("123.45 SEK");
  });

  it("handles negative amounts", () => {
    expect(formatSEK(-500)).toBe("-5.00 SEK");
  });

  it("handles large amounts", () => {
    expect(formatSEK(1000000)).toBe("10000.00 SEK");
  });
});

describe("formatAmount", () => {
  it("returns '0,00' for 0 cents", () => {
    expect(formatAmount(0)).toBe("0,00");
  });

  it("uses Swedish locale with comma as decimal separator", () => {
    expect(formatAmount(12345)).toBe("123,45");
  });

  it("formats with thousand separator for large amounts", () => {
    // Swedish locale uses non-breaking space as thousand separator
    const result = formatAmount(123456789);
    expect(result).toMatch(/1.*234.*567,89/);
  });

  it("handles negative amounts", () => {
    const result = formatAmount(-500);
    expect(result).toMatch(/-?5,00/);
  });
});

describe("parseAmountInput", () => {
  it("parses '123.45' to 12345 cents", () => {
    expect(parseAmountInput("123.45")).toBe(12345);
  });

  it("parses '123,45' (Swedish format) to 12345 cents", () => {
    expect(parseAmountInput("123,45")).toBe(12345);
  });

  it("returns 0 for empty string", () => {
    // Current behavior: empty string parses to 0
    expect(parseAmountInput("")).toBe(0);
  });

  it("parses whole numbers correctly", () => {
    expect(parseAmountInput("100")).toBe(10000);
  });

  it("handles single digit after decimal", () => {
    expect(parseAmountInput("10.5")).toBe(1050);
  });

  it("strips currency symbols and text", () => {
    expect(parseAmountInput("123 SEK")).toBe(12300);
  });

  it("handles multiple dots by keeping first dot only", () => {
    // "1.2.3" -> "1.23" (regex keeps first dot) -> 123 cents
    expect(parseAmountInput("1.2.3")).toBe(123);
  });

  it("rounds to nearest cent for more than 2 decimals", () => {
    expect(parseAmountInput("10.999")).toBe(1100);
  });

  it("returns 0 for '0'", () => {
    expect(parseAmountInput("0")).toBe(0);
  });

  it("handles leading/trailing whitespace", () => {
    expect(parseAmountInput("  50.00  ")).toBe(5000);
  });
});

describe("centsToInputValue", () => {
  it("returns '0.00' for 0 cents", () => {
    expect(centsToInputValue(0)).toBe("0.00");
  });

  it("returns '123.45' for 12345 cents", () => {
    expect(centsToInputValue(12345)).toBe("123.45");
  });

  it("always returns 2 decimal places", () => {
    expect(centsToInputValue(100)).toBe("1.00");
    expect(centsToInputValue(1)).toBe("0.01");
  });

  it("handles large amounts", () => {
    expect(centsToInputValue(10000000)).toBe("100000.00");
  });
});

describe("splitAmount", () => {
  it("splits amount into main and decimal parts", () => {
    expect(splitAmount(324050)).toEqual({ main: "3 240", decimal: "50" });
  });

  it("formats smaller amounts correctly", () => {
    expect(splitAmount(12345)).toEqual({ main: "123", decimal: "45" });
  });

  it("handles zero", () => {
    expect(splitAmount(0)).toEqual({ main: "0", decimal: "00" });
  });

  it("formats large amounts with space separator", () => {
    expect(splitAmount(123456789)).toEqual({ main: "1 234 567", decimal: "89" });
  });
});

describe("calculateTrendPercentage", () => {
  it("calculates increase correctly", () => {
    expect(calculateTrendPercentage(12000, 10000)).toEqual({
      percentage: 20,
      direction: "up",
    });
  });

  it("calculates decrease correctly", () => {
    expect(calculateTrendPercentage(8000, 10000)).toEqual({
      percentage: 20,
      direction: "down",
    });
  });

  it("returns neutral for no change", () => {
    expect(calculateTrendPercentage(10000, 10000)).toEqual({
      percentage: 0,
      direction: "neutral",
    });
  });

  it("handles zero previous value", () => {
    expect(calculateTrendPercentage(10000, 0)).toEqual({
      percentage: 0,
      direction: "neutral",
    });
  });

  it("rounds percentage to nearest integer", () => {
    expect(calculateTrendPercentage(11500, 10000)).toEqual({
      percentage: 15,
      direction: "up",
    });
  });
});
