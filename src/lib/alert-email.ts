/** Branded alert email template for all TrackHive alert notifications */
export function getAlertEmailHtml(
  alertType: string,
  message: string,
  details: string
): string {
  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  })
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- LOGO -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#2563eb;border-radius:14px;padding:12px 20px;">
                    <span style="color:white;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                      Track<span style="color:#93c5fd;">Hive</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CARD -->
          <tr>
            <td style="background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <!-- TOP BAR - color changes based on alert severity -->
                <tr>
                  <td style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:32px;text-align:center;">
                    <div style="font-size:40px;margin-bottom:12px;">🚨</div>
                    <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">Alert Triggered</h1>
                    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">
                      TrackHive detected something that needs your attention
                    </p>
                  </td>
                </tr>
                <!-- BODY -->
                <tr>
                  <td style="padding:40px;">

                    <!-- ALERT TYPE BADGE -->
                    <div style="margin-bottom:24px;">
                      <span style="background:#fef2f2;color:#dc2626;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;border:1px solid #fecaca;">
                        ${alertType}
                      </span>
                    </div>

                    <!-- ALERT MESSAGE -->
                    <div style="background:#f8fafc;border-left:4px solid #dc2626;border-radius:8px;padding:20px;margin-bottom:24px;">
                      <p style="color:#0f172a;font-size:16px;font-weight:600;margin:0 0 8px;">${message}</p>
                      <p style="color:#64748b;font-size:14px;margin:0;line-height:1.6;">${details}</p>
                    </div>

                    <!-- TIMESTAMP -->
                    <p style="color:#94a3b8;font-size:13px;margin:0 0 32px;">
                      🕐 Triggered at: ${timestamp}
                    </p>

                    <!-- CTA BUTTON -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="https://track.itshassanahmed.com/dashboard"
                             style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:white;padding:16px 48px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(37,99,235,0.4);">
                            View Dashboard →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;">

                    <!-- MANAGE ALERTS LINK -->
                    <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
                      Manage your alerts at
                      <a href="https://track.itshassanahmed.com/dashboard/alerts" style="color:#2563eb;">
                        Dashboard → Alerts
                      </a>
                    </p>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:24px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">
                © 2025 TrackHive by
                <a href="https://itshassanahmed.com" style="color:#2563eb;text-decoration:none;">itshassanahmed.com</a>
                · You're receiving this because you set up an alert.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`
}
