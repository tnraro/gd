import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { acceptEncodingHandlers } from "./accept-encoding-handlers";
import { checksum } from "./checksum";
import { formatTime } from "./utls/format-time";

const publicDir = "public";

Bun.serve({
  async fetch(req) {
    const url = new URL(req.url);
    let path = decodeURIComponent(url.pathname);
    const t0 = performance.now();
    try {
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

      const filePath = resolve(publicDir, path.slice(1));
      const file = Bun.file(filePath);
      if (!(await file.exists())) return notFound();
      const acceptEncoding = req.headers.get("Accept-Encoding");
      if (acceptEncoding != null) {
        const hash =
          Bun.env.USE_CHECKSUM != null
            ? checksum(await file.arrayBuffer())
            : undefined;
        for (const handleAcceptEncoding of acceptEncodingHandlers) {
          const response = await handleAcceptEncoding(
            acceptEncoding,
            filePath,
            hash
          );
          if (response == null) break;
          else if (response instanceof Response) return response;
        }
      }
      return new Response(file);
    } catch (e) {
      throw e;
    } finally {
      console.info(req.method, formatTime(performance.now() - t0), path);
    }
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
