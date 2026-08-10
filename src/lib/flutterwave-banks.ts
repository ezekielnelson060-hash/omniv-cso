/**
 * Banks / wallets for payout.
 * Auto-split (Flutterwave subaccounts) works best in FLW markets.
 * Other countries save details for platform payout to their account.
 */

export type FlwBank = {
  code: string;
  name: string;
  country: string;
};

export const AUTO_SPLIT_COUNTRIES = new Set([
  "NG",
  "GH",
  "KE",
  "ZA",
  "UG",
  "RW",
  "TZ",
  "ZM",
  "CI",
  "SN",
  "CM",
]);

export const PAYOUT_COUNTRIES: {
  code: string;
  name: string;
  region: string;
  autoSplit: boolean;
}[] = [
  { code: "NG", name: "Nigeria", region: "Africa", autoSplit: true },
  { code: "GH", name: "Ghana", region: "Africa", autoSplit: true },
  { code: "KE", name: "Kenya", region: "Africa", autoSplit: true },
  { code: "ZA", name: "South Africa", region: "Africa", autoSplit: true },
  { code: "UG", name: "Uganda", region: "Africa", autoSplit: true },
  { code: "RW", name: "Rwanda", region: "Africa", autoSplit: true },
  { code: "TZ", name: "Tanzania", region: "Africa", autoSplit: true },
  { code: "ZM", name: "Zambia", region: "Africa", autoSplit: true },
  { code: "CI", name: "Cote d'Ivoire", region: "Africa", autoSplit: true },
  { code: "SN", name: "Senegal", region: "Africa", autoSplit: true },
  { code: "CM", name: "Cameroon", region: "Africa", autoSplit: true },
  { code: "US", name: "United States", region: "Americas", autoSplit: false },
  { code: "CA", name: "Canada", region: "Americas", autoSplit: false },
  { code: "BR", name: "Brazil", region: "Americas", autoSplit: false },
  { code: "MX", name: "Mexico", region: "Americas", autoSplit: false },
  { code: "GB", name: "United Kingdom", region: "Europe", autoSplit: false },
  { code: "DE", name: "Germany", region: "Europe", autoSplit: false },
  { code: "FR", name: "France", region: "Europe", autoSplit: false },
  { code: "NL", name: "Netherlands", region: "Europe", autoSplit: false },
  { code: "ES", name: "Spain", region: "Europe", autoSplit: false },
  { code: "IT", name: "Italy", region: "Europe", autoSplit: false },
  { code: "SE", name: "Sweden", region: "Europe", autoSplit: false },
  { code: "AE", name: "United Arab Emirates", region: "Asia / Middle East", autoSplit: false },
  { code: "IN", name: "India", region: "Asia / Middle East", autoSplit: false },
  { code: "SG", name: "Singapore", region: "Asia / Middle East", autoSplit: false },
  { code: "JP", name: "Japan", region: "Asia / Middle East", autoSplit: false },
  { code: "KR", name: "South Korea", region: "Asia / Middle East", autoSplit: false },
  { code: "AU", name: "Australia", region: "Oceania", autoSplit: false },
  { code: "OTHER", name: "Other country", region: "Global", autoSplit: false },
];

export const ARTIST_SHARE_PCT = 90;
export const PLATFORM_SHARE_PCT = 10;

export const FLW_BANKS: FlwBank[] = [
  { code: "044", name: "Access Bank", country: "NG" },
  { code: "063", name: "Access (Diamond)", country: "NG" },
  { code: "050", name: "Ecobank Nigeria", country: "NG" },
  { code: "070", name: "Fidelity Bank", country: "NG" },
  { code: "011", name: "First Bank", country: "NG" },
  { code: "214", name: "First City Monument (FCMB)", country: "NG" },
  { code: "058", name: "Guaranty Trust Bank", country: "NG" },
  { code: "030", name: "Heritage Bank", country: "NG" },
  { code: "301", name: "Jaiz Bank", country: "NG" },
  { code: "082", name: "Keystone Bank", country: "NG" },
  { code: "526", name: "Parallex Bank", country: "NG" },
  { code: "076", name: "Polaris Bank", country: "NG" },
  { code: "101", name: "Providus Bank", country: "NG" },
  { code: "221", name: "Stanbic IBTC", country: "NG" },
  { code: "068", name: "Standard Chartered NG", country: "NG" },
  { code: "232", name: "Sterling Bank", country: "NG" },
  { code: "100", name: "Suntrust Bank", country: "NG" },
  { code: "032", name: "Union Bank", country: "NG" },
  { code: "033", name: "United Bank for Africa", country: "NG" },
  { code: "215", name: "Unity Bank", country: "NG" },
  { code: "035", name: "Wema Bank", country: "NG" },
  { code: "057", name: "Zenith Bank", country: "NG" },
  { code: "GH280100", name: "GCB Bank", country: "GH" },
  { code: "GH280200", name: "Ecobank Ghana", country: "GH" },
  { code: "GH280300", name: "Absa Ghana", country: "GH" },
  { code: "GH280400", name: "Stanbic Ghana", country: "GH" },
  { code: "GH280500", name: "Fidelity Bank Ghana", country: "GH" },
  { code: "GH280600", name: "CalBank", country: "GH" },
  { code: "GH280700", name: "Access Bank Ghana", country: "GH" },
  { code: "MTN", name: "MTN MoMo", country: "GH" },
  { code: "VOD", name: "Vodafone Cash", country: "GH" },
  { code: "ATL", name: "AirtelTigo Money", country: "GH" },
  { code: "KE01", name: "Equity Bank", country: "KE" },
  { code: "KE02", name: "KCB", country: "KE" },
  { code: "KE03", name: "Co-operative Bank", country: "KE" },
  { code: "KE04", name: "Absa Kenya", country: "KE" },
  { code: "KE05", name: "Stanbic Kenya", country: "KE" },
  { code: "MPESA", name: "M-Pesa", country: "KE" },
  { code: "ZA01", name: "FNB", country: "ZA" },
  { code: "ZA02", name: "Standard Bank", country: "ZA" },
  { code: "ZA03", name: "Absa", country: "ZA" },
  { code: "ZA04", name: "Nedbank", country: "ZA" },
  { code: "ZA05", name: "Capitec", country: "ZA" },
  { code: "UG01", name: "Stanbic Uganda", country: "UG" },
  { code: "UG02", name: "Centenary Bank", country: "UG" },
  { code: "UG03", name: "MTN MoMo Uganda", country: "UG" },
  { code: "US_ACH", name: "US bank (ACH)", country: "US" },
  { code: "US_WISE", name: "Wise / Payoneer", country: "US" },
  { code: "CA_BANK", name: "Canadian bank", country: "CA" },
  { code: "GB_BANK", name: "UK bank", country: "GB" },
  { code: "EU_IBAN", name: "EU bank (IBAN)", country: "DE" },
  { code: "EU_IBAN", name: "EU bank (IBAN)", country: "FR" },
  { code: "EU_IBAN", name: "EU bank (IBAN)", country: "NL" },
  { code: "EU_IBAN", name: "EU bank (IBAN)", country: "ES" },
  { code: "EU_IBAN", name: "EU bank (IBAN)", country: "IT" },
  { code: "EU_IBAN", name: "EU bank (IBAN)", country: "SE" },
  { code: "AE_BANK", name: "UAE bank", country: "AE" },
  { code: "IN_BANK", name: "Indian bank", country: "IN" },
  { code: "SG_BANK", name: "Singapore bank", country: "SG" },
  { code: "JP_BANK", name: "Japanese bank", country: "JP" },
  { code: "KR_BANK", name: "Korean bank", country: "KR" },
  { code: "AU_BANK", name: "Australian bank", country: "AU" },
  { code: "BR_BANK", name: "Brazilian bank", country: "BR" },
  { code: "MX_BANK", name: "Mexican bank", country: "MX" },
  { code: "OTHER", name: "Other bank / wallet", country: "OTHER" },
];

export function banksForCountry(country: string): FlwBank[] {
  const c = country.toUpperCase();
  const list = FLW_BANKS.filter((b) => b.country === c);
  if (list.length) return list;
  return [{ code: "OTHER", name: "Other bank / wallet", country: c }];
}

export function countrySupportsAutoSplit(country: string): boolean {
  return AUTO_SPLIT_COUNTRIES.has(country.toUpperCase());
}

export function guessBankCode(bankName: string): string | null {
  const n = bankName.toLowerCase().trim();
  if (!n) return null;
  const hit = FLW_BANKS.find(
    (b) =>
      n.includes(b.name.toLowerCase().slice(0, 8)) ||
      b.name.toLowerCase().includes(n.slice(0, 6))
  );
  return hit?.code || null;
}
