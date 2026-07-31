import type { ReactNode } from "react";
import { PainelSidebar } from "@/components/painel/painel-sidebar";

export default function PainelLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-gray-50"><PainelSidebar /><main className="min-h-screen px-4 pb-10 pt-20 lg:ml-64 lg:px-10 lg:pt-10">{children}</main></div>;
}
