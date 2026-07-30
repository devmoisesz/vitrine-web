"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChangePassword } from "@/features/profile/hooks/use-change-password";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Informe sua senha atual."),
    newPassword: z
      .string()
      .min(8, "A nova senha deve ter pelo menos 8 caracteres."),
    confirmation: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmation, {
    path: ["confirmation"],
    message: "As senhas não coincidem.",
  });
type Values = z.infer<typeof schema>;

export function PasswordSection({
  accessToken,
  onSuccess,
}: {
  accessToken: string;
  onSuccess: (message: string) => void;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmation: "" },
  });
  const changePassword = useChangePassword(accessToken);
  async function submit(values: Values) {
    form.clearErrors();
    try {
      await changePassword.mutateAsync(values);
      form.reset();
      onSuccess("Senha atualizada.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a senha.";
      form.setError(
        message.toLowerCase().includes("atual") ||
          message.toLowerCase().includes("incorrect")
          ? "currentPassword"
          : "root",
        { message },
      );
    }
  }
  const field = (name: keyof Values, label: string, autoComplete: string) => (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <Input
        type="password"
        autoComplete={autoComplete}
        {...form.register(name)}
        aria-invalid={Boolean(form.formState.errors[name])}
      />
      {form.formState.errors[name] && (
        <span className="text-sm text-destructive">
          {form.formState.errors[name]?.message}
        </span>
      )}
    </label>
  );
  return (
    <section
      aria-labelledby="seguranca"
      className="border border-border p-5 md:p-7"
    >
      <h2 id="seguranca" className="font-display text-2xl font-semibold">
        Segurança
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Altere sua senha de acesso.
      </p>
      <form
        onSubmit={form.handleSubmit(submit)}
        className="mt-6 grid max-w-xl gap-5"
      >
        {field("currentPassword", "Senha atual", "current-password")}
        {field("newPassword", "Nova senha", "new-password")}
        {field("confirmation", "Confirmar nova senha", "new-password")}
        {form.formState.errors.root && (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}
        <div>
          <Button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending ? "Atualizando…" : "Atualizar senha"}
          </Button>
        </div>
      </form>
    </section>
  );
}
