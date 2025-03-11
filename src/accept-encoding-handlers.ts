import {
  compressByBrotli,
  compressByZstd,
  type Compressor,
} from "./compressors";

export const acceptEncodingHandlers = [
  createAcceptEncodingHandler("zstd", compressByZstd),
  createAcceptEncodingHandler("br", compressByBrotli),
];

function createAcceptEncodingHandler(
  compressType: string,
  compressor: Compressor
) {
  return async (
    acceptEncoding: string,
    originalPath: string,
    checksum?: string
  ): Promise<Response | undefined | false> => {
    if (!acceptEncoding.includes(compressType)) return false;
    const { compressed, originalType, file } = await compressor(
      originalPath,
      checksum
    );
    if (!compressed) return;
    return new Response(file, {
      headers: {
        "Content-Type": originalType,
        "Content-Encoding": compressType,
        Vary: "Content-Encoding",
      },
    });
  };
}
