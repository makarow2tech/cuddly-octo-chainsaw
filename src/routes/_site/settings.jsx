import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, ShieldCheck } from "lucide-react";
import VaultPanel from "@/components/settings/VaultPanel";

export const Route = createFileRoute("/_site/settings")({
  head: () => ({ meta: [{ title: "KRYPT · kasa" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl pt-10">
      <div className="flex items-start gap-4 border-b border-white/10 pb-6">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[15px] border border-[hsl(var(--neon))]/30 bg-[hsl(var(--neon))]/[0.06] shadow-[0_0_28px_-14px_hsl(var(--neon))]">
          <KeyRound className="h-5 w-5 text-[hsl(var(--neon))]" />
        </div>
        <div>
          <span className="mono-label">istemci anahtar yönetimi</span>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">Yerel anahtar kasası</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Özel anahtarın bu tarayıcıda parolanla şifrelenmiş halde tutulur. Kasa kilitliyken özel gönderilerini okuyamazsın.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <VaultPanel />
      </div>
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[hsl(var(--neon))]/15 bg-[hsl(var(--neon))]/[0.035] px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--neon))]" />
        <span>Bu bağımsız sürümde hesap sistemi yoktur; kasa bu tarayıcının anonim kimliğine bağlıdır. Parolanı kaybedersen özel anahtarını kurtarmak mümkün olmayabilir.</span>
      </div>
    </div>
  );
}