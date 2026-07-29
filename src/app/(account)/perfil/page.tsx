"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { PersonalDataSection } from "@/components/profile/personal-data-section";
import { AddressList } from "@/components/profile/address-list";
import { AddressFormDialog } from "@/components/profile/address-form-dialog";
import { PasswordSection } from "@/components/profile/password-section";
import type { Address } from "@/features/profile/api/profile";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useProfile } from "@/features/profile/hooks/use-profile";
import { useAddresses } from "@/features/profile/hooks/use-addresses";

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-52 animate-pulse border border-border bg-muted"
        />
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const profile = useProfile(accessToken);
  const addresses = useAddresses(accessToken);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login?next=/perfil");
  }, [authLoading, isAuthenticated, router]);
  useEffect(() => {
    if (!successMessage) return;
    const timeout = window.setTimeout(() => setSuccessMessage(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  const openAdd = () => {
    setSelectedAddress(null);
    setDialogOpen(true);
  };
  const openEdit = (address: Address) => {
    setSelectedAddress(address);
    setDialogOpen(true);
  };
  const retry = () => {
    void profile.refetch();
    void addresses.refetch();
  };

  if (authLoading)
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12">
          <ProfileSkeleton />
        </main>
      </div>
    );
  if (!isAuthenticated || !accessToken) return null;
  if (profile.isLoading || addresses.isLoading)
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12">
          <ProfileSkeleton />
        </main>
      </div>
    );
  if (profile.isError || addresses.isError || !profile.data)
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12">
          <div className="border border-dashed border-border p-8 text-center">
            <h1 className="font-display text-2xl font-semibold">
              Não foi possível carregar seu perfil
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Tente novamente em instantes.
            </p>
            <Button className="mt-6" onClick={retry}>
              Tentar novamente
            </Button>
          </div>
        </main>
      </div>
    );

  const showPassword = profile.data.provider === "LOCAL";
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12">
        <p className="eyebrow text-muted-foreground">Sua conta</p>
        <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
          Perfil
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gerencie seus dados, endereços e preferências de acesso.
        </p>
        {successMessage && (
          <p
            role="status"
            className="mt-6 border border-border bg-muted px-4 py-3 text-sm"
          >
            {successMessage}
          </p>
        )}
        <div className="mt-8 space-y-6">
          <PersonalDataSection
            profile={profile.data}
            accessToken={accessToken}
            onSuccess={setSuccessMessage}
          />
          <AddressList
            addresses={addresses.data ?? []}
            onAdd={openAdd}
            onEdit={openEdit}
          />
          {showPassword && (
            <PasswordSection
              accessToken={accessToken}
              onSuccess={setSuccessMessage}
            />
          )}
        </div>
      </main>
      <AddressFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        address={selectedAddress}
        accessToken={accessToken}
        onSuccess={setSuccessMessage}
      />
    </div>
  );
}
