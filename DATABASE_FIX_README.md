# Database Fix for "users table does not exist" Error

## Problem
The application was experiencing an error during user signup:
```
ERROR: relation "users" does not exist (SQLSTATE 42P01)
500: Database error updating user
```

## Root Cause
The application code (likely a backend API) was trying to access a table called "users", but the Supabase database only contains a "profiles" table. This mismatch was causing the signup process to fail.

## Solution
This fix creates a database view called "users" that maps to the existing "profiles" table, providing full compatibility for any code expecting a "users" table.

## Files Added
- `backend/fix_users_table.sql` - Database migration script to create the users view

## How to Apply the Fix

### Option 1: Using Supabase Dashboard
1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy the contents of `backend/fix_users_table.sql`
4. Run the SQL script

### Option 2: Using Supabase CLI
```bash
supabase db reset
# Then run the migration
psql "your_database_connection_string" -f backend/fix_users_table.sql
```

### Option 3: Add to existing setup scripts
Add the contents of `fix_users_table.sql` to your existing database setup scripts or run it after your main setup.

## What This Fix Does

1. **Creates a "users" view** that maps to the "profiles" table with the following column mappings:
   - `id` → `id`
   - `email` → `email` 
   - `name` → `full_name` (alias)
   - `full_name` → `full_name`
   - `is_admin` → `is_admin`
   - `created_at` → `created_at`
   - `updated_at` → `updated_at`

2. **Adds INSTEAD OF triggers** to handle INSERT, UPDATE, and DELETE operations on the view, forwarding them to the actual "profiles" table

3. **Grants permissions** for authenticated and anonymous users to access the view

## Testing
After applying this fix, the signup process should work without the "users table does not exist" error. The application will be able to:
- Query the "users" table (which will return data from "profiles")
- Insert new user records (which will be stored in "profiles")
- Update existing user records
- Delete user records

## Backward Compatibility
This fix maintains full backward compatibility:
- Existing "profiles" table remains unchanged
- All existing data is preserved
- Applications can continue using either "users" or "profiles" table names
- No changes needed to existing application code

## Next Steps
1. Apply the database migration
2. Test the signup functionality
3. Monitor for any other database-related errors
4. Consider updating application code to use consistent table names long-term