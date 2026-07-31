"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/painel/confirm-dialog";
import { RegisterEmployeeDialog, type EmployeeFormValues } from "@/components/painel/register-employee-dialog";
import type { Employee } from "@/features/painel/api/store";
import { useEmployees } from "@/features/painel/hooks/use-employees";
import { useRegisterEmployee } from "@/features/painel/hooks/use-register-employee";
import { useRemoveEmployee } from "@/features/painel/hooks/use-remove-employee";

interface EmployeesTableProps {
  slug: string;
  accessToken: string;
}

export function EmployeesTable({ slug, accessToken }: EmployeesTableProps) {
  const employees = useEmployees(slug, accessToken);
  const registerEmployee = useRegisterEmployee(slug, accessToken);
  const removeEmployee = useRemoveEmployee(slug, accessToken);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [employeeToRemove, setEmployeeToRemove] = useState<Employee | null>(null);
  const [credentialsNotice, setCredentialsNotice] = useState(false);

  async function handleRegister(values: EmployeeFormValues) {
    try {
      await registerEmployee.mutateAsync({ ...values, role: "FUNCIONARIO" });
      setIsRegisterOpen(false);
      setCredentialsNotice(true);
    } catch {
      // O erro é mostrado dentro do formulário, onde pode ser corrigido.
    }
  }

  async function handleRemove() {
    if (!employeeToRemove) return;
    try {
      await removeEmployee.mutateAsync(employeeToRemove.id);
      setEmployeeToRemove(null);
      toast.success("Funcionário removido com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível remover o funcionário. Tente novamente.");
    }
  }

  const registerButton = <Button onClick={() => setIsRegisterOpen(true)}>+ Cadastrar</Button>;

  return <>
    <div className="flex justify-end">{registerButton}</div>
    {credentialsNotice ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Cadastro concluído. Compartilhe este e-mail e senha com o funcionário para o primeiro acesso.</div> : null}
    {employees.isLoading ? <div className="overflow-hidden rounded-xl border border-gray-200 bg-white"><div className="border-b border-gray-200 px-5 py-4"><div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" /></div>{Array.from({ length: 4 }).map((_, index) => <div key={index} className="flex gap-8 border-b border-gray-100 px-5 py-5"><div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" /><div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" /></div>)}</div> : null}
    {employees.isError ? <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"><p className="text-sm text-red-700">Não foi possível carregar os funcionários.</p><Button className="mt-4" variant="secondary" onClick={() => employees.refetch()}>Tentar novamente</Button></div> : null}
    {employees.data && employees.data.length === 0 ? <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center"><p className="text-gray-600">Nenhum funcionário cadastrado ainda.</p><div className="mt-4">{registerButton}</div></div> : null}
    {employees.data && employees.data.length > 0 ? <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white"><table className="w-full min-w-[560px] text-left text-sm"><thead className="border-b border-gray-200 bg-gray-50 text-gray-500"><tr><th className="px-5 py-3 font-medium">Nome</th><th className="px-5 py-3 font-medium">E-mail</th><th className="px-5 py-3 text-right font-medium">Ações</th></tr></thead><tbody>{employees.data.map((employee) => <tr key={employee.id} className="border-b border-gray-100 last:border-0"><td className="px-5 py-4 font-medium">{employee.name}</td><td className="px-5 py-4 text-gray-600">{employee.email}</td><td className="px-5 py-4 text-right"><button type="button" onClick={() => setEmployeeToRemove(employee)} className="text-sm font-medium text-red-600 hover:text-red-700">Remover</button></td></tr>)}</tbody></table></div> : null}
    <RegisterEmployeeDialog open={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} onSubmit={handleRegister} isSubmitting={registerEmployee.isPending} error={registerEmployee.error instanceof Error ? registerEmployee.error.message : null} />
    <ConfirmDialog open={Boolean(employeeToRemove)} title={`Remover ${employeeToRemove?.name ?? "funcionário"}?`} destructive confirmLabel={removeEmployee.isPending ? "Removendo..." : "Remover"} onCancel={() => !removeEmployee.isPending && setEmployeeToRemove(null)} onConfirm={handleRemove}>Esta ação não pode ser desfeita.</ConfirmDialog>
  </>;
}
