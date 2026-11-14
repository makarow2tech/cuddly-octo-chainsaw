import { createFileRoute } from "@tanstack/react-router";
import { Download, FileCode2, KeyRound, Layers, Server, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_site/source")({
  head: () => ({ meta: [{ title: "KRYPT · kaynak kod" }] }),
  component: SourcePage,
});

const ITEMS = [
  {
    icon: KeyRound,
    title: "kripto çekirdeği",
    text: "src/lib/crypto.js — AES-256-GCM + RSA-OAEP-4096 zarf motoru ve kasa yönetimi.",
  },
  {
    icon: Layers,
    title: "arayüz",
    text: "src/routes ve src/components — akış, gönderi, topluluk ve gönderi yazma ekranları.",
  },
  {
    icon: Server,
    title: "sunucu",
    text: "server/index.mjs — bağımlılıksız Node API, JSON dosya deposu ve dosya yükleme.",
  },
];

function SourcePage() {
  return (
    <div className="pt-10">
      <section className="krypt-panel relative overflow-hidden px-5 py-10 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" />
        <div className="relative max-w-2xl">
          <span className="mono-label">açık kaynak / kendi sunucunda çalıştır</span>
          <h1 className="mt-4 font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            KRYPT’in tamamı <span className="text-gradient">senin sunucunda</span>.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Arşivde arayüz, API sunucusu, bağımsız kurulum ayarları ve Docker dosyaları bulunur.
            İndir, kendi sunucuna yükle ve aşağıdaki adımlarla yayınla.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Button asChild className="rounded-sm bg-[hsl(var(--neon))] font-mono text-[10px] uppercase tracking-wider text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--neon))]/90">
              <a href="/krypt-self-hosted.zip" download="krypt-self-hosted.zip">
                <Download className="mr-2 h-4 w-4" /> Tam projeyi indir (.zip)
              </a>
            </Button>
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">zip · ön yüz + API + Docker · kullanıcı verisi içermez</span>
          </div>
          <pre className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-[hsl(var(--background))] p-4 font-mono text-[11px] leading-relaxed text-white/70 shadow-[inset_0_1px_18px_hsl(0_0%_0%/.35)]">
{`unzip krypt-self-hosted.zip
cd krypt
npm install
npm run build
PORT=8080 KRYPT_DATA_DIR=./data npm start`}
          </pre>
        </div>
      </section>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="krypt-panel p-5">
            <Icon className="h-4 w-4 text-[hsl(var(--neon))]" />
            <h2 className="mt-3 font-heading text-base font-semibold">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 border border-white/10 bg-white/[0.02] px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        <FileCode2 className="mr-1.5 inline h-3 w-3" />
        README.md içinde Docker Compose ve Node.js sunucusu için adım adım yayınlama yönergeleri bulunur.
        Sunucunda PORT değerini ayarla ve kalıcı disk yolunu KRYPT_DATA_DIR ile göster.
      </p>
      <p className="mt-3 flex items-start gap-2 border-l border-[hsl(var(--neon))]/40 pl-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--neon))]" />
        ZIP kaynak kodunu ve boş kurulum dosyalarını içerir; gönderiler, yüklenen dosyalar, özel anahtarlar ve sırlar dahil edilmez.
      </p>
    </div>
  );
}