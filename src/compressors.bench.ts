import { brotliCompressSync, constants } from "node:zlib";
import { compress as compressByZstd } from "zstd.ts";
import { formatSize } from "./utls/format-size";
import { formatTime } from "./utls/format-time";

type Task = { name: string; delta: number; size: number };
let tasks: Task[] = [];

{
  const input = Buffer.from(
    await Bun.file("public/yf2g/index.wasm").arrayBuffer()
  );
  await summary(input, async () => {
    await bench("brotli 3 zlib", () =>
      brotliCompressSync(input, {
        params: { [constants.BROTLI_PARAM_QUALITY]: 3 },
      })
    );
    await bench("zstd 3", () => compressByZstd({ input, compressLevel: 3 }));
  });
}

{
  const input = Buffer.from(
    await Bun.file("public/yf2g/index.js").arrayBuffer()
  );
  await summary(input, async () => {
    await bench("brotli 3 zlib", () =>
      brotliCompressSync(input, {
        params: { [constants.BROTLI_PARAM_QUALITY]: 3 },
      })
    );
    await bench("zstd 3", () => compressByZstd({ input, compressLevel: 3 }));
  });
}
{
  const input = Buffer.from(
    await Bun.file("public/yf2g/index.html").arrayBuffer()
  );
  await summary(input, async () => {
    await bench("brotli 3 zlib", () =>
      brotliCompressSync(input, {
        params: { [constants.BROTLI_PARAM_QUALITY]: 3 },
      })
    );
    await bench("zstd 3", () => compressByZstd({ input, compressLevel: 3 }));
  });
}

async function summary(input: Buffer, fn: () => Promise<void>) {
  tasks = [];
  await fn();
  tasks.sort((a, b) => a.size - b.size);
  tasks.sort((a, b) => a.delta - b.delta);
  console.table(
    tasks.map((result) => ({
      name: result.name,
      delta: formatTime(result.delta),
      size: `${formatSize(input.byteLength)} -> ${formatSize(
        result.size
      )} (${Math.trunc((result.size / input.byteLength) * 100)}%)`,
    }))
  );
}

async function bench(name: string, fn: () => Promise<Buffer> | Uint8Array) {
  const t0 = performance.now();
  const result = await fn();
  tasks.push({
    name,
    delta: performance.now() - t0,
    size: result.byteLength,
  });
}
