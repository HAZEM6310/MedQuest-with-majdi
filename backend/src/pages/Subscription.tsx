
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const subscriptionPlans = [
  { duration: '1_month', name: '1 Mois', price: 15, description: 'Accès complet pendant 1 mois' },
  { duration: '2_months', name: '2 Mois', price: 25, description: 'Accès complet pendant 2 mois', popular: false },
  { duration: '3_months', name: '3 Mois', price: 35, description: 'Accès complet pendant 3 mois', popular: true },
  { duration: '6_months', name: '6 Mois', price: 50, description: 'Accès complet pendant 6 mois' },
  { duration: '9_months', name: '9 Mois', price: 60, description: 'Accès complet pendant 9 mois' },
];

export default function Subscription() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchActiveSubscription();
  }, [user, navigate]);

  const fetchActiveSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return;
      }

      setActiveSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleSubscribe = async (plan: any) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Calculate end date
      const startDate = new Date();
      const endDate = new Date(startDate);
      
      switch (plan.duration) {
        case '1_month':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case '2_months':
          endDate.setMonth(endDate.getMonth() + 2);
          break;
        case '3_months':
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case '6_months':
          endDate.setMonth(endDate.getMonth() + 6);
          break;
        case '9_months':
          endDate.setMonth(endDate.getMonth() + 9);
          break;
      }

      // Create subscription record
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          duration: plan.duration,
          price_tnd: plan.price,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          payment_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Here you would integrate with ClickToPay
      // For now, we'll simulate a successful payment
      toast.success(`Redirection vers ClickToPay pour ${plan.price} TND...`);
      
      // Simulate payment completion (in real app, this would be handled by ClickToPay webhook)
      setTimeout(async () => {
        await supabase
          .from('subscriptions')
          .update({ 
            payment_status: 'completed',
            is_active: true,
            clicktopay_transaction_id: `sim_${Date.now()}`
          })
          .eq('id', data.id);
          
        toast.success("Paiement confirmé! Votre abonnement est maintenant actif.");
        fetchActiveSubscription();
      }, 2000);

    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || "Erreur lors de l'abonnement");
    } finally {
      setIsLoading(false);
    }
  };

  if (activeSubscription) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Abonnement Actif</CardTitle>
              <CardDescription>
                Votre abonnement est actif jusqu'au {new Date(activeSubscription.end_date).toLocaleDateString('fr-FR')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-600" />
                <span>Accès complet à tous les QCM</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/")} className="w-full">
                Commencer les QCM
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Choisissez votre abonnement</h1>
        <p className="text-muted-foreground">
          Accédez à tous les QCM de médecine avec un seul abonnement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {subscriptionPlans.map((plan) => (
          <Card key={plan.duration} className={`relative ${plan.popular ? 'border-secondary shadow-lg scale-105' : ''}`}>
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-secondary">
                Populaire
              </Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-secondary">
                {plan.price} <span className="text-sm font-normal text-muted-foreground">TND</span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Accès illimité aux QCM</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Toutes les années d'étude</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Suivi des performances</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Explications détaillées</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Accès sur 1 appareil</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSubscribe(plan)}
                disabled={isLoading}
                className="w-full bg-secondary hover:bg-secondary/90"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isLoading ? "Traitement..." : "S'abonner"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8 text-sm text-muted-foreground">
        <p>Paiement sécurisé via ClickToPay</p>
        <p>Un seul appareil autorisé par compte</p>
      </div>
    </div>
  );
}
