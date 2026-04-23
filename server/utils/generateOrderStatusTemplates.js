const baseTemplate = (title, subtitle, content, color, orderId, buttonText) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: ${color}; color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; letter-spacing: 1px; }
        .content { padding: 30px; color: #333; line-height: 1.6; }
        .order-id { background-color: #f9f9f9; padding: 10px; border-radius: 4px; font-family: monospace; display: inline-block; border: 1px solid #eee; margin: 10px 0; }
        .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #777; }
        .button { display: inline-block; padding: 12px 25px; background-color: ${color.split(',')[0].replace('linear-gradient(135deg, ', '')}; color: white !important; text-decoration: none; border-radius: 50px; font-weight: bold; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
          <p>${subtitle}</p>
        </div>
        <div class="content">
          ${content}
          <p>Order ID:</p>
          <div class="order-id">${orderId}</div>
          <br>
          <a href="${process.env.FRONTEND_URL}/orders" class="button">${buttonText}</a>
          <p>Thank you for choosing BigBazar!</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 BigBazar Inc. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
`;

export const generateOrderShippedTemplate = (userName, orderId) => {
  return baseTemplate(
    "Good News!",
    "Your package is on its way.",
    `<p>Hi <strong>${userName}</strong>,</p><p>We've just shipped your order. Our courier is now on the move to bring your items to you.</p>`,
    "linear-gradient(135deg, #6e8efb, #a777e3)",
    orderId,
    "Track My Order"
  );
};

export const generateOrderDeliveredTemplate = (userName, orderId) => {
  return baseTemplate(
    "Delivered!",
    "Your order has arrived.",
    `<p>Hi <strong>${userName}</strong>,</p><p>Boom! Your package has been delivered. We hope you love your new items.</p>`,
    "linear-gradient(135deg, #43e97b, #38f9d7)",
    orderId,
    "Rate Your Items"
  );
};

export const generateOrderCancelledTemplate = (userName, orderId) => {
  return baseTemplate(
    "Order Cancelled",
    "An update regarding your order.",
    `<p>Hi <strong>${userName}</strong>,</p><p>We're sorry to inform you that your order has been cancelled. If you didn't request this, please contact our support team immediately.</p>`,
    "linear-gradient(135deg, #ff9a9e, #fecfef)",
    orderId,
    "Visit Shop"
  );
};
