import { Link } from "@tanstack/react-router";
import { Radar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFound({ children }) {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-xl items-center justify-center px-4 py-20">
      <section className="w-full border border-white/10 bg-[hsl(var(--card))]/65 p-8 text-center">
        <Radar className="mx-auto h-8 w-8 text-[hsl(var(--neon))]" />
        <p className="mt-5 font-mono text-5xl font-medium tracking-[-0.08em] text-foreground">404</p>
        <p className="mt-3 text-sm text-muted-foreground">{children ?? "Aradığın sayfa bu frekansta bulunamadı."}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" onClick={() => window.history.back()} className="rounded-sm border-white/15 font-mono text-[10px] uppercase tracking-wider">
            Geri dön
          </Button>
          <Button asChild className="rounded-sm bg-[hsl(var(--neon))] font-mono text-[10px] uppercase tracking-wider text-[hsl(var(--primary-foreground))]">
            <Link to="/">Akışa geç</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
