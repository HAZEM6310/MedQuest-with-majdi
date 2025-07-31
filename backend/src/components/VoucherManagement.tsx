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

  // Add debug logging when vouchers change
  useEffect(() => {
    console.log(`[${new Date().toISOString()}] HAZEM6310: Vouchers in component:`, vouchers);
  }, [vouchers]);

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
    console.log(`[${new Date().toISOString()}] HAZEM6310: Refreshing voucher data`);
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
              {t.noVouchers}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Code</th>
                    <th className="px-4 py-2 text-left">Users</th>
                    <th className="px-4 py-2 text-left">Credits</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map((voucher) => (
                    <tr key={voucher.id} className="border-b">
                      <td className="px-4 py-2 font-semibold">
                        <div className="flex items-center gap-2">
                          {voucher.code}
                          <button 
                            onClick={() => handleCopyCode(voucher.code)}
                            className="text-gray-500 hover:text-blue-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        {voucher.label && (
                          <span className="text-xs text-gray-500 block">{voucher.label}</span>
                        )}
                      </td>
                      <td className="px-4 py-2">{voucher.number_of_users || 0}</td>
                      {/* Use voucher.credits instead of voucher.total_credits */}
                      <td className="px-4 py-2">{voucher.credits || 0}</td>
                      <td className="px-4 py-2">
                        <Badge variant={voucher.isActive ? "success" : "destructive"}>
                          {voucher.isActive ? t.active : t.inactive}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedVoucher(voucher)}
                          >
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Stats
                          </Button>
                          <Button
                            size="sm"
                            variant={voucher.isActive ? "destructive" : "outline"}
                            onClick={() => handleToggleStatus(voucher)}
                          >
                            {voucher.isActive ? 
                              <ToggleRight className="h-4 w-4 mr-1" /> : 
                              <ToggleLeft className="h-4 w-4 mr-1" />
                            }
                            {voucher.isActive ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Debug info to help troubleshoot */}
          {vouchers.length > 0 && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
              <p className="font-mono">Debug info (HAZEM6310 - {new Date().toISOString()}):</p>
              <pre className="overflow-auto max-h-32">
                {JSON.stringify(vouchers.map(v => ({
                  code: v.code,
                  credits: v.credits,
                  total_credits: v.total_credits,
                  users: v.number_of_users
                })), null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Voucher Details */}
      {selectedVoucher && (
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center justify-between">
              <div>Voucher: {selectedVoucher.code}</div>
              <Badge variant={selectedVoucher.isActive ? "success" : "destructive"}>
                {selectedVoucher.isActive ? t.active : t.inactive}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">{t.totalUsers}</div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-lg font-semibold">
                    {voucherStats?.number_of_users || 0}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">{t.availableCredits}</div>
                <div className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <span className="text-lg font-semibold">
                    {voucherStats?.credit_count || 0}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">{t.usedCredits}</div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <span className="text-lg font-semibold">
                    {voucherStats?.total_credits || 0}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">{t.totalRevenue}</div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-lg font-semibold">
                    {formatCurrency(voucherStats?.total_revenue)}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">{t.simulatePayment}</div>
                <Button 
                  size="sm" 
                  onClick={handleSimulatePayment}
                  className="mt-1"
                >
                  {t.addCredits} (3)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}