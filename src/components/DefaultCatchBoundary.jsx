import { Link, rootRouteId, useMatch, useRouter } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DefaultCatchBoundary({ error }) {
  const router = useRouter();
  const isRoot = useMatch({ strict: false, select: (state) => state.id === rootRouteId });

  return (
    <div className="mx-auto flex min-h-[55vh] max-w-2xl items-center justify-center px-4 py-16">
      <section className="w-full border border-[hsl(var(--destructive))]/25 bg-[hsl(var(--card))]/80 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center border border-[hsl(var(--destructive))]/25 bg-[hsl(var(--destructive))]/[0.06]">
            <AlertTriangle className="h-4 w-4 text-[hsl(var(--destructive))]" />
          </div>
          <div>
            <span className="mono-label">ağ yanıtı kesildi</span>
            <h1 className="mt-2 font-heading text-xl font-semibold">Bu alan yüklenemedi</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{error?.message || "İstek tamamlanamadı. Bağlantıyı kontrol edip yeniden deneyebilirsin."}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.invalidate()} className="rounded-sm border-white/15 font-mono text-[10px] uppercase tracking-wider">
            <RefreshCw className="mr-2 h-3.5 w-3.5" /> Yeniden dene
          </Button>
          <Button asChild className="rounded-sm bg-[hsl(var(--neon))] font-mono text-[10px] uppercase tracking-wider text-[hsl(var(--primary-foreground))]">
            <Link to="/">{isRoot ? "Akışa dön" : "Ana akış"}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
