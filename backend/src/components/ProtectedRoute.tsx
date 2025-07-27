
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Smartphone } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
  courseId?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireSubscription = true, 
  courseId 
}: ProtectedRouteProps) {
  const { user, profile, isLoading, checkDeviceSession } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [deviceCheckLoading, setDeviceCheckLoading] = useState(true);
  const [hasValidDevice, setHasValidDevice] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isFreeContent, setIsFreeContent] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      checkAccess();
    }
  }, [user, isLoading, navigate, courseId]);

  const checkAccess = async () => {
    if (!user) return;

    try {
      // Check device session
      const deviceValid = await checkDeviceSession();
      setHasValidDevice(deviceValid);

      // Check if content is free
      if (courseId) {
        const { data: course, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();
        
        if (!error && course?.is_free) {
          setIsFreeContent(true);
          setHasActiveSubscription(true);
        }
      }

      if (requireSubscription && !isFreeContent) {
        // Check subscription
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .gte('end_date', new Date().toISOString())
          .single();

        setHasActiveSubscription(!!subscription);
      } else {
        setHasActiveSubscription(true);
      }
    } catch (error) {
      console.error('Access check error:', error);
    } finally {
      setDeviceCheckLoading(false);
    }
  };

  if (isLoading || deviceCheckLoading) {
    return (
      <div className="container py-8 text-center">
        <p>{t('ui.loading')}</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!hasValidDevice) {
    return (
      <div className="container py-8">
        <div className="max-w-md mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-800">{t('device.unauthorized')}</CardTitle>
              </div>
              <CardDescription>
                {t('device.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-700 mb-4">
                {t('device.contact')}
              </p>
              <Button 
                onClick={() => navigate('/auth')}
                variant="outline"
                className="w-full"
              >
                {t('device.backToLogin')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (requireSubscription && !hasActiveSubscription && !isFreeContent) {
    return (
      <div className="container py-8">
        <div className="max-w-md mx-auto">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-yellow-800">{t('subscription.required')}</CardTitle>
              </div>
              <CardDescription>
                {t('subscription.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/subscription')}
                className="w-full bg-secondary hover:bg-secondary/90"
              >
                {t('subscription.view')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
