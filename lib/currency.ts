import type { Locale } from "./i18n";

const THB_TO_USD = 34;
const THB_TO_CNY = 4.8;

/**
 * Format price for display by locale.
 * Base price is always stored in THB.
 * - th: ฿ (THB)
 * - en: approx. USD ($), THB / 34
 * - cn: approx. CNY (¥), THB / 4.8, with 约 prefix
 */
export function formatPrice(priceThb: number, locale: Locale): string {
  const n = Number(priceThb);
  if (Number.isNaN(n) || n < 0) return "—";

  if (locale === "th") {
    return `฿${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  if (locale === "en") {
    const usd = Math.round(n / THB_TO_USD);
    return `$${usd.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  if (locale === "cn") {
    const cny = Math.round(n / THB_TO_CNY);
    return `约 ¥${cny.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  return `฿${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
