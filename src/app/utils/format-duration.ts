export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '< 1s';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
