// Achievements.tsx
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Star,
  Zap,
  BookOpen,
  Target,
  Calendar,
  Lock,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";

const achievementIcons = {
  first_steps: BookOpen,
  perfect_score: Star,
  speed_runner: Zap,
  scholar: Trophy,
  master: Target,
  dedication: Calendar,
} as const;

const initialAchievements = [
  {
    id: "first_steps",
    nameKey: "achievements.firstSteps",
    descriptionKey: "achievements.firstStepsDesc",
    unlocked: false,
    progress: 0,
    target: 1,
  },
  {
    id: "perfect_score",
    nameKey: "achievements.perfectScore",
    descriptionKey: "achievements.perfectScoreDesc",
    unlocked: false,
    progress: 0,
    target: 1,
  },
  {
    id: "speed_runner",
    nameKey: "achievements.speedRunner",
    descriptionKey: "achievements.speedRunnerDesc",
    unlocked: false,
    progress: 0,
    target: 5,
  },
  {
    id: "scholar",
    nameKey: "achievements.scholar",
    descriptionKey: "achievements.scholarDesc",
    unlocked: false,
    progress: 0,
    target: 50,
  },
  {
    id: "master",
    nameKey: "achievements.master",
    descriptionKey: "achievements.masterDesc",
    unlocked: false,
    progress: 0,
    target: 10,
  },
  {
    id: "dedication",
    nameKey: "achievements.dedication",
    descriptionKey: "achievements.dedicationDesc",
    unlocked: false,
    progress: 0,
    target: 7,
  },
];

export default function Achievements() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [achievements, setAchievements] = useState(initialAchievements);

  useEffect(() => {
    if (user) {
      // TODO: Replace with real data fetching logic
      // Simulate progress update
      const updated = initialAchievements.map((ach) => ({
        ...ach,
        progress: Math.floor(Math.random() * ach.target),
        unlocked: Math.random() > 0.5,
      }));
      setAchievements(updated);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container py-8">
        <div className="max-w-md mx-auto">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">
                {t("achievements.loginRequired")}
              </CardTitle>
              <CardDescription>
                {t("achievements.loginRequiredDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-secondary hover:bg-secondary/90">
                <Link to="/auth">{t("auth.login")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("achievements.title")}</h1>
        <p className="text-muted-foreground">{t("achievements.subtitle")}</p>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t("achievements.noAchievements")}
          </h3>
          <p className="text-muted-foreground">
            {t("achievements.noAchievementsDesc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => {
            const Icon =
              achievementIcons[achievement.id as keyof typeof achievementIcons] ||
              Trophy;
            const progressPercentage =
              achievement.target > 0
                ? (achievement.progress / achievement.target) * 100
                : 0;

            return (
              <Card
                key={achievement.id}
                className={`relative ${
                  achievement.unlocked
                    ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                    : "bg-muted/30"
                }`}
              >
                <CardHeader className="text-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      achievement.unlocked
                        ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                    title={t(achievement.nameKey)}
                  >
                    {achievement.unlocked ? (
                      <Icon className="h-8 w-8" aria-hidden />
                    ) : (
                      <Lock className="h-8 w-8" aria-hidden />
                    )}
                  </div>
                  <CardTitle className="text-xl">
                    {t(achievement.nameKey)}
                  </CardTitle>
                  <CardDescription>
                    {t(achievement.descriptionKey)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4">
                    <Badge
                      variant={achievement.unlocked ? "default" : "secondary"}
                    >
                      {achievement.unlocked
                        ? t("achievements.unlocked")
                        : t("achievements.locked")}
                    </Badge>
                  </div>

                  {!achievement.unlocked && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t("achievements.progress")}</span>
                        <span>
                          {achievement.progress}/{achievement.target}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-secondary h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(progressPercentage, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
