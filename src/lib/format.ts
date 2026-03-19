import i18n from "@/i18n";

/**
 * Format a date according to the current locale.
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const locale = i18n.language;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  return d.toLocaleDateString(locale, defaultOptions);
}

/**
 * Format a date with time according to the current locale.
 */
export function formatDateTime(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const locale = i18n.language;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };

  return d.toLocaleString(locale, defaultOptions);
}

/**
 * Format a number according to the current locale.
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  const locale = i18n.language;
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format currency according to the current locale.
 */
export function formatCurrency(
  value: number,
  currency = "ETB",
  options?: Intl.NumberFormatOptions,
): string {
  const locale = i18n.language;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    ...options,
  }).format(value);
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days").
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const locale = i18n.language;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(diffDay) >= 1) return rtf.format(diffDay, "day");
  if (Math.abs(diffHour) >= 1) return rtf.format(diffHour, "hour");
  if (Math.abs(diffMin) >= 1) return rtf.format(diffMin, "minute");
  return rtf.format(diffSec, "second");
}
