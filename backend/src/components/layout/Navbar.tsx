import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  User,
  LogOut,
  Settings,
  Palette,
  CreditCard,
  ShieldCheck,
  Home,
  BookOpen,
  Building2,
  Flame,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { useStreak } from "@/hooks/useStreak";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const THEMES = ["purple", "blue", "caramel", "pinky", "lollipop"] as const;

interface NavbarProps {
  isSidebarCollapsed?: boolean;
}

function GoogleIcon() {
  return (
    <svg
      className="h-4 w-4 mr-2"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

// Streak Display component
function StreakDisplay() {
  const { streak, isLoading } = useStreak();
  const { t } = useLanguage();
  
  if (isLoading) {
    return null;
  }
  
  // Different styles based on streak length with transparent backgrounds
  const getStreakStyle = (count: number) => {
    if (count >= 30) return "border-orange-300 dark:border-orange-700";
    if (count >= 14) return "border-orange-200 dark:border-orange-800";
    return "border-gray-200 dark:border-gray-700";
  };

  const getFlameColor = (count: number) => {
    if (count >= 30) return "text-orange-600 dark:text-orange-400";
    if (count >= 14) return "text-orange-500";
    return "text-gray-400 dark:text-gray-500";
  };

  const getTextColor = (count: number) => {
    if (count >= 30) return "text-orange-700 dark:text-orange-300";
    if (count >= 14) return "text-orange-600 dark:text-orange-400";
    return "text-gray-600 dark:text-gray-400";
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md border", 
              getStreakStyle(streak)
            )}
          >
            <Flame className={cn("h-4 w-4", getFlameColor(streak))} />
            <span className={cn("font-semibold", getTextColor(streak))}>
              {streak}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-medium">{t('streak.tooltip', { count: streak })}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('streak.description')}</p>
          {streak >= 7 && (
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-xs font-medium text-orange-500">
                {t('streak.milestone', { count: streak })}
              </p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function Navbar({ isSidebarCollapsed }: NavbarProps) {
  const { user, profile, signOut, signInWithGoogle } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Loading states for async operations
  const [loadingSignOut, setLoadingSignOut] = useState(false);
  const [loadingGoogleSignIn, setLoadingGoogleSignIn] = useState(false);

  // Navigation tabs
  const navTabs = [
    { name: t('nav.home'), path: '/', icon: Home },
    { name: t('nav.courses'), path: '/courses', icon: BookOpen },
    { name: t('nav.faculties'), path: '/faculties', icon: Building2 },
  ];

  const currentPath = location.pathname;
  
  const getActiveTab = () => {
    // Return exact match
    const exactMatch = navTabs.find(tab => tab.path === currentPath);
    if (exactMatch) return exactMatch.path;
    
    // Return partial match (for nested routes)
    const partialMatch = navTabs.find(tab => 
      tab.path !== '/' && currentPath.startsWith(tab.path)
    );
    if (partialMatch) return partialMatch.path;
    
    // Default to home
    return '/';
  };

  const activeTab = getActiveTab();

  const handleSignOut = async () => {
    setLoadingSignOut(true);
    try {
      await signOut();
      toast.success(t("toast.signedOut"));
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(t("toast.signOutFailed"));
    } finally {
      setLoadingSignOut(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoadingGoogleSignIn(true);
    try {
      await signInWithGoogle();
      toast.success(t("toast.googleSignInSuccess"));
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast.error(t("toast.googleSignInFailed"));
    } finally {
      setLoadingGoogleSignIn(false);
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{ 
        paddingLeft: isSidebarCollapsed ? "5rem" : "15rem",
        transition: "padding-left 300ms ease-in-out"
      }}
      role="navigation"
      aria-label={t("nav.ariaLabel") || "Main navigation"}
    >
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo (hidden on desktop with sidebar) */}
        <div className="flex items-center md:hidden">
          <Link to="/" className="flex items-center space-x-2" aria-label={t("nav.home")}>
            <GraduationCap className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="text-xl font-bold">MedQuest</span>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="hidden md:flex items-center space-x-1 relative">
          <div className="flex overflow-hidden">
            {navTabs.map((tab) => {
              const isActive = tab.path === activeTab;
              const TabIcon = tab.icon;
              
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={cn(
                    "relative px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 group",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="flex items-center space-x-2">
                    <TabIcon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </div>
                  
                  <div 
                    className={cn(
                      "absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full transition-transform duration-300",
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-75"
                    )}
                  />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          {/* Streak Display */}
          {user && <StreakDisplay />}

          {/* Subscription Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/subscription")}
            className="hidden sm:flex"
            aria-label={t("nav.subscription")}
          >
            <CreditCard className="h-4 w-4 mr-2" aria-hidden="true" /> 
            {t("nav.subscription")}
          </Button>

          {/* Language Switcher - Simplified Design without dark background */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
              <button
                onClick={() => setLanguage('fr')}
                className={`p-1 rounded-md transition ${
                  language === 'fr' 
                    ? 'bg-white shadow-sm ring-2 ring-blue-200' 
                    : 'hover:bg-gray-200'
                }`}
                title="Français"
              >
                <svg width="24" height="18" viewBox="0 0 24 18" className="rounded-sm overflow-hidden">
                  <rect width="24" height="18" fill="#ffffff" rx="2"/>
                  <rect width="8" height="18" fill="#0055A4" rx="2"/>
                  <rect x="16" width="8" height="18" fill="#EF4135"/>
                </svg>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`p-1 rounded-md transition ${
                  language === 'en' 
                    ? 'bg-white shadow-sm ring-2 ring-blue-200' 
                    : 'hover:bg-gray-200'
                }`}
                title="English"
              >
                <svg width="24" height="18" viewBox="0 0 24 18" className="rounded-sm overflow-hidden">
                  <rect width="24" height="18" fill="#012169" rx="2"/>
                  <g>
                    <path d="M0 0l24 18M24 0L0 18" stroke="#ffffff" strokeWidth="2"/>
                    <path d="M0 0l24 18M24 0L0 18" stroke="#C8102E" strokeWidth="1.2"/>
                    <path d="M12 0v18M0 9h24" stroke="#ffffff" strokeWidth="4"/>
                    <path d="M12 0v18M0 9h24" stroke="#C8102E" strokeWidth="2.4"/>
                  </g>
                </svg>
              </button>
          </div>

          {/* Theme Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              aria-haspopup="listbox"
              aria-expanded="false"
              aria-label={t("nav.theme")}
            >
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label={t("nav.selectTheme")}>
                <Palette className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent role="listbox">
              {THEMES.map((th) => (
                <DropdownMenuItem
                  key={th}
                  role="option"
                  onClick={() => setTheme(th)}
                  tabIndex={0}
                  className={theme === th ? "bg-accent" : ""}
                >
                  {t(`themes.${th}`)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Authenticated User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                aria-haspopup="menu"
                aria-expanded="false"
                aria-label={t("nav.userMenu")}
              >
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" aria-hidden="true" />
                  </div>
                  <span className="hidden md:inline">{profile?.full_name || user.email?.split('@')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" role="menu">
                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  role="menuitem"
                  tabIndex={0}
                >
                  <User className="mr-2 h-4 w-4" aria-hidden="true" /> {t("nav.profile")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/progress")}
                  role="menuitem"
                  tabIndex={0}
                >
                  <Settings className="mr-2 h-4 w-4" aria-hidden="true" /> {t("nav.progress")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/achievements")}
                  role="menuitem"
                  tabIndex={0}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" /> {t("nav.achievements")}
                </DropdownMenuItem>
                {profile?.is_admin && (
                  <DropdownMenuItem
                    onClick={() => navigate("/admin")}
                    role="menuitem"
                    tabIndex={0}
                  >
                    <Settings className="mr-2 h-4 w-4" aria-hidden="true" /> {t("nav.admin")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  role="menuitem"
                  tabIndex={0}
                  disabled={loadingSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" /> 
                  {loadingSignOut ? t("nav.loggingOut") : t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                size="sm"
                disabled={loadingGoogleSignIn}
                aria-label={t("nav.googleSignIn")}
              >
                <GoogleIcon />
                {loadingGoogleSignIn ? t("nav.signingIn") : "Google"}
              </Button>

              <Button
                asChild
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <Link to="/auth" aria-label={t("nav.signup")}>
                  {t("nav.signup")}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}