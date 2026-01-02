-- ============================================================================
-- Expenses App - Initial Supabase Schema
-- ============================================================================
-- This migration creates all tables needed for the shared expense tracking app.
-- Run this in your Supabase SQL editor or via the Supabase CLI.
-- ============================================================================

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- HOUSEHOLDS
-- ============================================================================
-- A household groups users who share expenses (e.g., you and your wife)
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  join_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- PROFILES
-- ============================================================================
-- User profile linked to Supabase auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID REFERENCES households(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  payer_id TEXT, -- maps to which payer this user is (e.g., 'hubby' or 'wifey')
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- PAYERS
-- ============================================================================
-- People who can pay for expenses within a household
CREATE TABLE IF NOT EXISTS payers (
  id TEXT NOT NULL,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, household_id)
);

-- Index for faster lookups by household
CREATE INDEX IF NOT EXISTS idx_payers_household ON payers(household_id);

-- ============================================================================
-- CATEGORIES
-- ============================================================================
-- Expense categories within a household
CREATE TABLE IF NOT EXISTS categories (
  id TEXT NOT NULL,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, household_id)
);

-- Index for faster lookups by household
CREATE INDEX IF NOT EXISTS idx_categories_household ON categories(household_id);

-- ============================================================================
-- EXPENSES
-- ============================================================================
-- The main expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  paid_by TEXT NOT NULL,
  date DATE NOT NULL,
  note TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_expenses_household ON expenses(household_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_household_date ON expenses(household_id, date) WHERE deleted = false;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at on profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================================
-- This function is called when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to join a household using a join code
CREATE OR REPLACE FUNCTION join_household(p_join_code TEXT)
RETURNS UUID AS $$
DECLARE
  v_household_id UUID;
BEGIN
  -- Find household by join code
  SELECT id INTO v_household_id
  FROM households
  WHERE join_code = p_join_code;

  IF v_household_id IS NULL THEN
    RAISE EXCEPTION 'Invalid join code';
  END IF;

  -- Update user's profile with the household
  UPDATE profiles
  SET household_id = v_household_id,
      updated_at = now()
  WHERE id = auth.uid();

  RETURN v_household_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new household and join it
CREATE OR REPLACE FUNCTION create_household(p_name TEXT)
RETURNS UUID AS $$
DECLARE
  v_household_id UUID;
BEGIN
  -- Create the household
  INSERT INTO households (name)
  VALUES (p_name)
  RETURNING id INTO v_household_id;

  -- Join the user to it
  UPDATE profiles
  SET household_id = v_household_id,
      updated_at = now()
  WHERE id = auth.uid();

  RETURN v_household_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get month summary for a household
CREATE OR REPLACE FUNCTION get_month_summary(p_year INTEGER, p_month INTEGER)
RETURNS TABLE (
  total_by_payer JSONB,
  total_by_category JSONB,
  grand_total BIGINT
) AS $$
DECLARE
  v_household_id UUID;
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  -- Get user's household
  SELECT household_id INTO v_household_id
  FROM profiles
  WHERE id = auth.uid();

  IF v_household_id IS NULL THEN
    RETURN QUERY SELECT NULL::JSONB, NULL::JSONB, 0::BIGINT;
    RETURN;
  END IF;

  -- Calculate date range
  v_start_date := make_date(p_year, p_month, 1);
  v_end_date := v_start_date + INTERVAL '1 month';

  RETURN QUERY
  WITH expenses_in_range AS (
    SELECT *
    FROM expenses
    WHERE household_id = v_household_id
      AND date >= v_start_date
      AND date < v_end_date
      AND deleted = false
  ),
  by_payer AS (
    SELECT paid_by, SUM(amount_cents) as total
    FROM expenses_in_range
    GROUP BY paid_by
  ),
  by_category AS (
    SELECT category, paid_by, SUM(amount_cents) as total
    FROM expenses_in_range
    GROUP BY category, paid_by
  )
  SELECT
    (SELECT COALESCE(jsonb_agg(jsonb_build_object('paid_by', paid_by, 'total', total)), '[]'::JSONB) FROM by_payer),
    (SELECT COALESCE(jsonb_agg(jsonb_build_object('category', category, 'paid_by', paid_by, 'total', total)), '[]'::JSONB) FROM by_category),
    (SELECT COALESCE(SUM(amount_cents), 0) FROM expenses_in_range);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
