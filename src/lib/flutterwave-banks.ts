/** Common Flutterwave bank codes (NG + GH). Extend as needed. */
export const FLW_BANKS: { code: string; name: string; country: string }[] = [
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
  { code: "MTN", name: "MTN MoMo (GH)", country: "GH" },
  { code: "VOD", name: "Vodafone Cash (GH)", country: "GH" },
  { code: "ATL", name: "AirtelTigo Money (GH)", country: "GH" },
];

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
