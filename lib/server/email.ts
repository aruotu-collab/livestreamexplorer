const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://livestreamexplorer.com").replace(/\/$/, "");

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderTransactionalEmail(input: {
  intro: string;
  heading: string;
  paragraphs: string[];
  ctaLabel: string;
  ctaHref: string;
}) {
  const href = input.ctaHref.startsWith("http") ? input.ctaHref : `${siteUrl}${input.ctaHref}`;
  const paragraphs = input.paragraphs
    .map(
      (text) =>
        `<p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#222222;">${escapeHtml(text)}</p>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#ffffff;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;">
      <tr>
        <td align="left" style="padding:32px 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;">
            <tr>
              <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111111;">
                <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">Hi there,</p>
                <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:#222222;">${escapeHtml(input.intro)}</p>
                <h1 style="margin:0 0 20px;font-size:28px;line-height:1.25;font-weight:700;color:#111111;">${escapeHtml(input.heading)}</h1>
                ${paragraphs}
                <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:#222222;">Thanks,</p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 28px;">
                  <tr>
                    <td bgcolor="#e2b13c" style="border-radius:10px;">
                      <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:600;color:#07080b;text-decoration:none;border-radius:10px;">
                        ${escapeHtml(input.ctaLabel)}
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#555555;">If the button does not work, paste this link into your browser:</p>
                <p style="margin:0;font-size:14px;line-height:1.6;word-break:break-all;">
                  <a href="${escapeHtml(href)}" style="color:#2f6b4f;text-decoration:underline;">${escapeHtml(href)}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export { siteUrl };
