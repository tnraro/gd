export function formatSize(x: number, i = 0) {
  const units = ["B", "KiB", "MiB"];
  if (x < 1024) return `${x} ${units[i]}`;
  return formatSize(Math.trunc(x / 1024), i + 1);
}
