export function formatPrice(value: number | null | undefined, currency = "CZK"): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}

export function formatDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("cs-CZ", { dateStyle: "medium", timeStyle: "short" }).format(d);
}
