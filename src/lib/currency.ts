export type CurrencyOption = { code: string; label: string; symbol: string };

export const CURRENCIES: CurrencyOption[] = [
  { code: "NGN", label: "Nigerian Naira", symbol: "₦" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "CAD", label: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
  { code: "GHS", label: "Ghanaian Cedi", symbol: "GH₵" },
  { code: "KES", label: "Kenyan Shilling", symbol: "KSh" },
  { code: "ZAR", label: "South African Rand", symbol: "R" },
  { code: "EGP", label: "Egyptian Pound", symbol: "E£" },
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "AED", label: "UAE Dirham", symbol: "AED" },
  { code: "SAR", label: "Saudi Riyal", symbol: "SAR" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥" },
  { code: "CNY", label: "Chinese Yuan", symbol: "CN¥" },
  { code: "BRL", label: "Brazilian Real", symbol: "R$" },
  { code: "MXN", label: "Mexican Peso", symbol: "MX$" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$" },
  { code: "CHF", label: "Swiss Franc", symbol: "CHF" },
  { code: "SEK", label: "Swedish Krona", symbol: "kr" },
  { code: "NOK", label: "Norwegian Krone", symbol: "kr" },
  { code: "PLN", label: "Polish Zloty", symbol: "zł" },
  { code: "TRY", label: "Turkish Lira", symbol: "₺" },
  { code: "NZD", label: "New Zealand Dollar", symbol: "NZ$" },
];

const COUNTRY_CURRENCY: Record<string, string> = {
  NG: "NGN", US: "USD", GB: "GBP", IE: "EUR", DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR",
  NL: "EUR", BE: "EUR", PT: "EUR", AT: "EUR", FI: "EUR", GR: "EUR", CA: "CAD", AU: "AUD",
  NZ: "NZD", GH: "GHS", KE: "KES", ZA: "ZAR", EG: "EGP", IN: "INR", AE: "AED", SA: "SAR",
  JP: "JPY", CN: "CNY", BR: "BRL", MX: "MXN", SG: "SGD", CH: "CHF", SE: "SEK", NO: "NOK",
  PL: "PLN", TR: "TRY",
};

const TZ_COUNTRY: Record<string, string> = {
  "Africa/Lagos": "NG", "Africa/Accra": "GH", "Africa/Nairobi": "KE",
  "Africa/Johannesburg": "ZA", "Africa/Cairo": "EG", "Europe/London": "GB",
  "Europe/Dublin": "IE", "Europe/Paris": "FR", "Europe/Berlin": "DE",
  "Europe/Madrid": "ES", "Europe/Rome": "IT", "Europe/Amsterdam": "NL",
  "Europe/Zurich": "CH", "Europe/Stockholm": "SE", "Europe/Oslo": "NO",
  "Europe/Warsaw": "PL", "Europe/Istanbul": "TR", "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN", "Asia/Dubai": "AE", "Asia/Riyadh": "SA",
  "Asia/Tokyo": "JP", "Asia/Shanghai": "CN", "Asia/Singapore": "SG",
  "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US",
  "America/Los_Angeles": "US", "America/Toronto": "CA", "America/Vancouver": "CA",
  "America/Sao_Paulo": "BR", "America/Mexico_City": "MX",
  "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "Pacific/Auckland": "NZ",
};

/** Best-effort currency for the visitor's location. Browser-only; returns null on the server. */
export function detectCurrency(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const locale = navigator.language || "";
    const region = new Intl.Locale(locale).maximize().region;
    if (region && COUNTRY_CURRENCY[region]) return COUNTRY_CURRENCY[region];
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const country = tz ? TZ_COUNTRY[tz] : undefined;
    if (country) return COUNTRY_CURRENCY[country] ?? null;
  } catch {
    return null;
  }
  return null;
}

export function formatMoney(amount: number, currency = "NGN") {
  try {
    return new Intl.NumberFormat(
      typeof navigator !== "undefined" ? navigator.language : "en-US",
      { style: "currency", currency, maximumFractionDigits: 2 },
    ).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
