-- =============================================
-- MedQuest Voucher System - Supabase Setup
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CREATE TABLES
-- =============================================

-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    label TEXT,
    credits INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT vouchers_code_not_empty CHECK (length(trim(code)) > 0),
    CONSTRAINT vouchers_credits_non_negative CHECK (credits >= 0)
);

-- Create voucher_usages table
CREATE TABLE IF NOT EXISTS voucher_usages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    months_paid INTEGER NOT NULL,
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    payment_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT voucher_usages_months_positive CHECK (months_paid > 0),
    CONSTRAINT voucher_usages_amount_positive CHECK (payment_amount IS NULL OR payment_amount > 0),
    
    -- Ensure one voucher usage per user
    UNIQUE(user_id, voucher_id)
);

-- Add voucher_code column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'voucher_code'
    ) THEN
        ALTER TABLE profiles ADD COLUMN voucher_code TEXT;
    END IF;
END $$;

-- Add subscription extension fields to profiles if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'subscription_end_date'
    ) THEN
        ALTER TABLE profiles ADD COLUMN subscription_end_date TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'bonus_days'
    ) THEN
        ALTER TABLE profiles ADD COLUMN bonus_days INTEGER DEFAULT 0;
    END IF;
END $$;

-- =============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_active ON vouchers(is_active);
CREATE INDEX IF NOT EXISTS idx_voucher_usages_user ON voucher_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usages_voucher ON voucher_usages(voucher_id);
CREATE INDEX IF NOT EXISTS idx_profiles_voucher_code ON profiles(voucher_code);

-- =============================================
-- 3. CREATE FUNCTIONS
-- =============================================

-- Function to validate voucher code
CREATE OR REPLACE FUNCTION validate_voucher_code(voucher_code_input TEXT)
RETURNS TABLE(
    voucher_id UUID,
    voucher_code TEXT,
    voucher_label TEXT,
    is_valid BOOLEAN,
    message TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if voucher exists and is active
    RETURN QUERY
    SELECT 
        v.id,
        v.code,
        v.label,
        v.is_active,
        CASE 
            WHEN v.id IS NULL THEN 'Voucher code not found'
            WHEN NOT v.is_active THEN 'Voucher code is inactive'
            ELSE 'Voucher code is valid'
        END as message
    FROM vouchers v
    WHERE UPPER(v.code) = UPPER(voucher_code_input)
    
    UNION ALL
    
    SELECT 
        NULL::UUID,
        voucher_code_input,
        NULL,
        false,
        'Voucher code not found'
    WHERE NOT EXISTS (
        SELECT 1 FROM vouchers WHERE UPPER(code) = UPPER(voucher_code_input)
    );
END;
$$;

-- Function to apply voucher to user subscription
CREATE OR REPLACE FUNCTION apply_voucher_to_subscription(
    p_user_id UUID,
    p_voucher_code TEXT,
    p_months_paid INTEGER,
    p_payment_amount DECIMAL DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    credits_added INTEGER,
    bonus_days_granted INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_voucher_id UUID;
    v_voucher_active BOOLEAN;
    v_existing_usage_id UUID;
    v_credits_to_add INTEGER;
    v_bonus_days INTEGER := 3; -- 3 bonus days per voucher usage
BEGIN
    -- Initialize return values
    credits_added := 0;
    bonus_days_granted := 0;
    
    -- Validate inputs
    IF p_user_id IS NULL OR p_voucher_code IS NULL OR p_months_paid <= 0 THEN
        success := false;
        message := 'Invalid input parameters';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Get voucher details
    SELECT id, is_active INTO v_voucher_id, v_voucher_active
    FROM vouchers 
    WHERE UPPER(code) = UPPER(p_voucher_code);
    
    -- Check if voucher exists
    IF v_voucher_id IS NULL THEN
        success := false;
        message := 'Voucher code not found';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Check if voucher is active
    IF NOT v_voucher_active THEN
        success := false;
        message := 'Voucher code is inactive';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Check if user has already used this voucher
    SELECT id INTO v_existing_usage_id
    FROM voucher_usages 
    WHERE user_id = p_user_id AND voucher_id = v_voucher_id;
    
    IF v_existing_usage_id IS NOT NULL THEN
        success := false;
        message := 'Voucher has already been used by this user';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Calculate credits to add (1 credit per month)
    v_credits_to_add := p_months_paid;
    
    -- Start transaction
    BEGIN
        -- Record voucher usage
        INSERT INTO voucher_usages (
            user_id,
            voucher_id,
            months_paid,
            payment_amount,
            subscription_start_date,
            subscription_end_date
        ) VALUES (
            p_user_id,
            v_voucher_id,
            p_months_paid,
            p_payment_amount,
            NOW(),
            NOW() + (p_months_paid || ' months')::INTERVAL
        );
        
        -- Update voucher credits
        UPDATE vouchers 
        SET 
            credits = credits + v_credits_to_add,
            updated_at = NOW()
        WHERE id = v_voucher_id;
        
        -- Update user profile with bonus days
        UPDATE profiles 
        SET 
            voucher_code = p_voucher_code,
            bonus_days = COALESCE(bonus_days, 0) + v_bonus_days,
            subscription_end_date = CASE 
                WHEN subscription_end_date IS NULL THEN 
                    NOW() + (p_months_paid || ' months')::INTERVAL + (v_bonus_days || ' days')::INTERVAL
                ELSE 
                    subscription_end_date + (v_bonus_days || ' days')::INTERVAL
            END,
            updated_at = NOW()
        WHERE id = p_user_id;
        
        -- Set return values
        success := true;
        message := 'Voucher applied successfully';
        credits_added := v_credits_to_add;
        bonus_days_granted := v_bonus_days;
        
    EXCEPTION WHEN OTHERS THEN
        -- Rollback will happen automatically
        success := false;
        message := 'Error applying voucher: ' || SQLERRM;
        credits_added := 0;
        bonus_days_granted := 0;
    END;
    
    RETURN NEXT;
END;
$$;

-- Function to get voucher statistics for admin dashboard
CREATE OR REPLACE FUNCTION get_voucher_stats()
RETURNS TABLE(
    voucher_id UUID,
    voucher_code TEXT,
    voucher_label TEXT,
    total_credits INTEGER,
    is_active BOOLEAN,
    total_users INTEGER,
    total_months_sold INTEGER,
    total_revenue DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.code,
        v.label,
        v.credits,
        v.is_active,
        COALESCE(stats.user_count, 0)::INTEGER as total_users,
        COALESCE(stats.total_months, 0)::INTEGER as total_months_sold,
        COALESCE(stats.total_revenue, 0)::DECIMAL as total_revenue,
        v.created_at
    FROM vouchers v
    LEFT JOIN (
        SELECT 
            voucher_id,
            COUNT(DISTINCT user_id) as user_count,
            SUM(months_paid) as total_months,
            SUM(payment_amount) as total_revenue
        FROM voucher_usages
        GROUP BY voucher_id
    ) stats ON v.id = stats.voucher_id
    ORDER BY v.created_at DESC;
END;
$$;

-- Function to create a new voucher (admin only)
CREATE OR REPLACE FUNCTION create_voucher(
    p_code TEXT,
    p_label TEXT DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    voucher_id UUID
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_voucher_id UUID;
    v_existing_voucher_id UUID;
BEGIN
    -- Validate input
    IF p_code IS NULL OR length(trim(p_code)) = 0 THEN
        success := false;
        message := 'Voucher code cannot be empty';
        voucher_id := NULL;
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Check if voucher code already exists
    SELECT id INTO v_existing_voucher_id
    FROM vouchers 
    WHERE UPPER(code) = UPPER(trim(p_code));
    
    IF v_existing_voucher_id IS NOT NULL THEN
        success := false;
        message := 'Voucher code already exists';
        voucher_id := NULL;
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Create new voucher
    BEGIN
        INSERT INTO vouchers (code, label) 
        VALUES (UPPER(trim(p_code)), p_label)
        RETURNING id INTO v_new_voucher_id;
        
        success := true;
        message := 'Voucher created successfully';
        voucher_id := v_new_voucher_id;
        
    EXCEPTION WHEN OTHERS THEN
        success := false;
        message := 'Error creating voucher: ' || SQLERRM;
        voucher_id := NULL;
    END;
    
    RETURN NEXT;
END;
$$;

-- Function to toggle voucher active status
CREATE OR REPLACE FUNCTION toggle_voucher_status(
    p_voucher_id UUID
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    new_status BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_status BOOLEAN;
BEGIN
    -- Get current status
    SELECT is_active INTO v_current_status
    FROM vouchers 
    WHERE id = p_voucher_id;
    
    IF v_current_status IS NULL THEN
        success := false;
        message := 'Voucher not found';
        new_status := NULL;
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Toggle status
    BEGIN
        UPDATE vouchers 
        SET 
            is_active = NOT v_current_status,
            updated_at = NOW()
        WHERE id = p_voucher_id;
        
        success := true;
        message := 'Voucher status updated successfully';
        new_status := NOT v_current_status;
        
    EXCEPTION WHEN OTHERS THEN
        success := false;
        message := 'Error updating voucher status: ' || SQLERRM;
        new_status := v_current_status;
    END;
    
    RETURN NEXT;
END;
$$;

-- =============================================
-- 4. CREATE ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on tables
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_usages ENABLE ROW LEVEL SECURITY;

-- Vouchers policies
-- Admins can do everything
CREATE POLICY "Admins can manage vouchers" ON vouchers
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Users can only read active vouchers for validation
CREATE POLICY "Users can read active vouchers" ON vouchers
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Voucher usages policies
-- Admins can see all usages
CREATE POLICY "Admins can see all voucher usages" ON voucher_usages
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Users can only see their own usages
CREATE POLICY "Users can see own voucher usages" ON voucher_usages
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Users can insert their own voucher usage
CREATE POLICY "Users can create own voucher usage" ON voucher_usages
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- =============================================
-- 5. CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for vouchers table
DROP TRIGGER IF EXISTS update_vouchers_updated_at ON vouchers;
CREATE TRIGGER update_vouchers_updated_at
    BEFORE UPDATE ON vouchers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. INSERT SAMPLE DATA (OPTIONAL)
-- =============================================

-- Insert sample vouchers for testing
INSERT INTO vouchers (code, label, credits) VALUES 
    ('WELCOME2024', 'Welcome Bonus Voucher', 0),
    ('STUDENT50', 'Student Discount Voucher', 0),
    ('PARTNER01', 'Partner Referral Voucher', 0)
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- 7. GRANT PERMISSIONS
-- =============================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION validate_voucher_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION apply_voucher_to_subscription(UUID, TEXT, INTEGER, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION get_voucher_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION create_voucher(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_voucher_status(UUID) TO authenticated;

-- =============================================
-- SETUP COMPLETE
-- =============================================

-- Display setup completion message
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'MedQuest Voucher System Setup Complete!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '- vouchers';
    RAISE NOTICE '- voucher_usages';
    RAISE NOTICE 'Functions created:';
    RAISE NOTICE '- validate_voucher_code()';
    RAISE NOTICE '- apply_voucher_to_subscription()';
    RAISE NOTICE '- get_voucher_stats()';
    RAISE NOTICE '- create_voucher()';
    RAISE NOTICE '- toggle_voucher_status()';
    RAISE NOTICE 'Sample vouchers created:';
    RAISE NOTICE '- WELCOME2024';
    RAISE NOTICE '- STUDENT50';
    RAISE NOTICE '- PARTNER01';
    RAISE NOTICE '==============================================';
END $$;
