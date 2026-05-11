const PLACEHOLDER_NAMES = new Set([
  "Google account connected",
  "Meta account connected",
  "Google owner account"
]);

export function isPlaceholderConnectionName(value?: string | null) {
  if (!value) {
    return true;
  }

  return PLACEHOLDER_NAMES.has(value.trim());
}

export function getMeaningfulConnectionName(value?: string | null) {
  if (!value || isPlaceholderConnectionName(value)) {
    return null;
  }

  return value;
}
