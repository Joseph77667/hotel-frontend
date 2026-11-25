/** "CHECKED_IN" → "Checked in", "CREDIT_CARD" → "Credit card" */
export function toLabel(value: string): string {
  const text = value.replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}
