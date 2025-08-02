import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Updated import path
import { useAuth } from '@/hooks/useAuth';

export function useStreak() {
  const [streak, setStreak] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // Update streak on app load when user is authenticated
  useEffect(() => {
    const updateStreak = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Call the RPC function to update sign-in and streak
        await supabase.rpc('update_user_sign_in');

        // Then fetch the updated streak count
        const { data, error } = await supabase
          .from('profiles')
          .select('streak_count')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setStreak(data?.streak_count || 0);
      } catch (error) {
        console.error('Error updating streak:', error);
        // Fallback - just get the current streak without updating
        try {
          const { data } = await supabase
            .from('profiles')
            .select('streak_count')
            .eq('id', user.id)
            .single();
            
          setStreak(data?.streak_count || 0);
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      updateStreak();
    }
  }, [user?.id]);

  return { streak, isLoading };
}