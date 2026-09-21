export function linkUp(a: { x: number; y: number }, b: { x: number; y: number }, range_m: number): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) <= range_m;
}
