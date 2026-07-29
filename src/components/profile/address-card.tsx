import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Address } from "@/features/profile/api/profile";

export function AddressCard({
  address,
  onEdit,
}: {
  address: Address;
  onEdit: (address: Address) => void;
}) {
  const complement = address.complement ? `, ${address.complement}` : "";
  return (
    <article className="flex items-start justify-between gap-4 border border-border p-5">
      <div>
        <h3 className="font-medium">{address.label}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {address.street}, {address.number}
          {complement}
          <br />
          {address.neighborhood}, {address.city}/{address.state}
          <br />
          CEP {address.cep}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(address)}
        aria-label={`Editar endereço ${address.label}`}
      >
        <Pencil /> Editar
      </Button>
    </article>
  );
}
