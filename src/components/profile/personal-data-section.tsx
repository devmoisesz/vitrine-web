"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api-client";
import { useUpdateProfile } from "@/features/profile/hooks/use-update-profile";
import type { Profile } from "@/features/profile/api/profile";

const schema = z.object({
  name: z.string().trim().min(1, "Informe seu nome."),
  email: z.string().trim().email("Informe um e-mail válido."),
});
type Values = z.infer<typeof schema>;

export function PersonalDataSection({
  profile,
  accessToken,
  onSuccess,
}: {
  profile: Profile;
  accessToken: string;
  onSuccess: (message: string) => void;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: profile.user_name, email: profile.user_email },
  });
  const update = useUpdateProfile(accessToken);
  useEffect(
    () => form.reset({ name: profile.user_name, email: profile.user_email }),
    [profile, form],
  );

  async function submit(values: Values) {
    form.clearErrors();
    try {
      await update.mutateAsync(values);
      form.reset(values);
      onSuccess("Dados atualizados.");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível atualizar seus dados.";
      form.setError(
        message.toLowerCase().includes("e-mail") ||
          message.toLowerCase().includes("email")
          ? "email"
          : "root",
        { message },
      );
    }
  }

  return (
    <section
      aria-labelledby="dados-pessoais"
      className="border border-border p-5 md:p-7"
    >
      <h2 id="dados-pessoais" className="font-display text-2xl font-semibold">
        Dados pessoais
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Mantenha suas informações de contato atualizadas.
      </p>
      <form
        onSubmit={form.handleSubmit(submit)}
        className="mt-6 grid gap-5 md:grid-cols-2"
      >
        <label className="grid gap-2 text-sm font-medium">
          Nome
          <Input
            {...form.register("name")}
            autoComplete="name"
            aria-invalid={Boolean(form.formState.errors.name)}
          />
          {form.formState.errors.name && (
            <span className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </span>
          )}
        </label>
        <label className="grid gap-2 text-sm font-medium">
          E-mail
          <Input
            {...form.register("email")}
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(form.formState.errors.email)}
          />
          {form.formState.errors.email && (
            <span className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </span>
          )}
        </label>
        {form.formState.errors.root && (
          <p className="text-sm text-destructive md:col-span-2">
            {form.formState.errors.root.message}
          </p>
        )}
        <div className="md:col-span-2">
          <Button
            type="submit"
            disabled={!form.formState.isDirty || update.isPending}
          >
            {update.isPending ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </form>
    </section>
  );
}
