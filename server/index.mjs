import { createReadStream, existsSync } from "node:fs";
import { mkdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// KRYPT bağımsız sunucusu: veri JSON dosyasında, yükleme dosyaları data/uploads.
const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DATA_DIR = resolve(ROOT, process.env.KRYPT_DATA_DIR || "data");
const DB_FILE = join(DATA_DIR, "db.json");
const UPLOAD_DIR = join(DATA_DIR, "uploads");
const DIST = join(ROOT, "dist");
const PORT = Number(process.env.PORT || 8787);
const MAX_BODY = 12 * 1024 * 1024;

const DEFAULT_CONFIG = {
  key: "main",
  site_name: "KRYPT",
  tagline: "Şifreli tartışma ağı",
  hero_title: "Tartışma burada şifrelenir.",
  hero_subtitle:
    "Gönderiler tarayıcında şifrelenir, anahtarınla sarılır. Sunucu yalnızca şifreli blokları saklar.",
  neon_hue: 145,
  neon2_hue: 321,
  glow: 60,
  default_sort: "hot",
  allow_anonymous: true,
  allow_private_posts: true,
  allow_attachments: true,
  allow_downvotes: true,
  allow_new_topics: true,
  max_post_length: 20000,
  community_rules: "1. Kişisel veri paylaşma.\n2. Şifreli içeriği izinsiz çözme.\n3. Spam ve manipülasyon yasak.",
  global_css: "",
  maintenance: false,
  maintenance_text: "Kısa bir bakım çalışması yapıyoruz.",
  announcement: "",
};

const emptyDb = () => ({
  config: {},
  topics: [],
  posts: [],
  comments: [],
  votes: [],
  bookmarks: [],
  vaults: {},
});

const now = () => new Date().toISOString();
const newId = () => randomUUID();

function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function slugify(name) {
  return String(name || "")
    .toLowerCase()
    .replaceAll("ı", "i")
    .replaceAll("ş", "s")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

async function load() {
  let raw;
  try {
    raw = await readFile(DB_FILE, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return emptyDb();
    throw error;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Veritabanı dosyası bozuk; veri güvenliği için sıfırlanmadı.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Veritabanı biçimi geçersiz; veri güvenliği için sıfırlanmadı.");
  }

  const defaults = emptyDb();
  return {
    ...defaults,
    ...parsed,
    config: parsed.config && typeof parsed.config === "object" ? parsed.config : {},
    topics: Array.isArray(parsed.topics) ? parsed.topics : [],
    posts: Array.isArray(parsed.posts) ? parsed.posts : [],
    comments: Array.isArray(parsed.comments) ? parsed.comments : [],
    votes: Array.isArray(parsed.votes) ? parsed.votes : [],
    bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
    vaults: parsed.vaults && typeof parsed.vaults === "object" ? parsed.vaults : {},
  };
}

async function save(db) {
  await mkdir(DATA_DIR, { recursive: true, mode: 0o700 });
  const temporaryFile = `${DB_FILE}.${newId()}.tmp`;
  try {
    await writeFile(temporaryFile, JSON.stringify(db, null, 2), { mode: 0o600 });
    await rename(temporaryFile, DB_FILE);
  } catch (error) {
    await unlink(temporaryFile).catch(() => {});
    throw error;
  }
}

const handlers = {
  async getSiteConfig(_data, db) {
    return { config: { ...DEFAULT_CONFIG, ...(db.config || {}) }, persisted: Object.keys(db.config || {}).length > 0 };
  },
  async saveSiteConfig() {
    throw fail(403, "Bu sürümde site ayarları salt okunurdur.");
  },
  async getAdminState() {
    return { isAdmin: false, configuredEmail: null, email: null };
  },
  async listTopics(_data, db) {
    return [...db.topics].sort((a, b) => String(b.created_date || "").localeCompare(String(a.created_date || "")));
  },
  async createTopic(data, db) {
    const slug = slugify(data.name);
    if (!slug) throw fail(400, "Geçerli bir topluluk adı girin.");
    if (db.topics.some((topic) => topic.slug === slug)) throw fail(400, "Bu isimde bir topluluk zaten var.");
    const topic = {
      id: newId(),
      created_date: now(),
      name: data.name,
      slug,
      description: data.description || "",
      accent: data.accent || "#7CF9FF",
      icon: data.icon || "#",
      custom_css: data.custom_css || "",
      custom_html: data.custom_html || "",
      rules: data.rules || "",
      is_private: Boolean(data.is_private),
      post_count: 0,
      member_count: 1,
      pinned: false,
    };
    db.topics.push(topic);
    return topic;
  },
  async deleteTopic() {
    throw fail(403, "Bu sürümde topluluk silme işlemi kullanılamaz.");
  },
  async listFeed(data, db) {
    const limit = Math.min(Number(data.limit) || 20, 50);
    const offset = Math.max(0, Number(data.cursor) || 0);
    const topic = data.topicSlug || data.topic || "";
    let items = db.posts.filter((post) => !post.is_removed);
    if (topic) items = items.filter((post) => post.topic_slug === topic);
    if (data.q) {
      const q = String(data.q).toLowerCase();
      items = items.filter(
        (post) =>
          String(post.topic_name || "").toLowerCase().includes(q) ||
          String(post.author_name || "").toLowerCase().includes(q)
      );
    }
    const sort = data.sort === "new" ? "new" : data.sort === "top" ? "top" : "hot";
    items = [...items].sort((a, b) => {
      if (sort === "new") return String(b.created_date || "").localeCompare(String(a.created_date || ""));
      if (sort === "top") return (b.score || 0) - (a.score || 0);
      return (b.score || 0) + (b.comment_count || 0) * 2 - ((a.score || 0) + (a.comment_count || 0) * 2);
    });
    const page = items.slice(offset, offset + limit);
    const hasMore = offset + limit < items.length;
    return { items: page, next_cursor: hasMore ? String(offset + limit) : null, has_more: hasMore };
  },
  async getPost({ id }, db) {
    return db.posts.find((post) => post.id === id) || null;
  },
  async createPost(data, db) {
    const post = {
      id: newId(),
      created_date: now(),
      updated_date: now(),
      topic_id: data.topic_id || "",
      topic_slug: data.topic_slug || "",
      topic_name: data.topic_name || "",
      title_cipher: data.title_cipher,
      body_cipher: data.body_cipher,
      envelopes: data.envelopes,
      visibility: data.visibility === "private" ? "private" : "public",
      flair: data.flair || "",
      attachment_url: data.attachment_url || "",
      attachment_name: data.attachment_name || "",
      attachment_type: data.attachment_type || "",
      author_id: data._key || "",
      author_name: data.author_name || "Anon",
      is_anon: true,
      anon_secret_hash: data.anon_secret_hash || "",
      upvotes: 0,
      downvotes: 0,
      score: 0,
      comment_count: 0,
      is_pinned: false,
      is_locked: false,
      is_removed: false,
    };
    db.posts.push(post);
    if (post.topic_id) {
      const topic = db.topics.find((item) => item.id === post.topic_id);
      if (topic) topic.post_count = (topic.post_count || 0) + 1;
    }
    return post;
  },
  async deletePost({ id, anonSecretHash }, db) {
    const post = db.posts.find((item) => item.id === id);
    if (!post) throw fail(404, "Gönderi bulunamadı.");
    if (!post.anon_secret_hash || post.anon_secret_hash !== anonSecretHash) {
      throw fail(403, "Bu gönderiyi silme yetkiniz yok.");
    }
    const commentIds = new Set(
      db.comments.filter((comment) => comment.post_id === id).map((comment) => comment.id),
    );
    db.posts = db.posts.filter((item) => item.id !== id);
    db.comments = db.comments.filter((comment) => comment.post_id !== id);
    db.votes = db.votes.filter(
      (vote) =>
        !(vote.target_type === "post" && vote.target_id === id) &&
        !(vote.target_type === "comment" && commentIds.has(vote.target_id)),
    );
    db.bookmarks = db.bookmarks.filter((bookmark) => bookmark.post_id !== id);
    const topic = db.topics.find((item) => item.id === post.topic_id);
    if (topic) topic.post_count = Math.max(0, (topic.post_count || 1) - 1);
    return { ok: true };
  },
  async listComments({ postId }, db) {
    return db.comments
      .filter((comment) => comment.post_id === postId && !comment.is_removed)
      .sort((a, b) => String(b.created_date || "").localeCompare(String(a.created_date || "")));
  },
  async createComment(data, db) {
    const post = db.posts.find((item) => item.id === data.post_id && !item.is_removed);
    if (!post) throw fail(404, "Gönderi bulunamadı.");
    const parentId = data.parent_id || "";
    const parent = parentId
      ? db.comments.find(
          (item) => item.id === parentId && item.post_id === data.post_id && !item.is_removed,
        )
      : null;
    if (parentId && !parent) throw fail(400, "Yanıt verilecek yorum bulunamadı.");
    const depth = parent ? Number(parent.depth || 0) + 1 : 0;
    if (depth > 12) throw fail(400, "Yorum dizisi çok derin.");
    const comment = {
      id: newId(),
      created_date: now(),
      post_id: data.post_id,
      parent_id: parentId,
      body_cipher: data.body_cipher,
      envelopes: data.envelopes,
      visibility: data.visibility === "private" ? "private" : "public",
      author_id: data._key || "",
      author_name: data.author_name || "Anon",
      is_anon: true,
      anon_secret_hash: data.anon_secret_hash || "",
      upvotes: 0,
      downvotes: 0,
      score: 0,
      depth,
      is_removed: false,
    };
    db.comments.push(comment);
    post.comment_count = (post.comment_count || 0) + 1;
    return comment;
  },
  async deleteComment({ id, anonSecretHash }, db) {
    const comment = db.comments.find((item) => item.id === id);
    if (!comment) throw fail(404, "Yorum bulunamadı.");
    if (!comment.anon_secret_hash || comment.anon_secret_hash !== anonSecretHash) {
      throw fail(403, "Bu yorumu silme yetkiniz yok.");
    }
    const deletedIds = new Set([id]);
    let foundChild = true;
    while (foundChild) {
      foundChild = false;
      for (const item of db.comments) {
        if (item.post_id === comment.post_id && deletedIds.has(item.parent_id) && !deletedIds.has(item.id)) {
          deletedIds.add(item.id);
          foundChild = true;
        }
      }
    }
    db.comments = db.comments.filter((item) => !deletedIds.has(item.id));
    db.votes = db.votes.filter(
      (vote) => !(vote.target_type === "comment" && deletedIds.has(vote.target_id)),
    );
    const post = db.posts.find((item) => item.id === comment.post_id);
    if (post) post.comment_count = Math.max(0, (post.comment_count || deletedIds.size) - deletedIds.size);
    return { ok: true };
  },
  async vote({ targetType, targetId, voterKey, value, _key }, db) {
    if (targetType !== "post" && targetType !== "comment") {
      throw fail(400, "Geçersiz oy hedefi.");
    }
    if (!Number.isInteger(value) || ![-1, 0, 1].includes(value)) {
      throw fail(400, "Oy değeri -1, 0 veya 1 olmalıdır.");
    }
    if (!_key || voterKey !== _key) throw fail(403, "Oy kimliği geçersiz.");
    const target =
      targetType === "post"
        ? db.posts.find((item) => item.id === targetId)
        : db.comments.find((item) => item.id === targetId);
    if (!target) throw fail(404, "Kayıt bulunamadı.");
    const existing = db.votes.find(
      (item) => item.target_type === targetType && item.target_id === targetId && item.voter_key === voterKey
    );
    const prev = existing ? existing.value : 0;
    let upvotes = target.upvotes || 0;
    let downvotes = target.downvotes || 0;
    if (prev === 1) upvotes -= 1;
    if (prev === -1) downvotes -= 1;
    const next = prev === value ? 0 : value;
    if (next === 1) upvotes += 1;
    if (next === -1) downvotes += 1;
    upvotes = Math.max(0, upvotes);
    downvotes = Math.max(0, downvotes);
    if (existing) {
      if (next === 0) db.votes = db.votes.filter((item) => item !== existing);
      else existing.value = next;
    } else if (next !== 0) {
      db.votes.push({
        id: newId(),
        created_date: now(),
        target_type: targetType,
        target_id: targetId,
        voter_key: voterKey,
        value: next,
      });
    }
    target.upvotes = upvotes;
    target.downvotes = downvotes;
    target.score = upvotes - downvotes;
    return { upvotes, downvotes, score: upvotes - downvotes, myVote: next };
  },
  async myVotes({ voterKey, postId, _key }, db) {
    if (voterKey && voterKey !== _key) throw fail(403, "Oy kimliği geçersiz.");
    return db.votes.filter(
      (item) => item.voter_key === _key && (!postId || item.target_id === postId),
    );
  },
  async toggleBookmark({ postId, voterKey, _key }, db) {
    if (!_key || voterKey !== _key) throw fail(403, "Kaydetme kimliği geçersiz.");
    if (!db.posts.some((item) => item.id === postId && !item.is_removed)) {
      throw fail(404, "Gönderi bulunamadı.");
    }
    const existing = db.bookmarks.find((item) => item.post_id === postId && item.voter_key === _key);
    if (existing) {
      db.bookmarks = db.bookmarks.filter((item) => item !== existing);
      return { saved: false };
    }
    db.bookmarks.push({ id: newId(), created_date: now(), post_id: postId, voter_key: _key });
    return { saved: true };
  },
  async listBookmarks({ voterKey, _key }, db) {
    if (voterKey && voterKey !== _key) throw fail(403, "Kaydetme kimliği geçersiz.");
    const ids = db.bookmarks.filter((item) => item.voter_key === _key).map((item) => item.post_id);
    return db.posts.filter((post) => ids.includes(post.id));
  },
  async getMyProfile() {
    return null;
  },
  async saveMyProfile(data) {
    return data || {};
  },
  async getMyVault({ _key }, db) {
    const stored = (db.vaults || {})[_key];
    if (!stored) return null;
    return { vault: stored.vault, public_key: stored.public_key };
  },
  async saveMyVault({ _key, public_key, vault }, db) {
    if (!_key) throw fail(401, "Kasa için kimlik gerekli.");
    db.vaults = { ...(db.vaults || {}), [_key]: { public_key, vault, updated_date: now() } };
    return { ok: true };
  },
};

function readJson(request) {
  return new Promise((resolvePromise, rejectPromise) => {
    let size = 0;
    const chunks = [];
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        rejectPromise(fail(413, "İstek çok büyük."));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolvePromise({});
      try {
        resolvePromise(JSON.parse(raw));
      } catch {
        rejectPromise(fail(400, "Geçersiz JSON."));
      }
    });
    request.on("error", rejectPromise);
  });
}

function json(response, status, body) {
  const payload = JSON.stringify(body ?? null);
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  response.end(payload);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".zip": "application/zip",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

function sendFile(response, filePath) {
  response.writeHead(200, {
    "content-type": MIME[extname(filePath).toLowerCase()] || "application/octet-stream",
    "x-content-type-options": "nosniff",
  });
  createReadStream(filePath).pipe(response);
}

async function handleUpload(data) {
  const ext = extname(String(data.name || "file")).toLowerCase();
  const allowedTypes = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".pdf", ".txt", ".md", ".zip"]);
  if (!allowedTypes.has(ext)) throw fail(415, "Bu dosya türüne izin verilmiyor.");
  const bytes = Buffer.from(String(data.data || ""), "base64");
  if (!bytes.length) throw fail(400, "Boş dosya.");
  if (bytes.length > 8 * 1024 * 1024) throw fail(413, "Dosya en fazla 8 MB olabilir.");
  const signatures = {
    ".png": bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    ".jpg": bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255])),
    ".jpeg": bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255])),
    ".gif": ["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString("ascii")),
    ".webp": bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP",
    ".pdf": bytes.subarray(0, 5).toString("ascii") === "%PDF-",
    ".zip": bytes.subarray(0, 4).equals(Buffer.from([80, 75, 3, 4])),
  };
  if (signatures[ext] === false) throw fail(415, "Dosya içeriği uzantısıyla eşleşmiyor.");
  await mkdir(UPLOAD_DIR, { recursive: true });
  const fileName = `${newId()}${ext}`;
  await writeFile(join(UPLOAD_DIR, fileName), bytes);
  return { file_url: `/krypt-api/uploads/${fileName}` };
}

let fnQueue = Promise.resolve();

function enqueueFn(task) {
  const result = fnQueue.then(task, task);
  fnQueue = result.then(() => undefined, () => undefined);
  return result;
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://localhost:${PORT}`);

    if (request.method === "GET" && url.pathname === "/krypt-api/healthz") {
      json(response, 200, { status: "ok" });
      return;
    }

    if (request.method === "OPTIONS") {
      response.writeHead(204, { "x-content-type-options": "nosniff" });
      response.end();
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/krypt-api/fn/")) {
      const name = url.pathname.slice("/krypt-api/fn/".length);
      const handler = handlers[name];
      if (!handler) throw fail(404, "Bilinmeyen işlev.");
      const body = await readJson(request);
      const result = await enqueueFn(async () => {
        const db = await load();
        const value = await handler(body, db);
        await save(db);
        return value;
      });
      json(response, 200, result ?? null);
      return;
    }

    if (request.method === "POST" && url.pathname === "/krypt-api/upload") {
      const body = await readJson(request);
      json(response, 200, await handleUpload(body));
      return;
    }

    if (request.method === "GET" && url.pathname.startsWith("/krypt-api/uploads/")) {
      const name = url.pathname.slice("/krypt-api/uploads/".length);
      const filePath = join(UPLOAD_DIR, name.replace(/[^A-Za-z0-9._-]/g, ""));
      if (!existsSync(filePath)) throw fail(404, "Dosya bulunamadı.");
      sendFile(response, filePath);
      return;
    }

    if (request.method === "GET") {
      const relative = url.pathname.replace(/^\/+/, "");
      const candidate = join(DIST, relative);
      if (relative && existsSync(candidate)) {
        const info = await stat(candidate);
        if (info.isFile()) {
          sendFile(response, candidate);
          return;
        }
      }
      const indexFile = join(DIST, "index.html");
      if (existsSync(indexFile)) {
        sendFile(response, indexFile);
        return;
      }
      response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
      response.end("KRYPT API çalışıyor. Arayüz için `npm run build` sonrası bu adresi açın.");
      return;
    }

    throw fail(404, "Bulunamadı.");
  } catch (error) {
    json(response, error.status || 500, { error: error.message || "Sunucu hatası." });
  }
});

server.listen(PORT, () => {
  console.log(`KRYPT API http://localhost:${PORT} adresinde çalışıyor.`);
});