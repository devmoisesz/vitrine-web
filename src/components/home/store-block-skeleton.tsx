export function StoreBlockSkeleton() {
  return <article className="animate-pulse"><div className="aspect-[4/1] bg-muted" /><div className="relative -mt-10 ml-5 size-20 rounded-full border-4 border-background bg-muted" /><div className="mt-3 h-7 w-48 bg-muted" /><div className="mt-6 flex gap-4 overflow-hidden">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="w-36 shrink-0"><div className="aspect-[3/4] bg-muted" /><div className="mt-3 h-3 w-3/4 bg-muted" /><div className="mt-2 h-3 w-1/2 bg-muted" /></div>)}</div></article>;
}
