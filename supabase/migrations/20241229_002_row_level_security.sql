-- ============================================================================
-- Expenses App - Row Level Security Policies
-- ============================================================================
-- These policies ensure users can only access data from their household.
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Users can view profiles of household members
CREATE POLICY "Users can view household member profiles"
  ON profiles FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- HOUSEHOLDS POLICIES
-- ============================================================================

-- Users can view their household
CREATE POLICY "Users can view their household"
  ON households FOR SELECT
  USING (
    id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Any authenticated user can create a household
CREATE POLICY "Authenticated users can create households"
  ON households FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their household (for name changes)
CREATE POLICY "Users can update their household"
  ON households FOR UPDATE
  USING (
    id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- PAYERS POLICIES
-- ============================================================================

-- Users can view payers in their household
CREATE POLICY "Users can view household payers"
  ON payers FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can create payers in their household
CREATE POLICY "Users can create household payers"
  ON payers FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can update payers in their household
CREATE POLICY "Users can update household payers"
  ON payers FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can delete payers in their household
CREATE POLICY "Users can delete household payers"
  ON payers FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- CATEGORIES POLICIES
-- ============================================================================

-- Users can view categories in their household
CREATE POLICY "Users can view household categories"
  ON categories FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can create categories in their household
CREATE POLICY "Users can create household categories"
  ON categories FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can update categories in their household
CREATE POLICY "Users can update household categories"
  ON categories FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can delete categories in their household
CREATE POLICY "Users can delete household categories"
  ON categories FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- EXPENSES POLICIES
-- ============================================================================

-- Users can view expenses in their household
CREATE POLICY "Users can view household expenses"
  ON expenses FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can create expenses in their household
CREATE POLICY "Users can create household expenses"
  ON expenses FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can update expenses in their household
CREATE POLICY "Users can update household expenses"
  ON expenses FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can delete expenses in their household (soft delete via update)
CREATE POLICY "Users can delete household expenses"
  ON expenses FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );
