export const generateEmailPasswordForgotTemplate = (
  resetUrl,
  userName = "",
) => {
  const greeting = userName ? `Hi ${userName},` : "Hi there,";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - BigBazar</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f4f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      color: #333333;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      padding: 30px 40px;
      text-align: center;
      color: #ffffff;
    }
    .logo {
      font-size: 36px;
      margin-bottom: 8px;
    }
    .content {
      padding: 40px 40px 30px;
    }
    h1 {
      color: #1f2937;
      font-size: 24px;
      margin: 0 0 16px 0;
      font-weight: 600;
    }
    p {
      font-size: 16px;
      color: #4b5563;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      background-color: #1e1e1e;
      color: #ffffff !important;
      padding: 16px 32px;
      font-size: 17px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 8px;
      margin: 25px 0;
      transition: background-color 0.3s ease;
    }
    .button:hover {
      background-color: #374151;
    }
    .expiry {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      margin: 25px 0;
      font-size: 15px;
      color: #92400e;
    }
    .link-fallback {
      word-break: break-all;
      font-size: 14px;
      color: #6b7280;
      margin: 20px 0;
      padding: 12px;
      background-color: #f9fafb;
      border-radius: 6px;
    }
    .footer {
      padding: 30px 40px;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #6b7280;
      text-align: center;
    }
    .footer a {
      color: #6366f1;
      text-decoration: none;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #111827;
      }
      .container {
        background-color: #1f2937;
      }
      .content {
        color: #e5e7eb;
      }
      h1 {
        color: #f3f4f6;
      }
      p {
        color: #9ca3af;
      }
      .expiry {
        background-color: #451a03;
        color: #fcd34d;
        border-color: #f59e0b;
      }
      .link-fallback {
        background-color: #374151;
        color: #d1d5db;
      }
      .footer {
        background-color: #111827;
        color: #9ca3af;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">🛍️</div>
      <h2 style="margin:0; font-size:22px; font-weight:700;">BigBazar</h2>
    </div>

    <!-- Content -->
    <div class="content">
      <h1>Reset Your Password</h1>
      
      <p>${greeting}</p>
      <p>We received a request to reset the password for your BigBazar account. Click the button below to set a new password.</p>
      
      <a href="${resetUrl}" class="button" target="_blank" style="display:inline-block;">
        Reset Password
      </a>
      
      <div class="expiry">
        <strong>⚠️ This link will expire in 15 minutes.</strong><br>
        For security reasons, please reset your password promptly.
      </div>

      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <div class="link-fallback">
        ${resetUrl}
      </div>

      <p>If you didn't request a password reset, please ignore this email. Your account remains safe.</p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Thank you,<br><strong>BigBazar Team</strong></p>
      <p>
        If you need help, contact us at 
        <a href="mailto:support@bigbazar.com">support@bigbazar.com</a>
      </p>
      <p style="margin-top:15px; font-size:12px;">
        © ${new Date().getFullYear()} BigBazar. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};
