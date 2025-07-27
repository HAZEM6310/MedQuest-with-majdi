import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function EnterEmail() {
  const { register, handleSubmit, formState: { errors }, setError } = useForm<{ email: string }>();
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendResetPwdEmail = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setEmailSent(true);
      toast.success("Un email de réinitialisation a été envoyé à votre adresse.");
    } catch (err: any) {
      setError("email", { message: err.message || "Erreur lors de l'envoi de l'email." });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = ({ email }: { email: string }) => sendResetPwdEmail(email);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Trouver votre adresse e-mail</CardTitle>
          <CardDescription>Saisissez votre adresse e-mail de récupération</CardDescription>
        </CardHeader>
        <CardContent>
          {!emailSent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                type="email"
                placeholder="Votre adresse e-mail"
                {...register("email", { required: "Veuillez saisir votre adresse e-mail" })}
                disabled={loading}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Envoi en cours..." : "Envoyer"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">Vérifiez votre boîte email</h2>
              <p>Un email de réinitialisation a été envoyé à votre adresse.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 