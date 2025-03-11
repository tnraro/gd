import { bench, run, summary } from "mitata";

{
  const input = new Uint8Array(
    await Bun.file("public/yf2g/index.wasm").arrayBuffer()
  );
  summary(() => {
    bench("wyhash", () => Bun.hash(input));
    bench("crc32", () => Bun.hash.crc32(input));
    bench("adler32", () => Bun.hash.adler32(input));
    bench("cityHash32", () => Bun.hash.cityHash32(input));
    bench("cityHash64", () => Bun.hash.cityHash64(input));
    bench("xxHash32", () => Bun.hash.xxHash32(input));
    bench("xxHash64", () => Bun.hash.xxHash64(input));
    bench("xxHash3", () => Bun.hash.xxHash3(input));
    bench("murmur32v3", () => Bun.hash.murmur32v3(input));
    bench("murmur32v2", () => Bun.hash.murmur32v2(input));
    bench("murmur64v2", () => Bun.hash.murmur64v2(input));
  });
}

{
  const input = new Uint8Array(
    await Bun.file("public/yf2g/index.js").arrayBuffer()
  );
  summary(() => {
    bench("wyhash", () => Bun.hash(input));
    bench("crc32", () => Bun.hash.crc32(input));
    bench("adler32", () => Bun.hash.adler32(input));
    bench("cityHash32", () => Bun.hash.cityHash32(input));
    bench("cityHash64", () => Bun.hash.cityHash64(input));
    bench("xxHash32", () => Bun.hash.xxHash32(input));
    bench("xxHash64", () => Bun.hash.xxHash64(input));
    bench("xxHash3", () => Bun.hash.xxHash3(input));
    bench("murmur32v3", () => Bun.hash.murmur32v3(input));
    bench("murmur32v2", () => Bun.hash.murmur32v2(input));
    bench("murmur64v2", () => Bun.hash.murmur64v2(input));
  });
}

await run();
