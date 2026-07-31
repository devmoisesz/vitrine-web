"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useChangeStoreLogo } from "@/features/painel/hooks/use-change-store-logo";
import { useDeleteStoreLogo } from "@/features/painel/hooks/use-delete-store-logo";
import { useUploadStoreLogo } from "@/features/painel/hooks/use-upload-store-logo";

const accepted = ["image/png", "image/jpeg", "image/webp"];
const maxSize = 2 * 1024 * 1024;
export function StoreLogoManager({ logoUrl, slug, accessToken }: { logoUrl: string | null; slug: string; accessToken: string }) {
  const inputRef = useRef<HTMLInputElement>(null); const [error, setError] = useState<string | null>(null); const upload = useUploadStoreLogo(slug, accessToken); const change = useChangeStoreLogo(slug, accessToken); const remove = useDeleteStoreLogo(slug, accessToken); const pending = upload.isPending || change.isPending || remove.isPending;
  async function selectFile(file?: File) { if (!file) return; if (!accepted.includes(file.type)) { setError("Formato não aceito. Use PNG, JPG ou WebP."); return; } if (file.size > maxSize) { setError("A imagem deve ter no máximo 2MB."); return; } setError(null); try { await (logoUrl ? change : upload).mutateAsync(file); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Não foi possível enviar a logo."); } finally { if (inputRef.current) inputRef.current.value = ""; } }
  async function deleteLogo() { if (!window.confirm("Remover a logo atual da loja?")) return; setError(null); try { await remove.mutateAsync(); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Não foi possível remover a logo."); } }
  return <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-7"><h2 className="font-serif text-2xl">Logo</h2><p className="mt-1 text-sm text-gray-500">PNG, JPG ou WebP, com no máximo 2MB.</p><div className="mt-5 flex flex-wrap items-center gap-4">{logoUrl ? <img src={logoUrl} alt="Logo atual da loja" className="size-24 rounded-lg border border-gray-200 object-cover" /* eslint-disable-line @next/next/no-img-element -- external logo URLs are not configured for next/image */ /> : <div className="flex size-24 items-center justify-center rounded-lg border border-dashed border-gray-300 text-xs text-gray-500">Sem logo</div>}<input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => void selectFile(event.target.files?.[0])} disabled={pending} /><Button onClick={() => inputRef.current?.click()} disabled={pending}>{pending && !remove.isPending ? "Enviando..." : logoUrl ? "Trocar" : "Enviar logo"}</Button>{logoUrl ? <Button variant="secondary" onClick={() => void deleteLogo()} disabled={pending}>{remove.isPending ? "Removendo..." : "Remover"}</Button> : null}</div>{error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}</section>;
}
