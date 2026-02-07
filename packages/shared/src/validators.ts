/**
 * Validation utilities for expense tracking data
 * 
 * These validators provide runtime validation for user inputs and data integrity.
 * Use these before database operations to ensure data quality.
 */

import type { AddExpenseInput, UpdateExpenseInput, Category, PayerId } from "./types";

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// ============================================================================
// BASIC VALIDATORS
// ============================================================================

/**
 * Validate that a value is not null/undefined/empty
 */
export function isRequired(value: unknown, fieldName: string): ValidationError | null {
  if (value === null || value === undefined || value === "") {
    return { field: fieldName, message: `${fieldName} is required` };
  }
  return null;
}

/**
 * Validate amount is a positive integer (cents)
 */
export function isValidAmount(amountCents: number): ValidationError | null {
  if (!Number.isInteger(amountCents)) {
    return { field: "amount_cents", message: "Amount must be an integer (cents)" };
  }
  if (amountCents <= 0) {
    return { field: "amount_cents", message: "Amount must be greater than 0" };
  }
  if (amountCents > Number.MAX_SAFE_INTEGER) {
    return { field: "amount_cents", message: "Amount is too large" };
  }
  return null;
}

/**
 * Validate date string format (YYYY-MM-DD)
 */
export function isValidDateString(dateStr: string): ValidationError | null {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!datePattern.test(dateStr)) {
    return { field: "date", message: "Date must be in YYYY-MM-DD format" };
  }
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { field: "date", message: "Date is invalid" };
  }
  
  // Check if date components match (catches invalid dates like 2024-02-31)
  const [year, month, day] = dateStr.split("-").map(Number);
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return { field: "date", message: "Date is invalid" };
  }
  
  return null;
}

/**
 * Validate month string format (YYYY-MM)
 */
export function isValidMonthString(monthStr: string): ValidationError | null {
  const monthPattern = /^\d{4}-\d{2}$/;
  
  if (!monthPattern.test(monthStr)) {
    return { field: "month", message: "Month must be in YYYY-MM format" };
  }
  
  const [year, month] = monthStr.split("-").map(Number);
  if (month < 1 || month > 12) {
    return { field: "month", message: "Month must be between 01 and 12" };
  }
  
  if (year < 1900 || year > 2100) {
    return { field: "month", message: "Year must be between 1900 and 2100" };
  }
  
  return null;
}

/**
 * Validate payer ID format (lowercase alphanumeric, underscore, hyphen)
 */
export function isValidPayerId(payerId: string): ValidationError | null {
  if (!payerId || payerId.trim() === "") {
    return { field: "paid_by", message: "Payer ID is required" };
  }
  
  const payerPattern = /^[a-z0-9_-]+$/;
  if (!payerPattern.test(payerId)) {
    return { 
      field: "paid_by", 
      message: "Payer ID must be lowercase alphanumeric with underscores or hyphens" 
    };
  }
  
  if (payerId.length < 2 || payerId.length > 50) {
    return { field: "paid_by", message: "Payer ID must be between 2 and 50 characters" };
  }
  
  return null;
}

/**
 * Validate category name format
 */
export function isValidCategory(category: string): ValidationError | null {
  if (!category || category.trim() === "") {
    return { field: "category", message: "Category is required" };
  }
  
  if (category.length > 100) {
    return { field: "category", message: "Category must be 100 characters or less" };
  }
  
  return null;
}

/**
 * Validate note length
 */
export function isValidNote(note: string | null | undefined): ValidationError | null {
  if (note && note.length > 500) {
    return { field: "note", message: "Note must be 500 characters or less" };
  }
  return null;
}

/**
 * Validate UUID format
 */
export function isValidUUID(id: string): ValidationError | null {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!uuidPattern.test(id)) {
    return { field: "id", message: "ID must be a valid UUID" };
  }
  
  return null;
}

// ============================================================================
// COMPOSITE VALIDATORS
// ============================================================================

/**
 * Validate AddExpenseInput
 */
export function validateAddExpense(input: AddExpenseInput): ValidationResult {
  const errors: string[] = [];
  
  const amountError = isValidAmount(input.amount_cents);
  if (amountError) errors.push(amountError.message);
  
  const payerError = isValidPayerId(input.paid_by);
  if (payerError) errors.push(payerError.message);
  
  const dateError = isValidDateString(input.date);
  if (dateError) errors.push(dateError.message);
  
  const categoryError = isValidCategory(input.category);
  if (categoryError) errors.push(categoryError.message);
  
  const noteError = isValidNote(input.note);
  if (noteError) errors.push(noteError.message);
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate UpdateExpenseInput
 */
export function validateUpdateExpense(input: UpdateExpenseInput): ValidationResult {
  const errors: string[] = [];
  
  const idError = isValidUUID(input.id);
  if (idError) errors.push(idError.message);
  
  const addExpenseResult = validateAddExpense(input);
  errors.push(...addExpenseResult.errors);
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Type guard for Category
 */
export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && isValidCategory(value) === null;
}

/**
 * Type guard for PayerId
 */
export function isPayerId(value: unknown): value is PayerId {
  return typeof value === "string" && isValidPayerId(value) === null;
}

// ============================================================================
// SANITIZATION UTILITIES
// ============================================================================

/**
 * Sanitize note text (remove control characters, limit length)
 */
export function sanitizeNote(note: string | null | undefined): string | null {
  if (!note) return null;
  
  // Remove control characters except newline and tab
  const sanitized = note.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  
  // Trim and limit length
  const trimmed = sanitized.trim();
  return trimmed.length > 0 ? trimmed.substring(0, 500) : null;
}

/**
 * Sanitize category name (trim, limit length)
 */
export function sanitizeCategory(category: string): string {
  return category.trim().substring(0, 100);
}
