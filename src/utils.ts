export function hasOwn(obj: Record<string, any>, key: string | symbol) {
  return Object.hasOwnProperty.call(obj, key);
}
