import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, isLoading } = useAuth();
  const { t } = useLanguage();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(signInEmail, signInPassword);
      toast.success("Login successful!");
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
      await signUp(signUpEmail, signUpPassword, fullName, voucherCode);
      toast.success("Account created successfully! Check your email to confirm your account.");
      setSignUpEmail("");
      setSignUpPassword("");
      setFullName("");
      setVoucherCode("");
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Sign up error");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success("Google sign in successful!");
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast.error(error.message || "Google sign in failed. Please check your configuration.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-blue-600">Med</span>
          <span className="text-gray-700">Quest</span>
        </h1>
      </div>
      
      <Card className="overflow-hidden w-full max-w-md">
        <CardContent className="p-0">
          <div className="p-6 md:p-8">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">{t("auth.login")}</TabsTrigger>
                <TabsTrigger value="signup">{t("auth.signup")}</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-0">
                <form onSubmit={handleSignIn}>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center text-center">
                      <h1 className="text-2xl font-bold">{t("auth.welcomeBack")}</h1>
                      <p className="text-muted-foreground text-balance">
                        Login to your MedQuest account
                      </p>
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="signinEmail">{t("auth.email")}</Label>
                      <Input
                        id="signinEmail"
                        type="email"
                        placeholder="m@example.com"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <Label htmlFor="signinPassword">{t("auth.password")}</Label>
                        <Link
                          to="/enter-email"
                          className="ml-auto text-sm underline-offset-2 hover:underline"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                      <Input 
                        id="signinPassword" 
                        type="password" 
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        required 
                        disabled={isLoading}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? t("loading") : t("auth.login")}
                    </Button>
                    
                    <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                      <span className="bg-card text-muted-foreground relative z-10 px-2">
                        Or continue with
                      </span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      type="button" 
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      {isLoading ? t("loading") : t("auth.continueWithGoogle")}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignUp}>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center text-center">
                      <h1 className="text-2xl font-bold">{t("auth.signup")}</h1>
                      <p className="text-muted-foreground text-balance">
                        Create your MedQuest account
                      </p>
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                      <Input
                        id="fullName"
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="signupEmail">{t("auth.email")}</Label>
                      <Input
                        id="signupEmail"
                        type="email"
                        placeholder="m@example.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="signupPassword">{t("auth.password")}</Label>
                      <Input 
                        id="signupPassword" 
                        type="password" 
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        required 
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="voucherCode">{t("auth.voucherCode")}</Label>
                      <Input
                        id="voucherCode"
                        placeholder="Enter voucher code (optional)"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground">
                        {t("auth.voucherDescription")}
                      </p>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? t("loading") : t("auth.signup")}
                    </Button>
                    
                    <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                      <span className="bg-card text-muted-foreground relative z-10 px-2">
                        Or continue with
                      </span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      type="button" 
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      {isLoading ? t("loading") : t("auth.continueWithGoogle")}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-muted-foreground text-center text-xs text-balance">
        By clicking continue, you agree to our{" "}
        <Link to="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link to="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </Link>.
      </div>
    </div>
  );
}
