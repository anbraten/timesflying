export function toDate(value: Date | number): Date {
  return value instanceof Date ? value : new Date(value);
}
