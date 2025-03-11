import { $, sleep } from "bun";
import { expect, test } from "bun:test";
import { resolve } from "node:path";
import { acceptEncodingHandlers } from "./accept-encoding-handlers";

test("accept-encoding-handlers", async () => {
  const { originalPath, clear } = await setup();
  try {
    await Promise.all([
      runAndTest("br,gzip"),
      runAndTest("br"),
      runAndTest("br"),
    ]);
    await sleep(100);
    await Promise.all([
      runAndTest("br", "br"),
      runAndTest("br,zstd,gzip"),
      runAndTest("zstd"),
    ]);
    await sleep(100);
    await Promise.all([
      runAndTest("br,zstd,gzip", "zstd"),
      runAndTest("br", "br"),
      runAndTest("zstd", "zstd"),
    ]);
  } catch (e) {
    throw e;
  } finally {
    await clear();
  }
  async function runAndTest(
    acceptEncoding: string,
    expectedContentEncoding?: string
  ) {
    const res = await getResponse();
    if (expectedContentEncoding == null) {
      expect(res).toBeNil();
    } else {
      expect(res).not.toBeNil();
      expect(res?.headers.get("Content-Encoding")).toBe(
        expectedContentEncoding
      );
    }
    async function getResponse() {
      for (const handleAcceptEncoding of acceptEncodingHandlers) {
        const response = await handleAcceptEncoding(
          acceptEncoding,
          originalPath
        );
        if (response == null) break;
        else if (response instanceof Response) return response;
      }
    }
  }
});

async function setup() {
  const id = crypto.randomUUID();
  const publicTestDir = resolve(import.meta.dir, "../public/test");
  const dir = resolve(publicTestDir, id);
  const originalPath = resolve(dir, "index.html");
  await $`mkdir -p ${dir}`;
  await Bun.write(
    originalPath,
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>test</title>
</head>
<body>
  <div>hi!</div>
</body>
</html>`
  );
  return {
    originalPath,
    clear: async () => {
      await $`rm -rf ${dir}`;
    },
  };
}
