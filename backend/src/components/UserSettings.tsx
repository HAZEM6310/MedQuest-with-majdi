
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";

export default function UserSettings() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('profile.settings')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="language">{t('profile.language')}</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">{t('languages.fr')}</SelectItem>
              <SelectItem value="en">{t('languages.en')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="theme">{t('profile.theme')}</Label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger>
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="purple">{t('themes.purple')}</SelectItem>
              <SelectItem value="blue">{t('themes.blue')}</SelectItem>
              <SelectItem value="caramel">{t('themes.caramel')}</SelectItem>
              <SelectItem value="pinky">{t('themes.pinky')}</SelectItem>
              <SelectItem value="lollipop">{t('themes.lollipop')}</SelectItem>
              <SelectItem value="aesthetic">{t('themes.aesthetic')}</SelectItem>
              <SelectItem value="noir">Noir</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
