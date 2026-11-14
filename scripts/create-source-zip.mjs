import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createZip } from "../src/lib/zip.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUTPUT_FILE = join(ROOT, "public", "krypt-self-hosted.zip");
const files = [];

async function collect(directory, archivePrefix) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    const archivePath = `${archivePrefix}/${entry.name}`.split(sep).join("/");
    if (archivePath === "krypt/public/krypt-self-hosted.zip") continue;
    if (archivePath === "krypt/scripts/standalone-package.json") continue;
    if (entry.isDirectory()) {
      await collect(fullPath, archivePath);
    } else if (entry.isFile()) {
      files.push({ name: archivePath, content: await readFile(fullPath) });
    }
  }
}

for (const directory of ["src", "server", "public", "scripts"]) {
  await collect(join(ROOT, directory), `krypt/${directory}`);
}

for (const file of [
  "index.html",
  "components.json",
  "vite.config.ts",
  "tsconfig.json",
  "README.md",
  "Dockerfile",
  "compose.yml",
  ".gitignore",
  ".dockerignore",
]) {
  files.push({ name: `krypt/${file}`, content: await readFile(join(ROOT, file)) });
}

let standaloneManifest;
try {
  standaloneManifest = await readFile(join(ROOT, "scripts", "standalone-package.json"));
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
  // The self-hosted archive already has its standalone package.json.
  standaloneManifest = await readFile(join(ROOT, "package.json"));
}

files.push({ name: "krypt/package.json", content: standaloneManifest });

files.sort((a, b) => a.name.localeCompare(b.name));
const archive = createZip(files);
await writeFile(OUTPUT_FILE, new Uint8Array(await archive.arrayBuffer()));
console.log(`KRYPT source archive created (${files.length} files).`);
