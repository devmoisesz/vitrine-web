"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const employeeSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do funcionário."),
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface RegisterEmployeeDialogProps {
  open: boolean;
  isSubmitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: EmployeeFormValues) => void;
}

export function RegisterEmployeeDialog({ open, isSubmitting, error, onClose, onSubmit }: RegisterEmployeeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) {
      dialog.close();
      reset();
    }
  }, [open, reset]);

  return (
    <dialog ref={dialogRef} onClose={onClose} onClick={(event) => event.target === dialogRef.current && !isSubmitting && onClose()} className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-0 shadow-xl backdrop:bg-black/30">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
        <div>
          <h2 className="font-serif text-2xl">Cadastrar funcionário</h2>
          <p className="mt-1 text-sm text-gray-500">Defina as credenciais para o primeiro acesso.</p>
          <p className="mt-2 text-xs text-gray-500">Se o usuário já possuir cadastro na plataforma, ele será vinculado à loja e a senha informada não será alterada.</p>
        </div>
        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <div>
          <label htmlFor="employee-name" className="mb-2 block text-sm font-medium text-gray-600">Nome</label>
          <Input id="employee-name" autoComplete="name" {...register("name")} />
          {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
        </div>
        <div>
          <label htmlFor="employee-email" className="mb-2 block text-sm font-medium text-gray-600">E-mail</label>
          <Input id="employee-email" type="email" autoComplete="email" {...register("email")} />
          {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
        </div>
        <div>
          <label htmlFor="employee-password" className="mb-2 block text-sm font-medium text-gray-600">Senha</label>
          <Input id="employee-password" type="password" autoComplete="new-password" {...register("password")} />
          {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password.message}</p> : null}
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : null}Cadastrar</Button>
        </div>
      </form>
    </dialog>
  );
}
