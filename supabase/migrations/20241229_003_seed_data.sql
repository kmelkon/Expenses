-- ============================================================================
-- Expenses App - Seed Data
-- ============================================================================
-- This creates default data for your household.
-- Run this AFTER you and your wife have both signed in via Google OAuth.
-- Then update the profile records with the correct household_id.
-- ============================================================================

-- NOTE: This is a template. You'll need to:
-- 1. Sign in to the app with your Google account
-- 2. Sign in with your wife's Google account
-- 3. Run the first SQL block below to create your household
-- 4. Run the second block to seed categories and payers
-- 5. Run the third block to link your profiles to the household

-- ============================================================================
-- STEP 1: Create your household (run once)
-- ============================================================================
-- Uncomment and run this:

-- INSERT INTO households (name, join_code)
-- VALUES ('Melkon Family', 'melkon24')
-- RETURNING id, join_code;

-- Save the returned ID (e.g., 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')

-- ============================================================================
-- STEP 2: Seed categories and payers
-- ============================================================================
-- Replace YOUR_HOUSEHOLD_ID with the UUID from step 1

/*
DO $$
DECLARE
  v_household_id UUID := 'YOUR_HOUSEHOLD_ID';
BEGIN
  -- Insert payers
  INSERT INTO payers (id, household_id, display_name) VALUES
    ('hubby', v_household_id, 'Karam'),
    ('wifey', v_household_id, 'Kazi');

  -- Insert categories
  INSERT INTO categories (id, household_id, name, display_order) VALUES
    ('groceries', v_household_id, 'Groceries', 0),
    ('rent', v_household_id, 'Rent', 1),
    ('mortgage', v_household_id, 'Mortgage', 2),
    ('electricity', v_household_id, 'Electricity', 3),
    ('electricity_network', v_household_id, 'Electricity network', 4),
    ('garbage_collection', v_household_id, 'Garbage collection', 5),
    ('internet', v_household_id, 'Internet', 6),
    ('bensin', v_household_id, 'Bensin', 7),
    ('house_insurance', v_household_id, 'House insurance', 8),
    ('car_insurance', v_household_id, 'Car insurance', 9),
    ('eating_out', v_household_id, 'Eating out', 10),
    ('kid', v_household_id, 'Kid', 11);
END $$;
*/

-- ============================================================================
-- STEP 3: Link your profiles to the household
-- ============================================================================
-- Replace YOUR_HOUSEHOLD_ID with the UUID from step 1
-- Replace with your actual user IDs from auth.users

/*
UPDATE profiles
SET
  household_id = 'YOUR_HOUSEHOLD_ID',
  payer_id = 'hubby'
WHERE email = 'your-email@gmail.com';

UPDATE profiles
SET
  household_id = 'YOUR_HOUSEHOLD_ID',
  payer_id = 'wifey'
WHERE email = 'wife-email@gmail.com';
*/

-- ============================================================================
-- ALTERNATIVE: Use the join_household function
-- ============================================================================
-- After creating the household, you can also join using the join code.
-- In the app, call: SELECT join_household('melkon24');
