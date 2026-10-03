"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import { ChevronDown, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { logout } from "@/features/auth/api/authenticate";
import { useCartCount } from "@/features/cart/hooks/use-cart-count";
import { useProfile } from "@/features/profile/hooks/use-profile";
import { isAdminRole, isCollaboratorRole } from "@/lib/roles";

export function AccountActions() {
  const router = useRouter();
  const { isAuthenticated, accessToken, isLoading, role } = useAuth();
  const { data: cartCount } = useCartCount(isAuthenticated ? accessToken : null);
  const { data: profile } = useProfile(isAuthenticated ? accessToken : null);
  const dashboard = isAdminRole(role) ? "/admin" : isCollaboratorRole(role) ? "/painel" : null;
  async function handleLogout() {
    try { await logout(); router.push("/"); router.refresh(); }
    catch { toast.error("Não foi possível encerrar sua sessão. Tente novamente."); }
  }
  if (isLoading) return <span className="vw-account-loading" aria-label="Carregando conta" />;
  if (!isAuthenticated) return <Link className="vw-text-button" href="/login">Entrar</Link>;
  return <div className="vw-account-actions">
    <Menu.Root modal={false}>
      <Menu.Trigger className="vw-account-trigger" aria-label="Abrir menu da conta"><span>{profile?.user_name?.split(/\s+/)[0] || "Minha conta"}</span><ChevronDown size={14} aria-hidden="true" /></Menu.Trigger>
      <Menu.Portal><Menu.Positioner side="bottom" align="end" sideOffset={8} className="z-[60]">
        <Menu.Popup className="vw-theme vw-account-menu">
          {dashboard && <Menu.Item onClick={() => router.push(dashboard)}>Acessar meu painel</Menu.Item>}
          <Menu.Item onClick={() => router.push("/perfil")}>Meu perfil</Menu.Item>
          <Menu.Item onClick={() => router.push("/pedidos")}>Meus pedidos</Menu.Item>
          <Menu.Item onClick={() => router.push("/carrinho")}>Meus carrinhos</Menu.Item>
          <Menu.Item onClick={() => router.push("/enderecos")}>Meus endereços</Menu.Item>
          <Menu.Separator className="vw-menu-separator" />
          <Menu.Item onClick={() => void handleLogout()}>Sair</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner></Menu.Portal>
    </Menu.Root>
    <Link href="/carrinho" className="vw-cart-link" aria-label={`Meus carrinhos${cartCount ? `, ${cartCount} itens` : ""}`}><ShoppingBag size={18} aria-hidden="true" />{Boolean(cartCount) && <span>{cartCount}</span>}</Link>
  </div>;
}

export function MerchantLink({ children, className = "vw-button" }: { children: React.ReactNode; className?: string }) {
  const { role, isLoading } = useAuth();
  const dashboard = !isLoading && (isAdminRole(role) ? "/admin" : isCollaboratorRole(role) ? "/painel" : null);
  return <Link className={className} href={dashboard || "/sobre#contato"}>{dashboard ? "Acessar meu painel" : children}<span aria-hidden="true">↗</span></Link>;
}
