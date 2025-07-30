// Voucher types and interfaces
export interface Voucher {
  id: string;
  code: string;
  label?: string;
  credits: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  totalUsers?: number;
  totalMonthsSold?: number;
  totalRevenue?: number;
}

export interface VoucherUsage {
  id: string;
  userId: string;
  voucherId: string;
  monthsPaid: number;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  paymentAmount?: number;
  createdAt: string;
}

export interface VoucherStats {
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
  totalPayments: number;
}
