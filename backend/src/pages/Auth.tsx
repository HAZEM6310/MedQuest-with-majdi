import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";

export default function Auth() {
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, user, isLoading } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success("Google sign in successful!");
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast.error(error.message || "Google sign in failed. Please check your configuration.");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(signInEmail, signInPassword);
      toast.success(t("auth.login") + " successful!");
      setSignInEmail("");
      setSignInPassword("");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Login error");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(signUpEmail, signUpPassword, fullName);
      toast.success("Account created successfully! Check your email to confirm your account.");
      setSignUpEmail("");
      setSignUpPassword("");
      setFullName("");
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Sign up error");
    }
  };

  const GoogleButton = () => (
    <Button
      type="button"
      onClick={handleGoogleSignIn}
      variant="outline"
      className="w-full"
      disabled={isLoading}
      aria-label="Sign in with Google"
    >
      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
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
      {isLoading ? t("loading") : t("auth.continueWithGoogle")}
    </Button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <GraduationCap className="h-12 w-12 text-secondary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {t("home.title")}
            </h1>
            <p className="text-sm text-gray-600">{t("home.subtitle")}</p>
          </div>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="signin">{t("auth.login")}</TabsTrigger>
            <TabsTrigger value="signup">{t("auth.signup")}</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card className="shadow-lg border-0">
              <form onSubmit={handleSignIn}>
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-xl font-semibold">{t("auth.login")}</CardTitle>
                  <CardDescription className="text-gray-600">Access your MedQuest account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signinEmail" className="text-sm font-medium">{t("auth.email")}</Label>
                    <Input
                      id="signinEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signinPassword" className="text-sm font-medium">{t("auth.password")}</Label>
                    <Input
                      id="signinPassword"
                      type="password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                  <div className="pt-2">
                    <GoogleButton />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-6">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-secondary hover:bg-secondary/90 font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? t("loading") : t("auth.login")}
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-11"
                  >
                    <Link to="/enter-email">Forgot my password?</Link>
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="shadow-lg border-0">
              <form onSubmit={handleSignUp}>
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-xl font-semibold">{t("auth.signup")}</CardTitle>
                  <CardDescription className="text-gray-600">Create your MedQuest account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">{t("auth.fullName")}</Label>
                    <Input
                      id="fullName"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="text-sm font-medium">{t("auth.email")}</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-sm font-medium">{t("auth.password")}</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                  <div className="pt-2">
                    <GoogleButton />
                  </div>
                </CardContent>
                <CardFooter className="pt-6">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-secondary hover:bg-secondary/90 font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? t("loading") : t("auth.signup")}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
