import { Link, createFileRoute } from "@tanstack/react-router";
import { Activity, ArrowRight, Flame, Hash, Lock, Sparkles, Users, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/forum/PostCard";
import { getSiteConfig, listFeed, listTopics } from "@/lib/server-fns";
import { useDecryptedPosts } from "@/lib/useDecrypt";

export const Route = createFileRoute("/_site/")({
  validateSearch: (search) => ({ sort: search.sort, topic: search.topic, q: search.q }),
  loaderDeps: ({ search }) => ({
    sort: ["hot", "new", "top"].includes(search.sort) ? search.sort : "hot",
    topic: search.topic || "",
  }),
  loader: async ({ deps }) => {
    const [configResult, topics, feed] = await Promise.all([
      getSiteConfig(),
      listTopics(),
      listFeed({ data: { sort: deps.sort, topicSlug: deps.topic || undefined, limit: 20 } }),
    ]);
    return { config: configResult.config, topics, feed };
  },
  head: () => ({
    meta: [
      { title: "KRYPT — Şifreli Tartışma Ağı" },
      { name: "description", content: "Uçtan uca şifreli gönderiler, anonim yorumlar ve neon topluluklar." },
    ],
  }),
  component: HomePage,
});

const SORTS = [
  { key: "hot", label: "Sıcak", icon: Flame },
  { key: "new", label: "Yeni", icon: Sparkles },
  { key: "top", label: "En iyi", icon: Zap },
];

function HomePage() {
  const { config, topics, feed } = Route.useLoaderData();
  const search = Route.useSearch();
  const sort = ["hot", "new", "top"].includes(search.sort) ? search.sort : "hot";
  const decoded = useDecryptedPosts(feed.items);
  const [query, setQuery] = useState(search.q || "");

  const posts = useMemo(() => {
    const list = feed.items || [];
    const needle = query.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((post) => {
      const text = decoded[post.id];
      return (
        (text?.title || "").toLowerCase().includes(needle) ||
        (text?.body || "").toLowerCase().includes(needle) ||
        (post.author_name || "").toLowerCase().includes(needle) ||
        (post.topic_name || "").toLowerCase().includes(needle)
      );
    });
  }, [feed.items, query, decoded]);

  const members = useMemo(() => {
    const byName = new Map();
    (feed.items || []).forEach((post) => {
      const name = String(post.author_name || "anon").trim() || "anon";
      const key = name.toLocaleLowerCase("tr-TR");
      const member = byName.get(key) || { name, postCount: 0 };
      member.postCount += 1;
      byName.set(key, member);
    });
    return [...byName.values()].sort((a, b) => b.postCount - a.postCount).slice(0, 6);
  }, [feed.items]);

  return (
    <div className="feed-page pt-4">
      {config.announcement && (
        <div className="mb-4 rounded-xl border border-[hsl(var(--neon))]/25 bg-[hsl(var(--neon))]/[0.06] px-4 py-3 text-sm text-white/80 shadow-[0_0_30px_-20px_hsl(var(--neon))]">
          {config.announcement}
        </div>
      )}

      <div className="feed-shell grid overflow-hidden border border-[hsl(var(--neon-2))]/25 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="feed-main min-w-0 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="feed-hero mb-6">
            <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="feed-kicker font-mono text-[9px] uppercase tracking-[0.18em]">
                <span className="signal-dot" aria-hidden="true" />
                KRYPT / güvenli topluluk akışı
              </span>
              <h1 className="mt-4 flex items-center gap-3 text-balance font-heading text-2xl font-semibold uppercase tracking-[-0.045em] text-white sm:text-3xl">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[hsl(var(--neon))]/30 bg-[hsl(var(--neon))]/[0.08] text-[hsl(var(--neon))] shadow-[0_0_24px_-12px_hsl(var(--neon))]">
                  <Lock className="h-4 w-4" />
                </span>
                Başlıklar ve postlar
              </h1>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">Şifreli tartışmalar, doğrudan topluluktan.</p>
            </div>
            <Link to="/topics" className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--neon-2))]/25 bg-[hsl(var(--neon-2))]/[0.06] px-3.5 py-2.5 font-mono text-[10px] uppercase tracking-wider text-[hsl(var(--neon-2))] transition hover:border-[hsl(var(--neon-2))]/50 hover:bg-[hsl(var(--neon-2))]/[0.1] hover:text-white">
              Kanalları keşfet <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            </div>
            <div className="feed-stats relative z-10" aria-label="Akış özeti">
              <span className="feed-stat">
                <Activity className="h-3.5 w-3.5 text-[hsl(var(--neon))]" />
                <span className="font-mono text-[9px] uppercase tracking-wider">yüklenen akış</span>
                <strong>{feed.items?.length || 0}</strong>
              </span>
              <span className="feed-stat">
                <Hash className="h-3.5 w-3.5 text-[hsl(var(--signal-blue))]" />
                <span className="font-mono text-[9px] uppercase tracking-wider">kanal</span>
                <strong>{topics.length}</strong>
              </span>
              <span className="feed-stat">
                <Users className="h-3.5 w-3.5 text-[hsl(var(--neon-2))]" />
                <span className="font-mono text-[9px] uppercase tracking-wider">katkı veren</span>
                <strong>{members.length}</strong>
              </span>
            </div>
          </div>

          <div className="feed-controls flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 border border-white/10 bg-white/[0.025] p-1">
              {SORTS.map(({ key, label, icon: Icon }) => (
                <Link
                  key={key}
                  to="/"
                  search={{ sort: key, topic: search.topic }}
                  className={
                    sort === key
                       ? "inline-flex items-center gap-1.5 bg-[hsl(var(--neon))] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[hsl(var(--primary-foreground))]"
                       : "inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-white"
                  }
                >
                  <Icon className="h-3 w-3" /> {label}
                </Link>
              ))}
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Akışta filtrele"
              placeholder="Başlık, yazar veya kanal ara…"
              className="h-9 min-w-[180px] flex-1 rounded-sm border border-white/10 bg-white/[0.025] px-3 font-mono text-[11px] outline-none placeholder:text-muted-foreground/70 focus:border-[hsl(var(--neon))]/50"
            />
          </div>

          {search.topic && (
            <div className="mt-3 flex items-center gap-2">
              <span className="mono-label">filtre</span>
              <Link to="/" search={{ sort }} className="rounded-sm border border-white/15 px-2.5 py-1 font-mono text-[10px] text-white/70 hover:text-white">
                #{search.topic} <span aria-hidden="true">×</span>
              </Link>
            </div>
          )}

          <div className="mt-5 space-y-3">
            {posts.length === 0 && (
              <div className="border border-dashed border-white/15 bg-white/[0.015] px-6 py-14 text-center">
                <p className="font-heading text-base text-white/80">{query ? "Bu aramayla eşleşen gönderi bulunamadı." : "Burada henüz şifreli bir gönderi yok."}</p>
                <Button asChild size="sm" className="mt-4 rounded-sm bg-[hsl(var(--neon))] font-mono text-[10px] uppercase text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--neon))]/90">
                  <Link to="/submit">İlk gönderiyi oluştur</Link>
                </Button>
              </div>
            )}
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} decoded={decoded[post.id]} index={index} />
            ))}
          </div>
        </section>

        <aside className="feed-sidebar border-t border-white/10 lg:border-l lg:border-t-0">
          <section className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--neon))]">Kanallar</h2>
              <Link to="/topics" aria-label="Tüm kanalları gör" className="grid h-7 w-7 place-items-center border border-white/10 text-muted-foreground transition hover:border-[hsl(var(--neon))]/40 hover:text-[hsl(var(--neon))]">
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ul className="mt-4">
              {topics.slice(0, 6).map((topic) => (
                <li key={topic.id}>
                  <Link
                    to="/t/$slug"
                    params={{ slug: topic.slug }}
                    className="flex items-center justify-between border-b border-white/[0.07] px-2 py-3 text-sm transition hover:bg-white/[0.035]"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: topic.accent, boxShadow: `0 0 8px ${topic.accent}` }}
                      />
                      <span className="text-white/85">#{topic.name}</span>
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">{topic.post_count || 0}</span>
                  </Link>
                </li>
              ))}
              {topics.length === 0 && (
                <li className="px-2 py-4 text-sm text-muted-foreground">
                  Henüz topluluk yok.{" "}
                  <Link to="/topics" className="text-[hsl(var(--neon))]">
                    Oluştur
                  </Link>
                </li>
              )}
            </ul>
          </section>

          <section className="border-t border-white/10 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[hsl(var(--neon))]" />
              <h2 className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--neon))]">Üyeler</h2>
            </div>
            <ul className="mt-4">
              {members.map((member) => (
                <li key={member.name} className="flex items-center gap-3 border-b border-white/[0.07] px-2 py-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center border border-[hsl(var(--neon))]/25 bg-[hsl(var(--neon))]/[0.06] font-mono text-xs uppercase text-[hsl(var(--neon))]">
                    {Array.from(member.name)[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-white/85">{member.name}</span>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{member.postCount} gönderi</span>
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--neon))]/70" aria-hidden="true" />
                </li>
              ))}
              {members.length === 0 && (
                <li className="px-2 py-4 text-sm leading-relaxed text-muted-foreground">İlk gönderiler geldikçe katkı veren üyeler burada görünür.</li>
              )}
            </ul>
          </section>

          <section className="border-t border-white/10 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center border border-[hsl(var(--neon))]/25 text-[hsl(var(--neon))]"><Lock className="h-3.5 w-3.5" /></span>
              <div>
                <h2 className="font-mono text-[10px] uppercase tracking-wider text-white/75">Uçtan uca şifreli</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">İçerik tarayıcında çözülür; sunucuda düz metin tutulmaz.</p>
                <Link to="/source" className="mt-3 inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-[hsl(var(--neon))]">
                  Nasıl çalışır? <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}