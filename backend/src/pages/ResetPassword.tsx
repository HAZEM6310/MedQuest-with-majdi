import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState: { errors } } = useForm<{ password: string; confirm_password: string }>();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetPassword = async (password: string, token: string) => {
    setLoading(true);
    try {
      // Use the correct Supabase API for password reset with token
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success("Votre mot de passe a été modifié avec succès.");
      setTimeout(() => navigate("/auth"), 3000);
    } catch (err: any) {
      setError("password", { message: err.message || "Erreur lors de la réinitialisation." });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async ({ password, confirm_password }: { password: string; confirm_password: string }) => {
    if (password !== confirm_password) {
      setError("confirm_password", { message: "Les mots de passe ne correspondent pas." });
      return;
    }
    if (!token) {
      setError("password", { message: "Lien de réinitialisation invalide." });
      return;
    }
    await resetPassword(password, token);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Réinitialiser votre mot de passe</CardTitle>
          <CardDescription>Entrez et confirmez votre nouveau mot de passe</CardDescription>
        </CardHeader>
        <CardContent>
          {!success ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                type="password"
                placeholder="Nouveau mot de passe"
                {...register("password", { required: "Ce champ est requis" })}
                disabled={loading}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              <Input
                type="password"
                placeholder="Confirmer le mot de passe"
                {...register("confirm_password", { required: "Ce champ est requis" })}
                disabled={loading}
              />
              {errors.confirm_password && <p className="text-red-500 text-sm">{errors.confirm_password.message}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Modification en cours..." : "Confirmer"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">Mot de passe changé</h2>
              <p>Votre mot de passe a été modifié avec succès.</p>
              <Progress className="mt-4" value={100} />
              <p>Redirection vers la connexion...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 