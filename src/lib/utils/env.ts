export function envOrThrow(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is missing in environment`);
  }
  return value;
}
