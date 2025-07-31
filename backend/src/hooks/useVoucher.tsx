import { useState, useEffect } from 'react';
import { Voucher, VoucherStats } from '@/types/voucher';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useVoucher() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);

  // Load voucher statistics from Supabase
  const loadVoucherStats = async (): Promise<Voucher[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_voucher_stats') as { data: VoucherStats[] | null, error: any };
      
      if (error) {
        console.error('Error loading voucher stats:', error);
        toast.error('Failed to load voucher statistics');
        return [];
      }

      if (!data) return [];

      const voucherData: Voucher[] = data.map(item => ({
        id: item.voucher_id,
        code: item.code,
        label: item.label || undefined,
        number_of_users: item.number_of_users ?? 0,
        total_credits: item.total_credits ?? 0,
        totalMonthsSold: item.total_months_sold ?? 0,
        totalRevenue: item.total_revenue ?? 0,
        isActive: item.is_active,
        createdAt: item.created_at,
        updatedAt: item.created_at,
        credits: item.total_credits ?? 0, // for compatibility
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
          data: any[] | null, 
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
          credits: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
          number_of_users: 0,
          total_credits: 0,
          totalMonthsSold: 0,
          totalRevenue: 0,
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
        }) as { data: any[] | null, error: any };
      
      if (error) {
        console.error('Error creating voucher:', error);
        toast.error('Error creating voucher');
        return null;
      }

      if (!data || data.length === 0 || !data[0].success) {
        toast.error(data && data[0] ? data[0].message : 'Failed to create voucher');
        return null;
      }

      toast.success(data[0].message);
      await loadVoucherStats();
      return null;
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast.error('Error creating voucher');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get voucher by code
  const getVoucherByCode = (code: string): Voucher | null => {
    return vouchers.find(v => 
      v.code.toLowerCase() === code.toLowerCase() && v.isActive
    ) || null;
  };

  // Get voucher stats for a code
  const getVoucherStats = (code: string): VoucherStats | null => {
    const voucher = getVoucherByCode(code);
    if (!voucher) return null;
    return {
      voucher_id: voucher.id,
      code: voucher.code,
      label: voucher.label,
      total_credits: voucher.total_credits,
      number_of_users: voucher.number_of_users,
      is_active: voucher.isActive,
      total_months_sold: voucher.totalMonthsSold,
      total_revenue: voucher.totalRevenue,
      created_at: voucher.createdAt,
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

      if (!data || data.length === 0 || !data[0].success) {
        toast.error(data && data[0] ? data[0].message : 'Failed to update voucher status');
        return false;
      }

      toast.success(data[0].message);
      await loadVoucherStats();
      return true;
    } catch (error) {
      console.error('Error toggling voucher status:', error);
      toast.error('Error updating voucher status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes only: Simulate adding credits locally
  const addCreditsToVoucher = async (code: string, months: number): Promise<boolean> => {
    setVouchers(prev => prev.map(voucher => 
      voucher.code === code 
        ? { ...voucher, credits: (voucher.credits ?? 0) + months, total_credits: (voucher.total_credits ?? 0) + months }
        : voucher
    ));
    toast.success(`Demo: Added ${months} credits to voucher ${code}`);
    return true;
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
        }) as { data: any[] | null, error: any };
      
      if (error) {
        console.error('Error applying voucher:', error);
        toast.error('Error applying voucher to subscription');
        return false;
      }

      if (!data || data.length === 0 || !data[0].success) {
        toast.error(data && data[0] ? data[0].message : 'Failed to apply voucher');
        return false;
      }

      const result = data[0];
      toast.success(
        `${result.message}. Added ${result.credits_added} credits and ${result.bonus_days_granted} bonus days!`
      );
      await loadVoucherStats();
      return true;
    } catch (error) {
      console.error('Error applying voucher:', error);
      toast.error('Error applying voucher to subscription');
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