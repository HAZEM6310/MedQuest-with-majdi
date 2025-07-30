import { useState, useEffect } from 'react';
import { Voucher, VoucherStats } from '@/types/voucher';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Enhanced interfaces for Supabase integration
interface VoucherValidationResult {
  voucher_id: string | null;
  voucher_code: string;
  voucher_label: string | null;
  is_valid: boolean;
  message: string;
}

interface VoucherCreationResult {
  success: boolean;
  message: string;
  voucher_id: string | null;
}

interface VoucherApplicationResult {
  success: boolean;
  message: string;
  credits_added: number;
  bonus_days_granted: number;
}

interface VoucherStatsResult {
  voucher_id: string;
  voucher_code: string;
  voucher_label: string | null;
  total_credits: number;
  is_active: boolean;
  total_users: number;
  total_months_sold: number;
  total_revenue: number;
  created_at: string;
}

export function useVoucher() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);

  // Load voucher statistics from Supabase
  const loadVoucherStats = async (): Promise<Voucher[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_voucher_stats') as { data: VoucherStatsResult[] | null, error: any };
      
      if (error) {
        console.error('Error loading voucher stats:', error);
        toast.error('Failed to load voucher statistics');
        return [];
      }

      if (!data) return [];

      const voucherData: Voucher[] = data.map(item => ({
        id: item.voucher_id,
        code: item.voucher_code,
        label: item.voucher_label || undefined,
        credits: item.total_credits,
        createdAt: item.created_at,
        updatedAt: item.created_at, // Using created_at as fallback
        isActive: item.is_active,
        totalUsers: item.total_users,
        totalMonthsSold: item.total_months_sold,
        totalRevenue: item.total_revenue,
      }));

      setVouchers(voucherData);
      return voucherData;
    } catch (error) {
      console.error('Error loading voucher stats:', error);
      toast.error('Failed to load voucher statistics');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load vouchers on hook initialization
  useEffect(() => {
    loadVoucherStats();
  }, []);

  // Validate voucher code
  const validateVoucher = async (code: string): Promise<Voucher | null> => {
    if (!code.trim()) {
      toast.error('Please enter a voucher code');
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('validate_voucher_code', { voucher_code_input: code }) as { 
          data: VoucherValidationResult[] | null, 
          error: any 
        };
      
      if (error) {
        console.error('Error validating voucher:', error);
        toast.error('Error validating voucher code');
        return null;
      }

      if (!data || data.length === 0) {
        toast.error('Voucher code not found');
        return null;
      }

      const result = data[0];
      
      if (result.is_valid) {
        toast.success(result.message);
        return {
          id: result.voucher_id!,
          code: result.voucher_code,
          label: result.voucher_label || undefined,
          credits: 0, // Will be fetched separately if needed
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
        };
      } else {
        toast.error(result.message);
        return null;
      }
    } catch (error) {
      console.error('Error validating voucher:', error);
      toast.error('Error validating voucher code');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create new voucher (admin only)
  const createVoucher = async (code: string, label?: string): Promise<Voucher | null> => {
    if (!code.trim()) {
      toast.error('Voucher code cannot be empty');
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('create_voucher', { 
          p_code: code.trim(), 
          p_label: label || null 
        }) as { data: VoucherCreationResult[] | null, error: any };
      
      if (error) {
        console.error('Error creating voucher:', error);
        toast.error('Error creating voucher');
        return null;
      }

      if (!data || data.length === 0) {
        toast.error('Failed to create voucher');
        return null;
      }

      const result = data[0];
      
      if (result.success) {
        toast.success(result.message);
        
        // Refresh voucher list
        await loadVoucherStats();
        
        return {
          id: result.voucher_id!,
          code: code.toUpperCase(),
          label: label,
          credits: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
        };
      } else {
        toast.error(result.message);
        return null;
      }
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast.error('Error creating voucher');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Apply voucher to subscription (called after payment)
  const applyVoucherToSubscription = async (
    userId: string,
    voucherCode: string, 
    monthsPaid: number, 
    paymentAmount?: number
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('apply_voucher_to_subscription', {
          p_user_id: userId,
          p_voucher_code: voucherCode,
          p_months_paid: monthsPaid,
          p_payment_amount: paymentAmount || null,
        }) as { data: VoucherApplicationResult[] | null, error: any };
      
      if (error) {
        console.error('Error applying voucher:', error);
        toast.error('Error applying voucher to subscription');
        return false;
      }

      if (!data || data.length === 0) {
        toast.error('Failed to apply voucher');
        return false;
      }

      const result = data[0];
      
      if (result.success) {
        toast.success(
          `${result.message}. Added ${result.credits_added} credits and ${result.bonus_days_granted} bonus days!`
        );
        
        // Refresh voucher list to show updated credits
        await loadVoucherStats();
        
        return true;
      } else {
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      console.error('Error applying voucher:', error);
      toast.error('Error applying voucher to subscription');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Simulate adding credits (for demo purposes)
  const addCreditsToVoucher = async (code: string, months: number): Promise<boolean> => {
    // This simulates a payment by calling the apply function with a demo user
    // In production, this would be called from your payment webhook
    const demoUserId = 'demo-user-' + Date.now();
    
    toast.info(`Simulating payment of ${months} months for voucher ${code}...`);
    
    // For demo, we'll just update the local voucher data
    setVouchers(prev => prev.map(voucher => 
      voucher.code === code 
        ? { ...voucher, credits: voucher.credits + months }
        : voucher
    ));
    
    toast.success(`Demo: Added ${months} credits to voucher ${code}`);
    return true;
  };

  // Get voucher by code
  const getVoucherByCode = (code: string): Voucher | null => {
    return vouchers.find(v => 
      v.code.toLowerCase() === code.toLowerCase() && v.isActive
    ) || null;
  };

  // Get voucher stats
  const getVoucherStats = (code: string): VoucherStats | null => {
    const voucher = getVoucherByCode(code);
    if (!voucher) return null;

    return {
      totalCredits: voucher.credits,
      usedCredits: 0, // Would need additional query for this
      availableCredits: voucher.credits,
      totalPayments: voucher.totalMonthsSold || voucher.credits,
    };
  };

  // Toggle voucher status (admin only)
  const toggleVoucherStatus = async (voucherId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('toggle_voucher_status', { p_voucher_id: voucherId });
      
      if (error) {
        console.error('Error toggling voucher status:', error);
        toast.error('Error updating voucher status');
        return false;
      }

      if (!data || data.length === 0) {
        toast.error('Failed to update voucher status');
        return false;
      }

      const result = data[0];
      
      if (result.success) {
        toast.success(result.message);
        
        // Refresh voucher list
        await loadVoucherStats();
        
        return true;
      } else {
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      console.error('Error toggling voucher status:', error);
      toast.error('Error updating voucher status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    vouchers,
    loading,
    validateVoucher,
    createVoucher,
    addCreditsToVoucher,
    applyVoucherToSubscription,
    getVoucherByCode,
    getVoucherStats,
    toggleVoucherStatus,
    loadVoucherStats,
  };
}
