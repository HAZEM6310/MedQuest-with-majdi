# MedQuest Voucher System - Implementation Guide

## 🚀 Quick Setup

1. **Run the SQL script in Supabase**:
   - Go to your Supabase dashboard
   - Navigate to the SQL Editor
   - Copy and paste the entire `supabase_voucher_setup.sql` file
   - Execute the script

2. **Verify setup**:
   - Check that tables `vouchers` and `voucher_usages` are created
   - Verify sample vouchers exist: `WELCOME2024`, `STUDENT50`, `PARTNER01`

---

## 📊 Database Schema

### Tables Created:

#### `vouchers`
- `id` (uuid, primary key)
- `code` (text, unique) - The voucher code users enter
- `label` (text, nullable) - Optional human-readable name
- `credits` (integer, default 0) - Number of credits earned
- `is_active` (boolean, default true) - Whether voucher can be used
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `voucher_usages` 
- `id` (uuid, primary key)
- `user_id` (uuid, FK to auth.users)
- `voucher_id` (uuid, FK to vouchers)
- `months_paid` (integer) - Number of months user subscribed for
- `subscription_start_date` (timestamp)
- `subscription_end_date` (timestamp)
- `payment_amount` (decimal, nullable)
- `created_at` (timestamp)

#### `profiles` (enhanced)
- Added `voucher_code` (text) - Stores the voucher code used by user
- Added `subscription_end_date` (timestamp) - User's subscription end date
- Added `bonus_days` (integer) - Bonus days granted from vouchers

---

## 🔧 Function Usage Examples

### 1. Validate Voucher Code (Frontend)

```javascript
// In your React component
const validateVoucher = async (voucherCode) => {
  const { data, error } = await supabase
    .rpc('validate_voucher_code', { voucher_code_input: voucherCode });
  
  if (error) {
    console.error('Error:', error);
    return { isValid: false, message: 'Error validating voucher' };
  }
  
  const result = data[0];
  return {
    isValid: result.is_valid,
    message: result.message,
    voucherId: result.voucher_id
  };
};

// Usage in signup form
const handleVoucherValidation = async () => {
  if (voucherCode.trim()) {
    const validation = await validateVoucher(voucherCode);
    if (!validation.isValid) {
      toast.error(validation.message);
      return false;
    }
    toast.success(validation.message);
  }
  return true;
};
```

### 2. Apply Voucher After Payment (Backend/Webhook)

```javascript
// After successful payment processing
const applyVoucherToSubscription = async (userId, voucherCode, monthsPaid, paymentAmount) => {
  const { data, error } = await supabase
    .rpc('apply_voucher_to_subscription', {
      p_user_id: userId,
      p_voucher_code: voucherCode,
      p_months_paid: monthsPaid,
      p_payment_amount: paymentAmount
    });
  
  if (error) {
    console.error('Error applying voucher:', error);
    return { success: false, message: error.message };
  }
  
  const result = data[0];
  return {
    success: result.success,
    message: result.message,
    creditsAdded: result.credits_added,
    bonusDaysGranted: result.bonus_days_granted
  };
};

// Usage after payment webhook
app.post('/webhook/payment-success', async (req, res) => {
  const { userId, subscriptionMonths, paymentAmount, voucherCode } = req.body;
  
  // Process payment first...
  
  // Then apply voucher if provided
  if (voucherCode) {
    const voucherResult = await applyVoucherToSubscription(
      userId, 
      voucherCode, 
      subscriptionMonths, 
      paymentAmount
    );
    
    if (voucherResult.success) {
      console.log(`Voucher applied: +${voucherResult.creditsAdded} credits, +${voucherResult.bonusDaysGranted} bonus days`);
    }
  }
  
  res.json({ success: true });
});
```

### 3. Get Voucher Statistics (Admin Dashboard)

```javascript
// In your admin dashboard component
const loadVoucherStats = async () => {
  const { data, error } = await supabase
    .rpc('get_voucher_stats');
  
  if (error) {
    console.error('Error loading voucher stats:', error);
    return [];
  }
  
  return data.map(voucher => ({
    id: voucher.voucher_id,
    code: voucher.voucher_code,
    label: voucher.voucher_label,
    credits: voucher.total_credits,
    isActive: voucher.is_active,
    totalUsers: voucher.total_users,
    totalMonthsSold: voucher.total_months_sold,
    totalRevenue: voucher.total_revenue,
    createdAt: voucher.created_at
  }));
};

// Usage in React component
const [voucherStats, setVoucherStats] = useState([]);

useEffect(() => {
  loadVoucherStats().then(setVoucherStats);
}, []);
```

### 4. Create New Voucher (Admin Only)

```javascript
// In your admin voucher management component
const createNewVoucher = async (code, label = null) => {
  const { data, error } = await supabase
    .rpc('create_voucher', {
      p_code: code,
      p_label: label
    });
  
  if (error) {
    console.error('Error creating voucher:', error);
    return { success: false, message: error.message };
  }
  
  const result = data[0];
  return {
    success: result.success,
    message: result.message,
    voucherId: result.voucher_id
  };
};

// Usage in form submission
const handleCreateVoucher = async (e) => {
  e.preventDefault();
  
  const result = await createNewVoucher(voucherCode, voucherLabel);
  
  if (result.success) {
    toast.success(result.message);
    setVoucherCode('');
    setVoucherLabel('');
    // Refresh voucher list
    loadVoucherStats().then(setVoucherStats);
  } else {
    toast.error(result.message);
  }
};
```

### 5. Toggle Voucher Status (Admin Only)

```javascript
// Toggle active/inactive status
const toggleVoucherStatus = async (voucherId) => {
  const { data, error } = await supabase
    .rpc('toggle_voucher_status', {
      p_voucher_id: voucherId
    });
  
  if (error) {
    console.error('Error toggling voucher status:', error);
    return { success: false, message: error.message };
  }
  
  const result = data[0];
  return {
    success: result.success,
    message: result.message,
    newStatus: result.new_status
  };
};
```

---

## 📋 Implementation Checklist

### Frontend (React) Tasks:
- [ ] Update signup form to include optional voucher field ✅ (Already done)
- [ ] Add voucher validation on form submission
- [ ] Display voucher benefits (+3 days) to users
- [ ] Create admin voucher management interface ✅ (Already done)
- [ ] Add voucher statistics dashboard
- [ ] Implement voucher creation form for admins

### Backend Integration Tasks:
- [ ] Set up payment webhook to call `apply_voucher_to_subscription()`
- [ ] Add voucher validation to signup process
- [ ] Create admin-only API endpoints for voucher management
- [ ] Add voucher usage tracking in user profiles

### Testing Tasks:
- [ ] Test voucher validation with valid/invalid codes
- [ ] Test credit increment after successful payments
- [ ] Test bonus day calculation
- [ ] Test admin voucher creation and management
- [ ] Test RLS policies (users can't access other's data)

---

## 🔒 Security Features

The system includes Row Level Security (RLS) policies:

- **Vouchers**: Only admins can create/modify, users can read active ones
- **Voucher Usages**: Users can only see their own usage, admins see all
- **Functions**: All include proper validation and error handling
- **Constraints**: Database-level validation for data integrity

---

## 🎯 Business Logic Summary

1. **Voucher Creation**: Only admins can create vouchers with unique codes
2. **User Signup**: Users optionally enter voucher code during registration
3. **Payment Processing**: After successful payment, voucher gets +1 credit per month paid
4. **User Benefits**: Users get +3 bonus days added to their subscription
5. **Tracking**: Full audit trail of voucher usage and credit accumulation
6. **Analytics**: Admin dashboard shows voucher performance metrics

---

## 📞 Support

If you encounter any issues:
1. Check Supabase logs for function execution errors
2. Verify RLS policies are working correctly
3. Test with sample vouchers: `WELCOME2024`, `STUDENT50`, `PARTNER01`
4. Ensure your user has admin privileges for voucher management features
