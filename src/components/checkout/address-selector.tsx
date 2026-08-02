import type { Address } from "@/features/address/api/address";

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddressId: string | null;
  onSelect: (addressId: string) => void;
}

export function AddressSelector({ addresses, selectedAddressId, onSelect }: AddressSelectorProps) {
  if (!addresses.length) return null;

  return (
    <fieldset>
      <legend className="font-display text-xl font-semibold">Endereço de entrega</legend>
      <div className="mt-4 grid gap-3">
        {addresses.map((address) => (
          <label key={address.id} className="flex cursor-pointer gap-3 border border-border p-4">
            <input
              type="radio"
              name="delivery-address"
              value={address.id}
              checked={selectedAddressId === address.id}
              onChange={() => onSelect(address.id)}
              className="mt-1"
            />
            <span className="text-sm">
              <span className="block font-medium">{address.label}</span>
              {address.street}, {address.number} - {address.neighborhood}
              <span className="block">{address.city}/{address.state} - {address.cep}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
