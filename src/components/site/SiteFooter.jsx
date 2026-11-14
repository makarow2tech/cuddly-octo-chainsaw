import { Link } from "@tanstack/react-router";
import { ArrowUpRight, LockKeyhole } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/[0.09] bg-[hsl(var(--card))]/40">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <div className="flex items-center gap-2 font-heading text-base font-bold tracking-[0.12em]">
            <LockKeyhole className="h-4 w-4 text-[hsl(var(--neon))] drop-shadow-[0_0_8px_hsl(var(--neon)/.6)]" />
            KRYPT<span className="text-[hsl(var(--neon))]">/</span>
          </div>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Düz metin tarayıcıdan çıkmaz. Tartışma ağı değil; ortak bir şifreli frekans.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <Link to="/topics" className="transition hover:text-white">Topluluklar</Link>
          <Link to="/source" className="transition hover:text-white">Kaynak kod</Link>
          <Link to="/admin" className="transition hover:text-white">Yönetim</Link>
          <span className="inline-flex items-center gap-1.5 text-white/30"><ArrowUpRight className="h-3 w-3" /> AES-256-GCM · tarayıcıda çözülür</span>
        </div>
      </div>
    </footer>
  );
}