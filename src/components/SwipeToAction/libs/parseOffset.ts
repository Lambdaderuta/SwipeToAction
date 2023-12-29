export const parseOffset = (value: string): number =>
  Number.parseInt(value.replace(/[^0-9-]/g, ''), 10);
