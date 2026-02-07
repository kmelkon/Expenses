import { describe, it, expect } from "vitest";
import {
  isRequired,
  isValidAmount,
  isValidDateString,
  isValidMonthString,
  isValidPayerId,
  isValidCategory,
  isValidNote,
  isValidUUID,
  validateAddExpense,
  validateUpdateExpense,
  isCategory,
  isPayerId,
  sanitizeNote,
  sanitizeCategory,
} from "./validators";

describe("validators", () => {
  describe("isRequired", () => {
    it("should return error for null", () => {
      const error = isRequired(null, "field");
      expect(error).toEqual({ field: "field", message: "field is required" });
    });

    it("should return error for undefined", () => {
      const error = isRequired(undefined, "field");
      expect(error).toEqual({ field: "field", message: "field is required" });
    });

    it("should return error for empty string", () => {
      const error = isRequired("", "field");
      expect(error).toEqual({ field: "field", message: "field is required" });
    });

    it("should return null for valid value", () => {
      expect(isRequired("value", "field")).toBeNull();
      expect(isRequired(0, "field")).toBeNull();
      expect(isRequired(false, "field")).toBeNull();
    });
  });

  describe("isValidAmount", () => {
    it("should accept positive integers", () => {
      expect(isValidAmount(100)).toBeNull();
      expect(isValidAmount(1)).toBeNull();
      expect(isValidAmount(999999)).toBeNull();
    });

    it("should reject zero", () => {
      const error = isValidAmount(0);
      expect(error?.message).toContain("greater than 0");
    });

    it("should reject negative numbers", () => {
      const error = isValidAmount(-100);
      expect(error?.message).toContain("greater than 0");
    });

    it("should reject floats", () => {
      const error = isValidAmount(100.5);
      expect(error?.message).toContain("integer");
    });

    it("should reject extremely large numbers", () => {
      const error = isValidAmount(Number.MAX_SAFE_INTEGER + 1);
      expect(error?.message).toContain("too large");
    });
  });

  describe("isValidDateString", () => {
    it("should accept valid dates", () => {
      expect(isValidDateString("2024-01-15")).toBeNull();
      expect(isValidDateString("2024-12-31")).toBeNull();
      expect(isValidDateString("2000-02-29")).toBeNull(); // leap year
    });

    it("should reject invalid format", () => {
      expect(isValidDateString("2024/01/15")?.message).toContain("YYYY-MM-DD");
      expect(isValidDateString("15-01-2024")?.message).toContain("YYYY-MM-DD");
      expect(isValidDateString("2024-1-15")?.message).toContain("YYYY-MM-DD");
    });

    it("should reject invalid dates", () => {
      expect(isValidDateString("2024-02-31")?.message).toContain("invalid");
      expect(isValidDateString("2024-13-01")?.message).toContain("invalid");
      expect(isValidDateString("2024-00-01")?.message).toContain("invalid");
    });

    it("should reject non-leap year Feb 29", () => {
      expect(isValidDateString("2023-02-29")?.message).toContain("invalid");
    });
  });

  describe("isValidMonthString", () => {
    it("should accept valid months", () => {
      expect(isValidMonthString("2024-01")).toBeNull();
      expect(isValidMonthString("2024-12")).toBeNull();
      expect(isValidMonthString("1999-06")).toBeNull();
    });

    it("should reject invalid format", () => {
      expect(isValidMonthString("2024-1")?.message).toContain("YYYY-MM");
      expect(isValidMonthString("24-01")?.message).toContain("YYYY-MM");
    });

    it("should reject invalid months", () => {
      expect(isValidMonthString("2024-00")?.message).toContain("between");
      expect(isValidMonthString("2024-13")?.message).toContain("between");
    });

    it("should reject unreasonable years", () => {
      expect(isValidMonthString("1899-01")?.message).toContain("between 1900 and 2100");
      expect(isValidMonthString("2101-01")?.message).toContain("between 1900 and 2100");
    });
  });

  describe("isValidPayerId", () => {
    it("should accept valid payer IDs", () => {
      expect(isValidPayerId("hubby")).toBeNull();
      expect(isValidPayerId("wifey")).toBeNull();
      expect(isValidPayerId("user_123")).toBeNull();
      expect(isValidPayerId("test-user")).toBeNull();
    });

    it("should reject empty strings", () => {
      expect(isValidPayerId("")?.message).toContain("required");
      expect(isValidPayerId("  ")?.message).toContain("required");
    });

    it("should reject uppercase", () => {
      expect(isValidPayerId("Hubby")?.message).toContain("lowercase");
    });

    it("should reject special characters", () => {
      expect(isValidPayerId("user@123")?.message).toContain("lowercase");
      expect(isValidPayerId("user.name")?.message).toContain("lowercase");
    });

    it("should reject too short", () => {
      expect(isValidPayerId("a")?.message).toContain("between 2 and 50");
    });

    it("should reject too long", () => {
      const longId = "a".repeat(51);
      expect(isValidPayerId(longId)?.message).toContain("between 2 and 50");
    });
  });

  describe("isValidCategory", () => {
    it("should accept valid categories", () => {
      expect(isValidCategory("Groceries")).toBeNull();
      expect(isValidCategory("Rent")).toBeNull();
      expect(isValidCategory("Eating out")).toBeNull();
    });

    it("should reject empty strings", () => {
      expect(isValidCategory("")?.message).toContain("required");
      expect(isValidCategory("  ")?.message).toContain("required");
    });

    it("should reject too long", () => {
      const longCategory = "a".repeat(101);
      expect(isValidCategory(longCategory)?.message).toContain("100 characters");
    });
  });

  describe("isValidNote", () => {
    it("should accept null and undefined", () => {
      expect(isValidNote(null)).toBeNull();
      expect(isValidNote(undefined)).toBeNull();
    });

    it("should accept valid notes", () => {
      expect(isValidNote("This is a note")).toBeNull();
      expect(isValidNote("")).toBeNull();
    });

    it("should reject too long", () => {
      const longNote = "a".repeat(501);
      expect(isValidNote(longNote)?.message).toContain("500 characters");
    });
  });

  describe("isValidUUID", () => {
    it("should accept valid UUIDs", () => {
      expect(isValidUUID("123e4567-e89b-12d3-a456-426614174000")).toBeNull();
      expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBeNull();
    });

    it("should reject invalid UUIDs", () => {
      expect(isValidUUID("not-a-uuid")?.message).toContain("valid UUID");
      expect(isValidUUID("123e4567-e89b-12d3-a456")?.message).toContain("valid UUID");
    });
  });

  describe("validateAddExpense", () => {
    it("should validate correct input", () => {
      const result = validateAddExpense({
        amount_cents: 10000,
        paid_by: "hubby",
        date: "2024-01-15",
        category: "Groceries",
        note: "Weekly shopping",
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should collect multiple errors", () => {
      const result = validateAddExpense({
        amount_cents: -100,
        paid_by: "INVALID",
        date: "invalid-date",
        category: "",
        note: undefined,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes("Amount"))).toBe(true);
      expect(result.errors.some(e => e.includes("Payer"))).toBe(true);
      expect(result.errors.some(e => e.includes("Date"))).toBe(true);
      expect(result.errors.some(e => e.includes("Category"))).toBe(true);
    });
  });

  describe("validateUpdateExpense", () => {
    it("should validate correct input", () => {
      const result = validateUpdateExpense({
        id: "123e4567-e89b-12d3-a456-426614174000",
        amount_cents: 10000,
        paid_by: "hubby",
        date: "2024-01-15",
        category: "Groceries",
        note: "Weekly shopping",
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate UUID", () => {
      const result = validateUpdateExpense({
        id: "invalid-uuid",
        amount_cents: 10000,
        paid_by: "hubby",
        date: "2024-01-15",
        category: "Groceries",
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("UUID"))).toBe(true);
    });
  });

  describe("isCategory", () => {
    it("should work as type guard", () => {
      expect(isCategory("Groceries")).toBe(true);
      expect(isCategory("")).toBe(false);
      expect(isCategory(null)).toBe(false);
      expect(isCategory(123)).toBe(false);
    });
  });

  describe("isPayerId", () => {
    it("should work as type guard", () => {
      expect(isPayerId("hubby")).toBe(true);
      expect(isPayerId("INVALID")).toBe(false);
      expect(isPayerId("")).toBe(false);
      expect(isPayerId(null)).toBe(false);
    });
  });

  describe("sanitizeNote", () => {
    it("should return null for empty input", () => {
      expect(sanitizeNote(null)).toBeNull();
      expect(sanitizeNote(undefined)).toBeNull();
      expect(sanitizeNote("")).toBeNull();
      expect(sanitizeNote("   ")).toBeNull();
    });

    it("should remove control characters", () => {
      const dirty = "Hello\x00World\x01Test";
      expect(sanitizeNote(dirty)).toBe("HelloWorldTest");
    });

    it("should preserve newlines and tabs", () => {
      const text = "Line 1\nLine 2\tTabbed";
      expect(sanitizeNote(text)).toBe(text);
    });

    it("should trim whitespace", () => {
      expect(sanitizeNote("  Hello  ")).toBe("Hello");
    });

    it("should limit length", () => {
      const longNote = "a".repeat(600);
      const sanitized = sanitizeNote(longNote);
      expect(sanitized?.length).toBe(500);
    });
  });

  describe("sanitizeCategory", () => {
    it("should trim whitespace", () => {
      expect(sanitizeCategory("  Groceries  ")).toBe("Groceries");
    });

    it("should limit length", () => {
      const longCategory = "a".repeat(150);
      const sanitized = sanitizeCategory(longCategory);
      expect(sanitized.length).toBe(100);
    });
  });
});
