export function formatTime(x: number) {
  const cutoffs = [1_000, 60_000, 3_600_000, Number.MAX_SAFE_INTEGER];
  const timeUnits = ["ms", "s", "m", "h"];
  const index = cutoffs.findIndex((cutoff) => x < cutoff);

  const divider = cutoffs[index - 1] ?? 1;
  const unit = timeUnits[index];
  return `${Math.trunc((x / divider) * 100) / 100} ${unit}`;
}
