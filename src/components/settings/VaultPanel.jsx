import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getSessionPrivateKey, lockVault } from "@/lib/vault";
import { useVaultVersion } from "@/lib/useVault";
import VaultDialog from "@/components/crypto/VaultDialog";
import { Button } from "@/components/ui/button";
import { KeyRound, Lock, RefreshCw, Unlock } from "lucide-react";
import { getMyProfile } from "@/lib/server-fns";

export default function VaultPanel({ profile }) {
  const { user } = useAuth();
  const version = useVaultVersion();
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile || null);
  const [loading, setLoading] = useState(!profile);
  const [profileError, setProfileError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    setUnlocked(Boolean(user?.id && getSessionPrivateKey(user.id)));
  }, [user?.id, version]);

  useEffect(() => {
    let alive = true;
    if (profile) {
      setLocalProfile(profile);
      setLoading(false);
      setProfileError("");
      return () => { alive = false; };
    }
    if (!user?.id) return () => { alive = false; };
    setLoading(true);
    setProfileError("");
    getMyProfile()
      .then((value) => { if (alive) setLocalProfile(value); })
      .catch((error) => {
        if (alive) {
          setLocalProfile(null);
          setProfileError(error?.message || "Kasa bilgisi alınamadı.");
        }
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [profile, user?.id, version, retry]);

  const fingerprint = (() => {
    try {
      const jwk = JSON.parse(localProfile?.public_key || "{}");
      return jwk.n ? `${jwk.n.slice(0, 8)}…${jwk.n.slice(-8)}` : null;
    } catch {
      return null;
    }
  })();

  return (
    <div className="krypt-panel p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-[hsl(var(--neon))]" />
        <h2 className="font-heading text-base font-semibold">Şifreleme kasası</h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        RSA-4096 anahtar çiftin tarayıcında üretilir. Özel anahtarın parolanla şifrelenmiş olarak saklanır;
        özel gönderilerini yalnızca sen okuyabilirsin.
      </p>

      <dl className="mt-4 space-y-2 font-mono text-[11px]">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">anahtar</dt>
          <dd className="text-white/80">{loading ? "yükleniyor…" : localProfile?.public_key ? fingerprint : "oluşturulmadı"}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">durum</dt>
          <dd className={unlocked ? "text-[hsl(var(--neon))]" : "text-white/60"}>
            {unlocked ? "açık · oturum belleğinde" : "kilitli"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex gap-2">
        {profileError ? (
          <div className="flex w-full flex-wrap items-center justify-between gap-3 border border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/[0.04] p-3">
            <p className="text-xs text-muted-foreground">{profileError}</p>
            <Button size="sm" variant="outline" className="rounded-sm font-mono text-[9px] uppercase tracking-wider" onClick={() => setRetry((value) => value + 1)}>
              <RefreshCw className="mr-1.5 h-3 w-3" /> Yeniden dene
            </Button>
          </div>
        ) : loading ? (
          <div className="h-9 w-36 animate-pulse bg-white/[0.06]" aria-label="Kasa bilgisi yükleniyor" />
        ) : localProfile?.public_key ? (
          unlocked ? (
            <Button
              size="sm"
              variant="outline"
              className="rounded-sm border-white/15 font-mono text-[10px] uppercase tracking-wider"
              onClick={() => {
                lockVault(user.id);
                setUnlocked(false);
              }}
            >
              <Lock className="mr-1.5 h-3.5 w-3.5" /> Kilitle
            </Button>
          ) : (
            <Button size="sm" className="rounded-sm bg-[hsl(var(--neon))] font-mono text-[10px] uppercase tracking-wider text-[hsl(var(--primary-foreground))]" onClick={() => setOpen(true)}>
              <Unlock className="mr-1.5 h-3.5 w-3.5" /> Kilidi aç
            </Button>
          )
        ) : (
          <Button size="sm" className="rounded-sm bg-[hsl(var(--neon))] font-mono text-[10px] uppercase tracking-wider text-[hsl(var(--primary-foreground))]" onClick={() => setOpen(true)}>
            Kasayı oluştur
          </Button>
        )}
      </div>

      <VaultDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}