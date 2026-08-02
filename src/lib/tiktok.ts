/** TikTok Login Kit helpers — credentials only from env. */

export function tiktokConfigured() {
  return Boolean(
    process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET
  );
}

export function tiktokClientKey() {
  return process.env.TIKTOK_CLIENT_KEY || "";
}

export function tiktokClientSecret() {
  return process.env.TIKTOK_CLIENT_SECRET || "";
}

export function tiktokRedirectUri() {
  return (
    process.env.TIKTOK_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media"}/api/auth/tiktok/callback`
  );
}

/** Scopes: start with basic profile; expand after TikTok approval. */
export const TIKTOK_SCOPES = ["user.info.basic"].join(",");

export function buildTikTokAuthorizeUrl(state: string) {
  const params = new URLSearchParams({
    client_key: tiktokClientKey(),
    scope: TIKTOK_SCOPES,
    response_type: "code",
    redirect_uri: tiktokRedirectUri(),
    state,
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}

export type TikTokTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  open_id?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

export async function exchangeTikTokCode(code: string): Promise<TikTokTokenResponse> {
  const body = new URLSearchParams({
    client_key: tiktokClientKey(),
    client_secret: tiktokClientSecret(),
    code,
    grant_type: "authorization_code",
    redirect_uri: tiktokRedirectUri(),
  });

  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body: body.toString(),
  });

  const json = (await res.json()) as {
    data?: TikTokTokenResponse;
    error?: string;
    error_description?: string;
  };

  if (json.data?.access_token) return json.data;
  return {
    error: json.error || "token_error",
    error_description: json.error_description || JSON.stringify(json),
  };
}

export async function fetchTikTokUserInfo(accessToken: string) {
  const res = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return res.json();
}
