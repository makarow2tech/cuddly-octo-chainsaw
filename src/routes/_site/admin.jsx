import { Link, createFileRoute } from "@tanstack/react-router";
import { Ban, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_site/admin")({
  head: () => ({ meta: [{ title: "KRYPT · yönetim" }] }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <div className="mx-auto max-w-3xl pt-10">
      <section className="border border-white/10 bg-[hsl(var(--card))]/65 p-6 sm:p-9">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center border border-[hsl(var(--neon-2))]/25 bg-[hsl(var(--neon-2))]/[0.05]">
            <Ban className="h-4 w-4 text-[hsl(var(--neon-2))]" />
          </div>
          <div>
            <span className="mono-label">erişim durumu / unavailable</span>
            <h1 className="mt-2 font-heading text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Yönetim bu sürümde kapalı</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Bağımsız pakette yönetim paneli bulunmaz. Bu bağlantı herhangi bir yönetim uç noktasını çağırmaz. İçerik yönetimi için kendi kurulumuna özel bir panel ekleyebilirsin.
            </p>
            <Link to="/" className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[hsl(var(--neon))]">
              Akışa dön <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}