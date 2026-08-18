// Email (SMTP) configuration template
// Replace placeholders with your SMTP provider or use a service like SendGrid/Mailgun.

module.exports = {
  email: {
    host: process.env.EMAIL_HOST || '<SMTP_HOST>',
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
    secure: process.env.EMAIL_SECURE === 'true', // false for TLS
    auth: {
      user: process.env.EMAIL_USER || '<SMTP_USER>',
      pass: process.env.EMAIL_PASS || '<SMTP_PASS>',
    },
    from: process.env.EMAIL_FROM || 'no-reply@example.com',
  },

  // Example: export a nodemailer transporter in real implementation.
};
