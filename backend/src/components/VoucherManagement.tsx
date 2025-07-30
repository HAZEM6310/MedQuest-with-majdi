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
              {t.noVouchers}
            </p>
          ) : (
            <div className="space-y-4">
              {/* Voucher Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vouchers.map((voucher) => (
                  <Card 
                    key={voucher.id}
                    className={`cursor-pointer transition-all ${
                      selectedVoucher?.id === voucher.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedVoucher(voucher)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{voucher.code}</h3>
                            {voucher.label && (
                              <p className="text-sm text-muted-foreground">{voucher.label}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={voucher.isActive ? 'default' : 'secondary'}>
                              {voucher.isActive ? t.active : t.inactive}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {voucher.credits}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {t.totalCredits}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                              {voucher.totalUsers || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {t.totalUsers}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(voucher.code);
                            }}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            {t.copyCode}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(voucher);
                            }}
                            disabled={loading}
                          >
                            {voucher.isActive ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Voucher Statistics */}
              {selectedVoucher && (
                <div className="mt-6 p-6 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {selectedVoucher.code} - {t.voucherStats}
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedVoucher.credits}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t.totalCredits}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedVoucher.totalUsers || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t.totalUsers}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedVoucher.totalMonthsSold || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t.totalPayments}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(selectedVoucher.totalRevenue)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t.totalRevenue}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        <Badge variant={selectedVoucher.isActive ? 'default' : 'secondary'}>
                          {selectedVoucher.isActive ? t.active : t.inactive}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Status
                      </div>
                    </div>
                  </div>

                  {/* Simulate Payment Button */}
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={handleSimulatePayment}
                      disabled={loading}
                      variant="outline"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      {t.simulatePayment} (+3 {t.monthsPaid})
                    </Button>
                    <Button 
                      onClick={() => handleToggleStatus(selectedVoucher)}
                      disabled={loading}
                      variant="outline"
                    >
                      {selectedVoucher.isActive ? (
                        <ToggleLeft className="h-4 w-4 mr-2" />
                      ) : (
                        <ToggleRight className="h-4 w-4 mr-2" />
                      )}
                      {t.toggleStatus}
                    </Button>
                  </div>
                </div>
              )}

              {selectedVoucher && !voucherStats && (
                <p className="text-center text-muted-foreground py-4">
                  {t.selectVoucher}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
