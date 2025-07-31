import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useVoucher } from '@/hooks/useVoucher';
import { useLanguage } from '@/hooks/useLanguage';
import { Voucher, VoucherStats } from '@/types/voucher';
import { Copy, Plus, TrendingUp, Users, CreditCard, DollarSign, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

export function VoucherManagement() {
  const { language } = useLanguage();
  const { 
    vouchers, 
    loading, 
    createVoucher, 
    getVoucherStats, 
    addCreditsToVoucher,
    toggleVoucherStatus,
    loadVoucherStats
  } = useVoucher();
  
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherLabel, setNewVoucherLabel] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [voucherStats, setVoucherStats] = useState<VoucherStats | null>(null);

  const translations = {
    en: {
      title: 'Voucher Management',
      createNew: 'Create New Voucher',
      voucherCode: 'Voucher Code',
      voucherLabel: 'Label (Optional)',
      createButton: 'Create Voucher',
      voucherStats: 'Voucher Statistics',
      totalCredits: 'Total Credits',
      availableCredits: 'Available Credits',
      usedCredits: 'Used Credits',
      totalPayments: 'Total Payments',
      totalUsers: 'Total Users',
      totalRevenue: 'Total Revenue',
      copyCode: 'Copy Code',
      copied: 'Copied to clipboard!',
      selectVoucher: 'Select a voucher to view statistics',
      noVouchers: 'No vouchers available',
      simulatePayment: 'Simulate Payment',
      monthsPaid: 'Months Paid',
      addCredits: 'Add Credits',
      toggleStatus: 'Toggle Status',
      active: 'Active',
      inactive: 'Inactive',
      refresh: 'Refresh',
    },
    fr: {
      title: 'Gestion des Bons',
      createNew: 'Créer un Nouveau Bon',
      voucherCode: 'Code de Bon',
      voucherLabel: 'Libellé (Optionnel)',
      createButton: 'Créer le Bon',
      voucherStats: 'Statistiques du Bon',
      totalCredits: 'Crédits Totaux',
      availableCredits: 'Crédits Disponibles',
      usedCredits: 'Crédits Utilisés',
      totalPayments: 'Paiements Totaux',
      totalUsers: 'Utilisateurs Totaux',
      totalRevenue: 'Revenus Totaux',
      copyCode: 'Copier le Code',
      copied: 'Copié dans le presse-papiers!',
      selectVoucher: 'Sélectionnez un bon pour voir les statistiques',
      noVouchers: 'Aucun bon disponible',
      simulatePayment: 'Simuler un Paiement',
      monthsPaid: 'Mois Payés',
      addCredits: 'Ajouter des Crédits',
      toggleStatus: 'Basculer le Statut',
      active: 'Actif',
      inactive: 'Inactif',
      refresh: 'Actualiser',
    },
  };

  const t = translations[language];

  useEffect(() => {
    if (selectedVoucher) {
      const stats = getVoucherStats(selectedVoucher.code);
      setVoucherStats(stats);
    }
  }, [selectedVoucher, vouchers, getVoucherStats]);

  const handleCreateVoucher = async () => {
    if (!newVoucherCode.trim()) return;
    
    const voucher = await createVoucher(newVoucherCode.trim(), newVoucherLabel.trim() || undefined);
    if (voucher) {
      setNewVoucherCode('');
      setNewVoucherLabel('');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(t.copied);
  };

  const handleSimulatePayment = async () => {
    if (!selectedVoucher) return;
    
    // Simulate adding 3 months worth of credits (3 credits)
    const success = await addCreditsToVoucher(selectedVoucher.code, 3);
    if (success) {
      // Refresh stats
      const updatedStats = getVoucherStats(selectedVoucher.code);
      setVoucherStats(updatedStats);
    }
  };

  const handleToggleStatus = async (voucher: Voucher) => {
    const success = await toggleVoucherStatus(voucher.id);
    if (success) {
      // If this is the selected voucher, update the selection
      if (selectedVoucher?.id === voucher.id) {
        const updatedVoucher = vouchers.find(v => v.id === voucher.id);
        if (updatedVoucher) {
          setSelectedVoucher(updatedVoucher);
        }
      }
    }
  };

  const handleRefresh = async () => {
    await loadVoucherStats();
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">{t.title}</h1>
        </div>
        <Button onClick={handleRefresh} disabled={loading} variant="outline">
          {t.refresh}
        </Button>
      </div>

      {/* Create New Voucher */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t.createNew}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="voucherCode">{t.voucherCode}</Label>
              <Input
                id="voucherCode"
                value={newVoucherCode}
                onChange={(e) => setNewVoucherCode(e.target.value)}
                placeholder="WELCOME2024"
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="voucherLabel">{t.voucherLabel}</Label>
              <Input
                id="voucherLabel"
                value={newVoucherLabel}
                onChange={(e) => setNewVoucherLabel(e.target.value)}
                placeholder="Welcome bonus voucher"
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleCreateVoucher}
                disabled={loading || !newVoucherCode.trim()}
              >
                {t.createButton}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voucher List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t.voucherStats}
          </CardTitle>
        </CardHeader>
        <CardContent>
  {vouchers.length === 0 ? (
    <p className="text-muted-foreground text-center py-4">
      No vouchers available
    </p>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Code</th>
            <th className="px-4 py-2 text-left">Users</th>
            <th className="px-4 py-2 text-left">Credits</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((voucher) => (
            <tr key={voucher.id} className="border-b">
              <td className="px-4 py-2 font-semibold">{voucher.code}</td>
              <td className="px-4 py-2">{voucher.number_of_users}</td>
<td className="px-4 py-2">{voucher.total_credits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</CardContent>
      </Card>
    </div>
  );
}
