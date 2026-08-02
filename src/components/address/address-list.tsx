import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Address } from "@/features/address/api/address";
import { AddressCard } from "./address-card";

export function AddressList({
  addresses,
  onAdd,
  onEdit,
}: {
  addresses: Address[];
  onAdd: () => void;
  onEdit: (address: Address) => void;
}) {
  return (
    <section aria-labelledby="enderecos" className="border border-border p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="enderecos" className="font-display text-2xl font-semibold">Endereços</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use seus endereços para agilizar suas compras.</p>
        </div>
        <Button size="sm" onClick={onAdd}><Plus /> Adicionar endereço</Button>
      </div>
      <div className="mt-6 grid gap-3">
        {addresses.length ? addresses.map((address) => (
          <AddressCard key={address.id} address={address} onEdit={onEdit} />
        )) : (
          <div className="border border-dashed border-border p-8 text-center">
            <p className="font-medium">Nenhum endereço cadastrado</p>
            <p className="mt-1 text-sm text-muted-foreground">Adicione um endereço quando quiser.</p>
            <Button className="mt-5" size="sm" onClick={onAdd}><Plus /> Adicionar endereço</Button>
          </div>
        )}
      </div>
    </section>
  );
}
