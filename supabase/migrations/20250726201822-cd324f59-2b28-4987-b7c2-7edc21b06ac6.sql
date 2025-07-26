-- Update the user's profile with their Alpaca account information
UPDATE profiles 
SET 
  alpaca_account_id = '6fd31c59-4fdd-435d-83cb-2ccb568c6ac7',
  alpaca_account_number = '893706909',
  alpaca_account_status = 'ACTIVE',
  alpaca_account_created_at = now()
WHERE id = '64543994-24c0-4049-8b4f-c79727eaa6e9';

-- Also ensure all Alpaca accounts have ACTIVE status instead of SUBMITTED
-- This is a general fix for the sandbox environment
UPDATE profiles 
SET alpaca_account_status = 'ACTIVE' 
WHERE alpaca_account_status = 'SUBMITTED';