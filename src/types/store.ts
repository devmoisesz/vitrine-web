export interface StoreAddress {
  id: string;
  label: string;
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement: string | null;
}

export interface StoreProfile {
  name: string;
  logo_url: string | null;
  description: string;
  whatsapp: string;
  address: StoreAddress | null;
}
