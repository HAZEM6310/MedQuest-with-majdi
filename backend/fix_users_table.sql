-- =============================================
-- Fix for "users" table does not exist error
-- =============================================
-- This script creates a "users" view that maps to the existing "profiles" table
-- to maintain compatibility with any API code expecting a "users" table

-- Create a view called "users" that maps to the profiles table
CREATE OR REPLACE VIEW users AS
SELECT 
    id,
    email,
    full_name as name,
    full_name,
    is_admin,
    created_at,
    updated_at
FROM profiles;

-- Grant appropriate permissions on the view
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO anon;

-- Create triggers to handle INSERT, UPDATE, DELETE operations on the view
-- so they are properly forwarded to the profiles table

-- Trigger function for INSERT operations
CREATE OR REPLACE FUNCTION users_insert_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, is_admin, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NEW.full_name, NEW.is_admin, NEW.created_at, NEW.updated_at);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for UPDATE operations
CREATE OR REPLACE FUNCTION users_update_trigger()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles SET
        email = NEW.email,
        full_name = NEW.full_name,
        is_admin = NEW.is_admin,
        updated_at = NEW.updated_at
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for DELETE operations
CREATE OR REPLACE FUNCTION users_delete_trigger()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM profiles WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create the triggers
DROP TRIGGER IF EXISTS users_insert_trigger ON users;
CREATE TRIGGER users_insert_trigger
    INSTEAD OF INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION users_insert_trigger();

DROP TRIGGER IF EXISTS users_update_trigger ON users;
CREATE TRIGGER users_update_trigger
    INSTEAD OF UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION users_update_trigger();

DROP TRIGGER IF EXISTS users_delete_trigger ON users;
CREATE TRIGGER users_delete_trigger
    INSTEAD OF DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION users_delete_trigger();

-- Log success
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Users table compatibility fix applied successfully!';
    RAISE NOTICE 'Created "users" view mapping to "profiles" table';
    RAISE NOTICE 'Added INSERT/UPDATE/DELETE triggers for full compatibility';
    RAISE NOTICE '==============================================';
END $$;