export const findClosestInteger = (arr: number[], target: number): number =>
  arr.reduce((prev, curr) => (Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev));
