const APP = process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media";

export function emailLayout(opts: {
  preheader?: string;
  bodyHtml: string;
  footerNote?: string;
}): string {
  const pre = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader}</div>`
    : "";
  const foot =
    opts.footerNote ||
    `Omniv · <a href="${APP}" style="color:#888;">omniv.media</a>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  ${pre}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#111;border-radius:16px;border:1px solid #222;">
        <tr><td style="padding:28px 28px 8px;color:#c9a227;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">Omniv</td></tr>
        <tr><td style="padding:8px 28px 28px;color:#e8e8e8;font-size:15px;line-height:1.65;">
          ${opts.bodyHtml}
        </td></tr>
      </table>
      <p style="margin:16px 0 0;color:#555;font-size:11px;">${foot}</p>
    </td></tr>
  </table>
</body>
</html>`;
}

export function ctaButton(href: string, label: string): string {
  return `<p style="margin:24px 0 8px;"><a href="${href}" style="display:inline-block;background:#c9a227;color:#000;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:999px;">${label}</a></p>`;
}

export function greeting(name?: string): string {
  const who = name?.trim() || "there";
  return `<p style="margin:0 0 16px;color:#fff;">Hello ${who},</p>`;
}
