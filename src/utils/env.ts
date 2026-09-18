export function envOrThrow(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is missing in environment`);
  }

  return value;
}

export function envOrThrowNumber(key: string) {
  const numberValue = parseInt(envOrThrow(key), 10);
  if (!Number.isSafeInteger(numberValue)) {
    throw new Error(`${key} is not a valid number`);
  }
  return numberValue;
}
