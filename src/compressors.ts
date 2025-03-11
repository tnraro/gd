import type { BunFile } from "bun";
import { brotliCompressSync, constants } from "node:zlib";
import { compress as _compressByZstd } from "zstd.ts";

export type Compressor = (
  originalPath: string,
  checksum?: string
) => Promise<{ compressed: boolean; originalType: string; file: BunFile }>;

export const compressByZstd = createCompressorWithMutex("zstd", (buffer) =>
  _compressByZstd({
    input: Buffer.from(buffer),
  })
);
export const compressByBrotli = createCompressorWithMutex(
  "br",
  async (buffer) =>
    brotliCompressSync(buffer, {
      params: { [constants.BROTLI_PARAM_QUALITY]: 3 },
    })
);

export function createCompressorWithMutex(
  ext: string,
  compress: (
    arrayBuffer: ArrayBuffer
  ) => Promise<
    Blob | NodeJS.TypedArray | ArrayBufferLike | string | Bun.BlobPart[]
  >
): Compressor {
  const mutexes = new Set<string>();

  return async (originalPath, checksum) => {
    const path = `${originalPath}${
      checksum != null ? `.${checksum}` : ""
    }.${ext}`;
    const originalFile = Bun.file(originalPath);
    {
      const file = Bun.file(path);
      if (await file.exists()) {
        return {
          compressed: true,
          originalType: originalFile.type,
          file,
        };
      }
    }
    if (!mutexes.has(originalPath)) {
      process();
    }
    return {
      compressed: false,
      originalType: originalFile.type,
      file: originalFile,
    };
    async function process() {
      mutexes.add(originalPath);
      try {
        const originalArrayBuffer = await originalFile.arrayBuffer();
        const compressedData = await compress(originalArrayBuffer);
        await Bun.write(path, compressedData);
      } catch (e) {
        throw e;
      } finally {
        mutexes.delete(originalPath);
      }
    }
  };
}
