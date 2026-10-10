import { AdminSegments } from "@/components/admin/admin-segments";

export default function SegmentsPage() {
  return <div className="mx-auto max-w-6xl"><header className="mb-8"><p className="eyebrow text-gray-500">Administração</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Segmentos de lojas</h1><p className="mt-3 text-sm text-muted-foreground">Gerencie os tipos de loja disponíveis para seleção. As categorias de produtos continuam sendo gerenciadas separadamente.</p></header><AdminSegments /></div>;
}
