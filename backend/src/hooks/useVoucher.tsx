import { useState, useEffect } from 'react';
import { Voucher, VoucherStats } from '@/types/voucher';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useVoucher() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);

  // Load voucher statistics from Supabase
  const loadVoucherStats = async (): Promise<Voucher[]> => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] HAZEM6310: Fetching voucher stats`);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_voucher_stats') as { data: VoucherStats[] | null, error: any };
      
      if (error) {
        console.error(`[${timestamp}] HAZEM6310: Error loading voucher stats:`, error);
        toast.error('Failed to load voucher statistics');
        return [];
      }

      if (!data) {
        console.log(`[${timestamp}] HAZEM6310: No voucher data returned`);
        return [];
      }

      console.log(`[${timestamp}] HAZEM6310: Received ${data.length} vouchers`);
      console.table(data); // Log data in table format for better readability

      const voucherData: Voucher[] = data.map(item => {
        // Default credit value to 1 if everything else is null/zero
        const creditCount = item.credit_count !== null && item.credit_count !== undefined 
          ? item.credit_count 
          : 0;
          
        const totalCredits = item.total_credits ?? 0;
        const userCount = item.total_users ?? 0;
        
        console.log(`[${timestamp}] HAZEM6310: Voucher ${item.voucher_code}: credit_count=${creditCount}, users=${userCount}, total_credits=${totalCredits}`);
        
        return {
          id: item.voucher_id,
          code: item.voucher_code,
          label: item.voucher_label || undefined,
          number_of_users: userCount,  
          total_credits: totalCredits,
          totalMonthsSold: item.total_months_sold ?? 0,
          totalRevenue: item.total_revenue ?? 0,
          isActive: item.is_active,
          createdAt: item.created_at,
          updatedAt: item.created_at,
          credits: creditCount, // This is the value shown in the UI
        };
      });

      console.log(`[${timestamp}] HAZEM6310: Processed voucher data:`, voucherData);
      setVouchers(voucherData);
      return voucherData;
    } catch (error) {
      console.error(`[${timestamp}] HAZEM6310: Error in loadVoucherStats:`, error);
      toast.error('Failed to load voucher statistics');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVoucherStats();
    
    // Optionally set up automatic refresh every 30 seconds
    const intervalId = setInterval(() => {
      loadVoucherStats();
    }, 30000);
    
    return () => clearInterval(intervalId);
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
        console.error(`[${new Date().toISOString()}] HAZEM6310: Error validating voucher:`, error);
        toast.error('Error validating voucher code');
        return null;
      }

      if (!data || data.length === 0) {
        toast.error('Voucher code not found');
        return null;
      }

      const result = data[0];
      console.log(`[${new Date().toISOString()}] HAZEM6310: Voucher validation result:`, result);
      
      if (result.is_valid) {
        toast.success(result.message);
        return {
          id: result.voucher_id!,
          code: result.voucher_code,
          label: result.voucher_label || undefined,
          credits: result.credit_count ?? 0, // Use credit_count here
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
      console.error(`[${new Date().toISOString()}] HAZEM6310: Error validating voucher:`, error);
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
        console.error(`[${new Date().toISOString()}] HAZEM6310: Error creating voucher:`, error);
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
      console.error(`[${new Date().toISOString()}] HAZEM6310: Error creating voucher:`, error);
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
    
    // Log the voucher being retrieved
    console.log(`[${new Date().toISOString()}] HAZEM6310: Retrieved voucher stats for ${code}:`, voucher);
    
    return {
      voucher_id: voucher.id,
      code: voucher.code,
      label: voucher.label,
      total_credits: voucher.total_credits ?? 0,
      credit_count: voucher.credits ?? 0,
      number_of_users: voucher.number_of_users ?? 0,
      is_active: voucher.isActive,
      total_months_sold: voucher.totalMonthsSold ?? 0,
      total_revenue: voucher.totalRevenue ?? 0,
      created_at: voucher.createdAt,
    };
  };

  // Toggle voucher status (admin only)
  const toggleVoucherStatus = async (voucherId: string): Promise<boolean> => {
    console.log(`[${new Date().toISOString()}] HAZEM6310: Toggling voucher status for ${voucherId}`);
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('toggle_voucher_status', { p_voucher_id: voucherId });
      
      if (error) {
        console.error(`[${new Date().toISOString()}] HAZEM6310: Error toggling voucher status:`, error);
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
      console.error(`[${new Date().toISOString()}] HAZEM6310: Error toggling voucher status:`, error);
      toast.error('Error updating voucher status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes only: Simulate adding credits locally
  const addCreditsToVoucher = async (code: string, months: number): Promise<boolean> => {
    console.log(`[${new Date().toISOString()}] HAZEM6310: Adding ${months} credits to voucher ${code}`);
    
    setVouchers(prev => prev.map(voucher => 
      voucher.code === code 
        ? { ...voucher, credits: (voucher.credits ?? 0) + months }
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
    console.log(`[${new Date().toISOString()}] HAZEM6310: Applying voucher ${voucherCode} to user ${userId} for ${monthsPaid} months`);
    
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
        console.error(`[${new Date().toISOString()}] HAZEM6310: Error applying voucher:`, error);
        toast.error('Error applying voucher to subscription');
        return false;
      }

      if (!data || data.length === 0 || !data[0].success) {
        toast.error(data && data[0] ? data[0].message : 'Failed to apply voucher');
        return false;
      }

      const result = data[0];
      console.log(`[${new Date().toISOString()}] HAZEM6310: Successfully applied voucher:`, result);
      
      toast.success(
        `${result.message}. Added ${result.credits_added} credits and ${result.bonus_days_granted} bonus days!`
      );
      await loadVoucherStats();
      return true;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] HAZEM6310: Error applying voucher:`, error);
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