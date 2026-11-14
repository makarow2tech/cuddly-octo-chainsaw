import { Link } from "@tanstack/react-router";
import { Activity, Download, Hash, House, KeyRound, LockKeyhole, Menu, Plus, Search, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { to: "/", label: "Akış", icon: House },
  { to: "/topics", label: "Kanallar", icon: Hash },
  { to: "/settings", label: "Anahtar kasası", icon: KeyRound },
];

export default function SiteHeader() {
  const { user, isAuthenticated, navigateToLogin, isLoadingAuth } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-t-2 border-t-[hsl(var(--neon))]/80 border-b border-white/[0.09] bg-[hsl(var(--background))]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1450px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-10 w-10 place-items-center rounded-[14px] border border-[hsl(var(--neon))]/45 bg-[hsl(var(--neon))]/[0.07] shadow-[0_0_24px_-14px_hsl(var(--neon))]">
            <span className="absolute inset-1 rounded-[9px] border border-[hsl(var(--neon))]/15" />
            <LockKeyhole className="relative h-4 w-4 text-[hsl(var(--neon))]" strokeWidth={1.8} />
          </span>
          <span>
            <span className="block font-heading text-lg font-bold tracking-[0.13em]">KRYPT<span className="text-[hsl(var(--neon))]">/</span></span>
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground sm:block">şifreli tartışma ağı</span>
          </span>
        </Link>

        <nav aria-label="Ana gezinme" className="ml-4 hidden items-center gap-2 border-l border-white/10 pl-5 md:flex">
          {NAV.map(({ icon: Icon, ...item }) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              title={item.label}
              aria-label={item.label}
              className="group flex h-10 items-center gap-2 rounded-xl border border-transparent px-3 text-muted-foreground transition hover:border-white/10 hover:bg-white/[0.04] hover:text-foreground"
              activeProps={{ className: "border-[hsl(var(--neon))]/30 bg-[hsl(var(--neon))]/[0.07] text-[hsl(var(--neon))] shadow-[0_0_22px_-16px_hsl(var(--neon))]" }}
            >
              <Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
              <span className="hidden font-mono text-[10px] uppercase tracking-wider lg:inline">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <form action="/" className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Şifreli akışta ara…"
              className="h-10 w-56 rounded-xl border-white/10 bg-white/[0.025] pl-9 font-mono text-[11px] placeholder:text-muted-foreground/70 focus-visible:ring-[hsl(var(--neon))]/40"
            />
          </form>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden rounded-sm border-white/10 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-[hsl(var(--neon))] sm:flex"
          >
            <a href="/krypt-self-hosted.zip" download="krypt-self-hosted.zip">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Tam proje .zip
            </a>
          </Button>

          <Button
            asChild
            size="sm"
            className="krypt-action h-10 rounded-xl bg-[hsl(var(--neon))] font-mono text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--neon))]/90"
          >
            <Link to="/submit">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Gönder
            </Link>
          </Button>

          {!isLoadingAuth && isAuthenticated ? (
            <Button asChild variant="ghost" size="sm" className="h-10 rounded-sm border border-white/10">
              <Link to="/settings">
                <User className="mr-1.5 h-3.5 w-3.5" />
                <span className="max-w-[90px] truncate">{user?.full_name || "Hesabım"}</span>
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigateToLogin()}
              className="h-10 rounded-sm border border-white/10 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              Giriş
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menüyü aç" className="h-10 w-10 rounded-xl border border-white/10 md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-white/10 bg-[hsl(var(--card))]">
              <div className="mb-7 mt-8 border-b border-white/10 pb-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--neon))]">Bağlantı menüsü</span>
              </div>
              <div className="flex flex-col gap-1">
                {NAV.map((item) => ({ to: item.to, label: item.label })).concat([{ to: "/submit", label: "Yeni gönderi" }, { to: "/source", label: "Kaynak paketi" }, { to: "/login", label: "Anonim kimlik" }]).map(
                  (item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="rounded-sm px-3 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:bg-white/[0.04] hover:text-[hsl(var(--neon))]"
                    >
                      {item.label}
                    </Link>
                  )
                )}
                <a
                  href="/krypt-self-hosted.zip"
                  download="krypt-self-hosted.zip"
                  onClick={() => setOpen(false)}
                  className="mt-4 flex items-center gap-2 rounded-xl border border-[hsl(var(--neon))]/30 bg-[hsl(var(--neon))]/[0.07] px-3 py-3 font-mono text-xs uppercase tracking-wider text-[hsl(var(--neon))] transition-colors hover:bg-[hsl(var(--neon))]/[0.12]"
                >
                  <Download className="h-4 w-4" /> Tam proje ZIP’ini indir
                </a>
              </div>
              <div className="mt-8 border-t border-white/10 pt-4 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                <Activity className="mr-2 inline h-3 w-3 text-[hsl(var(--neon))]" /> bağlantı yerel · içerik şifreli
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}