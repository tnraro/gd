import { readdir } from "node:fs/promises";
import { resolve } from "node:path";

const publicDir = "public";

Bun.serve({
  async fetch(req) {
    const url = new URL(req.url);
    let path = decodeURIComponent(url.pathname);
    console.log(req.method, path);
    if (path === "/") {
      const directories = await readDirectories(publicDir);
      return new Response(
        `<ul>${directories
          .map((fn) => `<li><a href="/${fn}/">${fn}</a></li>`)
          .join("")}</ul>`,
        {
          headers: { "content-type": "text/html;charset=utf-8" },
        }
      );
    }
    if (path.includes("/.")) {
      return notFound();
    }
    if (path.endsWith("/")) path += "index.html";
    const file = Bun.file(resolve(publicDir, path.slice(1)));
    if (!(await file.exists())) return notFound();
    return new Response(file);
  },
});

function notFound() {
  return new Response("Not Found", { status: 404 });
}

async function readDirectories(path: string) {
  const filenames = await readdir(path);
  const files = await Promise.all(
    filenames.map(async (filename) => ({
      filename,
      stat: await Bun.file(resolve(publicDir, filename)).stat(),
    }))
  );
  return files
    .filter(
      ({ filename, stat }) => stat.isDirectory() && !filename.startsWith(".")
    )
    .map(({ filename }) => filename);
}
