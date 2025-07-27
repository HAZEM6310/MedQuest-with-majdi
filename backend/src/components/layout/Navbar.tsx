// Navbar.tsx
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  User,
  LogOut,
  Settings,
  Globe,
  Palette,
  CreditCard,
  ShieldCheck,
  Home,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const THEMES = ["purple", "blue", "caramel", "pinky", "lollipop"] as const;

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

export default function Navbar() {
  const { user, profile, signOut, signInWithGoogle } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Loading states for async operations
  const [loadingSignOut, setLoadingSignOut] = useState(false);
  const [loadingGoogleSignIn, setLoadingGoogleSignIn] = useState(false);

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
      className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="navigation"
      aria-label={t("nav.ariaLabel") || "Main navigation"}
    >
      <div className="container flex h-16 items-center justify-between px-2 md:px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 pl-2 md:pl-4" aria-label={t("nav.home")}>
          <GraduationCap className="h-6 w-6 text-secondary" aria-hidden="true" />
          <span className="text-xl font-bold">MedQuest</span>
        </Link>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              aria-haspopup="listbox"
              aria-expanded="false"
              aria-label={t("nav.language")}
            >
              <Button variant="ghost" size="sm">
                <Globe className="h-4 w-4 mr-2" aria-hidden="true" />
                {language.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent role="listbox">
              <DropdownMenuItem
                role="option"
                onClick={() => setLanguage("fr")}
                tabIndex={0}
              >
                Français
              </DropdownMenuItem>
              <DropdownMenuItem
                role="option"
                onClick={() => setLanguage("en")}
                tabIndex={0}
              >
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              aria-haspopup="listbox"
              aria-expanded="false"
              aria-label={t("nav.theme")}
            >
              <Button variant="ghost" size="sm" aria-label={t("nav.selectTheme")}>
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
                >
                  {t(`themes.${th}`)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Navigation buttons */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            aria-label={t("nav.home")}
          >
            <Home className="h-4 w-4 mr-2" aria-hidden="true" /> {t("nav.home")}
          </Button>

          {/* Removed Quizzes button */}

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/subscription")}
            aria-label={t("nav.subscription")}
          >
            <CreditCard className="h-4 w-4 mr-2" aria-hidden="true" /> {t("nav.subscription")}
          </Button>

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
                  <User className="h-4 w-4" aria-hidden="true" />
                  <span>{profile?.full_name || user.email}</span>
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
                  <Settings className="mr-2 h-4 w-4" aria-hidden="true" /> {t("nav.achievements")}
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
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" /> {loadingSignOut ? t("nav.loggingOut") : t("nav.logout")}
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

              <Button asChild variant="ghost" size="sm">
                <Link to="/auth" aria-label={t("nav.login")}>
                  {t("nav.login")}
                </Link>
              </Button>

              <Button
                asChild
                size="sm"
                className="bg-secondary hover:bg-secondary/90"
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
