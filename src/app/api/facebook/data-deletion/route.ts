import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * Facebook Login data deletion callback.
 * Meta POSTs a signed_request; we acknowledge and return a status URL.
 */
function parseSignedRequest(signedRequest: string, secret: string) {
  const [encodedSig, payload] = signedRequest.split(".", 2);
  if (!encodedSig || !payload) return null;
  const sig = Buffer.from(
    encodedSig.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  );
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest();
  if (!crypto.timingSafeEqual(sig, expected)) return null;
  const json = Buffer.from(
    payload.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  ).toString("utf8");
  try {
    return JSON.parse(json) as { user_id?: string; algorithm?: string };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media"
  ).replace(/\/$/, "");
  const secret =
    process.env.FACEBOOK_APP_SECRET || process.env.META_APP_SECRET || "";

  let signedRequest = "";
  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = (await req.json()) as { signed_request?: string };
      signedRequest = body.signed_request || "";
    } else {
      const form = await req.formData();
      signedRequest = String(form.get("signed_request") || "");
    }
  } catch {
    /* soft */
  }

  let userId = "unknown";
  if (signedRequest && secret) {
    const data = parseSignedRequest(signedRequest, secret);
    if (data?.user_id) userId = String(data.user_id);
  }

  const confirmationCode = `omniv-fb-${userId.slice(0, 12)}-${Date.now().toString(36)}`;
  console.info("[facebook-data-deletion]", { userId, confirmationCode });

  return NextResponse.json({
    url: `${appUrl}/data-deletion?code=${encodeURIComponent(confirmationCode)}`,
    confirmation_code: confirmationCode,
  });
}

export async function GET() {
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media"
  ).replace(/\/$/, "");
  return NextResponse.json({
    endpoint: `${appUrl}/api/facebook/data-deletion`,
    instructions: `${appUrl}/data-deletion`,
    method: "POST signed_request from Meta",
  });
}
