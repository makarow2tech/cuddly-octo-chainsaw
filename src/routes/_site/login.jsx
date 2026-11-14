import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Fingerprint, KeyRound, ShieldCheck, UserRoundX } from "lucide-react";

export const Route = createFileRoute("/_site/login")({
  head: () => ({ meta: [{ title: "KRYPT · giriş" }] }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="mx-auto max-w-3xl pt-10">
      <section className="krypt-panel relative overflow-hidden p-6 sm:p-10">
        <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 border-b border-l border-[hsl(var(--neon))]/10" />
        <div className="relative">
          <span className="mono-label inline-flex items-center gap-2"><Fingerprint className="h-3.5 w-3.5 text-[hsl(var(--neon))]" /> yerel kimlik protokolü</span>
          <h1 className="mt-5 max-w-xl font-heading text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Burada hesap yok.<br /><span className="text-[hsl(var(--neon))]">İz bırakmadan konuş.</span></h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Bu bağımsız sürümde kayıt veya parola tabanlı hesap sistemi bulunmaz. Tarayıcın, yerel anonim kimliğini üretir; adın ve oturum anahtarın bu cihazda kalır.
          </p>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
            {[
              { icon: UserRoundX, title: "Kayıt yok", text: "E-posta veya gerçek ad istenmez." },
              { icon: ShieldCheck, title: "Anonim imza", text: "Gönderiler bu tarayıcıdaki kimliğe bağlanır." },
              { icon: KeyRound, title: "Anahtar sende", text: "Şifreli içeriğin düz metni sunucuya gitmez." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-[hsl(var(--background))]/90 p-4 transition-colors hover:bg-[hsl(var(--neon))]/[0.035]">
                <Icon className="h-4 w-4 text-[hsl(var(--neon))]" />
                <h2 className="mt-4 font-mono text-[10px] uppercase tracking-wider text-foreground">{title}</h2>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link to="/" className="inline-flex items-center gap-2 bg-[hsl(var(--neon))] px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-[hsl(var(--primary-foreground))]">
              Akışa dön <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link to="/settings" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-[hsl(var(--neon))]">Yerel kasayı görüntüle</Link>
          </div>
        </div>
      </section>
      <p className="mt-4 font-mono text-[9px] leading-relaxed text-muted-foreground/75">Bu kimlik yalnızca bu tarayıcıda geçerlidir. Tarayıcı verilerini silersen kimliğin ve yerel erişim bilgilerin kaybolabilir.</p>
    </div>
  );
}