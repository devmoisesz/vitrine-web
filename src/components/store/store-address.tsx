import { MapPin } from "lucide-react";
import type { StoreAddress as StoreAddressType } from "@/types/store";

export function StoreAddress({ address }: { address: StoreAddressType | null }) {
  if (!address) return null;
  return <div className="mt-7 flex items-start gap-3 text-sm text-muted-foreground"><MapPin className="mt-0.5 size-4 shrink-0 text-foreground" /><address className="not-italic"><p>{address.street}, {address.number}{address.complement ? ` - ${address.complement}` : ""}</p><p>{address.neighborhood}</p><p>{address.city}/{address.state}</p></address></div>;
}
