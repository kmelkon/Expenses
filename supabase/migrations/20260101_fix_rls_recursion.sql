-- ============================================================================
-- Fix RLS Policy Infinite Recursion
-- ============================================================================
-- The original policies used subqueries like:
--   household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid())
-- This caused infinite recursion because querying profiles triggers RLS which
-- queries profiles again.
--
-- Solution: Create a SECURITY DEFINER function that bypasses RLS to get the
-- current user's household_id.
-- ============================================================================

-- Create helper function that bypasses RLS
CREATE OR REPLACE FUNCTION get_my_household_id()
RETURNS UUID AS $$
  SELECT household_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_my_household_id() TO authenticated;

-- ============================================================================
-- PROFILES POLICIES - Fix recursive policy
-- ============================================================================

DROP POLICY IF EXISTS "Users can view household member profiles" ON profiles;

CREATE POLICY "Users can view household member profiles"
  ON profiles FOR SELECT
  USING (household_id = get_my_household_id());

-- ============================================================================
-- HOUSEHOLDS POLICIES - Update to use helper function
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their household" ON households;
DROP POLICY IF EXISTS "Users can update their household" ON households;

CREATE POLICY "Users can view their household"
  ON households FOR SELECT
  USING (id = get_my_household_id());

CREATE POLICY "Users can update their household"
  ON households FOR UPDATE
  USING (id = get_my_household_id());

-- ============================================================================
-- PAYERS POLICIES - Update to use helper function
-- ============================================================================

DROP POLICY IF EXISTS "Users can view household payers" ON payers;
DROP POLICY IF EXISTS "Users can create household payers" ON payers;
DROP POLICY IF EXISTS "Users can update household payers" ON payers;
DROP POLICY IF EXISTS "Users can delete household payers" ON payers;

CREATE POLICY "Users can view household payers"
  ON payers FOR SELECT
  USING (household_id = get_my_household_id());

CREATE POLICY "Users can create household payers"
  ON payers FOR INSERT
  WITH CHECK (household_id = get_my_household_id());

CREATE POLICY "Users can update household payers"
  ON payers FOR UPDATE
  USING (household_id = get_my_household_id());

CREATE POLICY "Users can delete household payers"
  ON payers FOR DELETE
  USING (household_id = get_my_household_id());

-- ============================================================================
-- CATEGORIES POLICIES - Update to use helper function
-- ============================================================================

DROP POLICY IF EXISTS "Users can view household categories" ON categories;
DROP POLICY IF EXISTS "Users can create household categories" ON categories;
DROP POLICY IF EXISTS "Users can update household categories" ON categories;
DROP POLICY IF EXISTS "Users can delete household categories" ON categories;

CREATE POLICY "Users can view household categories"
  ON categories FOR SELECT
  USING (household_id = get_my_household_id());

CREATE POLICY "Users can create household categories"
  ON categories FOR INSERT
  WITH CHECK (household_id = get_my_household_id());

CREATE POLICY "Users can update household categories"
  ON categories FOR UPDATE
  USING (household_id = get_my_household_id());

CREATE POLICY "Users can delete household categories"
  ON categories FOR DELETE
  USING (household_id = get_my_household_id());

-- ============================================================================
-- EXPENSES POLICIES - Update to use helper function
-- ============================================================================

DROP POLICY IF EXISTS "Users can view household expenses" ON expenses;
DROP POLICY IF EXISTS "Users can create household expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update household expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete household expenses" ON expenses;

CREATE POLICY "Users can view household expenses"
  ON expenses FOR SELECT
  USING (household_id = get_my_household_id());

CREATE POLICY "Users can create household expenses"
  ON expenses FOR INSERT
  WITH CHECK (household_id = get_my_household_id());

CREATE POLICY "Users can update household expenses"
  ON expenses FOR UPDATE
  USING (household_id = get_my_household_id());

CREATE POLICY "Users can delete household expenses"
  ON expenses FOR DELETE
  USING (household_id = get_my_household_id());
