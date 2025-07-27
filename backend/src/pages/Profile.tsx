
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Theme = 'purple' | 'blue' | 'caramel' | 'pinky' | 'lollipop' | 'aesthetic';

export default function Profile() {
  const { user, profile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;
      toast.success(t('profile.profileUpdated'));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsUpdate = () => {
    toast.success(t('profile.settingsUpdated'));
  };

  if (!user) {
    return (
      <div className="container py-8">
        <div className="max-w-md mx-auto">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">{t('profile.loginRequired')}</CardTitle>
              <CardDescription>
                {t('profile.loginRequiredDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-secondary hover:bg-secondary/90">
                <Link to="/auth">{t('auth.login')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <CardTitle>{t('profile.personalInfo')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input 
                  id="email"
                  value={user.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                <Input 
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('auth.fullName')}
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-secondary hover:bg-secondary/90"
              >
                {isLoading ? t('ui.loading') : t('profile.updateProfile')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <CardTitle>{t('profile.settings')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('profile.language')}</Label>
              <Select value={language} onValueChange={(value: 'fr' | 'en') => {
                setLanguage(value);
                handleSettingsUpdate();
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">{t('languages.fr')}</SelectItem>
                  <SelectItem value="en">{t('languages.en')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>{t('profile.theme')}</Label>
              <Select value={theme} onValueChange={(value: Theme) => {
                setTheme(value);
                handleSettingsUpdate();
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purple">{t('themes.purple')}</SelectItem>
                  <SelectItem value="blue">{t('themes.blue')}</SelectItem>
                  <SelectItem value="caramel">{t('themes.caramel')}</SelectItem>
                  <SelectItem value="pinky">{t('themes.pinky')}</SelectItem>
                  <SelectItem value="lollipop">{t('themes.lollipop')}</SelectItem>
                  <SelectItem value="aesthetic">{t('themes.aesthetic')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
