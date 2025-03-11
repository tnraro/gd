export function checksum(
  input: string | ArrayBufferView | ArrayBuffer | SharedArrayBuffer
) {
  return Bun.hash.xxHash3(input).toString(36);
}
