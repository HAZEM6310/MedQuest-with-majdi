import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Coins } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const subscriptionPlans = [
  { 
    duration: '1_month', 
    name: '1 Mois', 
    price: 15, 
    description: 'Accès complet pendant 1 mois', 
    credits: 1,
    paymentLink: 'https://sandbox.knct.me/DayrdFLTZ' // Update this with correct link
  },
  { 
    duration: '2_months', 
    name: '2 Mois', 
    price: 25, 
    description: 'Accès complet pendant 2 mois', 
    popular: false, 
    credits: 2,
    paymentLink: 'https://sandbox.knct.me/tL7s_SdQ9'
  },
  { 
    duration: '3_months', 
    name: '3 Mois', 
    price: 35, 
    description: 'Accès complet pendant 3 mois', 
    popular: true, 
    credits: 3,
    paymentLink: 'https://sandbox.knct.me/GIHVt_N7h'
  },
  { 
    duration: '6_months', 
    name: '6 Mois', 
    price: 50, 
    description: 'Accès complet pendant 6 mois', 
    credits: 6,
    paymentLink: 'https://sandbox.knct.me/znibnFRsk'
  },
  { 
    duration: '9_months', 
    name: '9 Mois', 
    price: 60, 
    description: 'Accès complet pendant 9 mois', 
    credits: 9,
    paymentLink: 'https://sandbox.knct.me/whREBOOuS'
  },
];

export default function Subscription() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userCredits, setUserCredits] = useState(0);

  // Helper function to get credits from profile data
  const getUserCredits = (profileData) => {
    if (!profileData) return 0;
    // Check both credits and credit_count fields, prefer credits if both exist
    return profileData.credits !== null && profileData.credits !== undefined
      ? profileData.credits
      : (profileData.credit_count || 0);
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchActiveSubscription();
    fetchUserCredits();
    
    // Check if returning from payment
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    const subscriptionId = urlParams.get('subscription_id');
    
    if (paymentStatus && subscriptionId) {
      handlePaymentReturn(paymentStatus, subscriptionId);
    }
  }, [user, navigate]);

  // Set initial credits from profile when it loads
  useEffect(() => {
    if (profile) {
      setUserCredits(getUserCredits(profile));
    }
  }, [profile]);

  const fetchUserCredits = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits, credit_count')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user credits:', error);
        return;
      }

      setUserCredits(getUserCredits(data));
    } catch (error) {
      console.error('Error fetching user credits:', error);
    }
  };

  const fetchActiveSubscription = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
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

  const handlePaymentReturn = async (status, subscriptionId) => {
    try {
      if (status === 'success') {
        // Update subscription status to completed
        const { error } = await supabase
          .from('subscriptions')
          .update({ 
            payment_status: 'completed',
            is_active: true,
            clicktopay_transaction_id: `ctp_${Date.now()}`
          })
          .eq('id', subscriptionId)
          .eq('user_id', user?.id);

        if (error) {
          console.error('Error updating subscription:', error);
          toast.error("Erreur lors de l'activation de l'abonnement");
          return;
        }

        // Fetch updated profile to get latest credits
        const { data: updatedProfile, error: profileError } = await supabase
          .from('profiles')
          .select('credits, credit_count')
          .eq('id', user?.id)
          .single();

        if (profileError) {
          console.error('Error fetching updated profile:', profileError);
        } else {
          // Update local credit count
          const newCredits = getUserCredits(updatedProfile);
          setUserCredits(newCredits);
          
          toast.success(`Paiement confirmé! Abonnement activé. Vous avez maintenant ${newCredits} crédits!`);
        }
        
        // Clean URL and refresh
        window.history.replaceState({}, document.title, window.location.pathname);
        fetchActiveSubscription();
        
      } else if (status === 'cancelled') {
        // Update subscription status to failed
        await supabase
          .from('subscriptions')
          .update({ 
            payment_status: 'failed'
          })
          .eq('id', subscriptionId)
          .eq('user_id', user?.id);
          
        toast.error("Paiement annulé");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      console.error('Payment return handling error:', error);
      toast.error("Erreur lors du traitement du paiement");
    }
  };

  const handleSubscribe = async (plan) => {
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
          payment_status: 'pending',
          is_active: false
        })
        .select()
        .single();

      if (error) {
        console.error('Subscription creation error:', error);
        throw error;
      }

      // Store subscription info for return handling
      const subscriptionInfo = {
        id: data.id,
        plan: plan.name,
        price: plan.price,
        credits: plan.credits,
        userId: user.id
      };
      
      sessionStorage.setItem('pending_subscription', JSON.stringify(subscriptionInfo));
      
      toast.success(`Redirection vers la page de paiement pour ${plan.name}...`);
      
      // Redirect to the specific payment link for this plan
      window.location.href = plan.paymentLink;

    } catch (error) {
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
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-600" />
                <span>Accès complet à tous les QCM</span>
              </div>
              {userCredits > 0 && (
                <div className="flex items-center space-x-2">
                  <Coins className="h-5 w-5 text-yellow-600" />
                  <span>Vous avez {userCredits} crédits disponibles</span>
                </div>
              )}
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
                <li className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <span className="font-semibold">+{plan.credits} crédits inclus</span>
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
        <p>Les crédits sont ajoutés automatiquement après paiement</p>
      </div>
    </div>
  );
}