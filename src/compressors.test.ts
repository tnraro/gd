import { $, sleep } from "bun";
import { expect, test } from "bun:test";
import { resolve } from "node:path";
import { compressByZstd } from "./compressors";

test("compressor mutex", async () => {
  const { originalPath, clear } = await setup();
  try {
    await Promise.all([
      runAndTest(false),
      runAndTest(false),
      runAndTest(false),
      runAndTest(false),
    ]);
    await sleep(200);
    await runAndTest(true);
  } catch (e) {
    throw e;
  } finally {
    await clear();
  }
  async function runAndTest(expectedCompressed: boolean) {
    const { compressed } = await compressByZstd(originalPath);
    expect(compressed).toBe(expectedCompressed);
  }
});

test("compressor mutexes", async () => {
  const a = await setup();
  const b = await setup();
  try {
    await Promise.all([
      runAndTest(a.originalPath, false),
      runAndTest(a.originalPath, false),
      runAndTest(a.originalPath, false),
      runAndTest(a.originalPath, false),
      runAndTest(b.originalPath, false),
    ]);
    await sleep(200);
    await runAndTest(a.originalPath, true);
    await runAndTest(b.originalPath, true);
  } catch (e) {
    throw e;
  } finally {
    await a.clear();
    await b.clear();
  }
  async function runAndTest(path: string, expectedCompressed: boolean) {
    const { compressed } = await compressByZstd(path);
    expect(compressed).toBe(expectedCompressed);
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
