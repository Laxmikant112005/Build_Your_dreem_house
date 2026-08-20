/**
 * Planova - Email / SMTP Configuration
 *
 * SMTP credentials must be provided through environment variables.
 */

const getRequiredEnv = (name) => {
  const value = process.env[name];

  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
};

const getPort = () => {
  const value = process.env.EMAIL_PORT || '587';
  const port = Number.parseInt(value, 10);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid EMAIL_PORT: "${value}". Expected a valid port number.`
    );
  }

  return port;
};

const port = getPort();

module.exports = {
  email: {
    host: getRequiredEnv('EMAIL_HOST'),
    port,

    // Port 465 normally uses implicit TLS.
    // Port 587 normally uses STARTTLS.
    secure:
      process.env.EMAIL_SECURE !== undefined
        ? process.env.EMAIL_SECURE === 'true'
        : port === 465,

    auth: {
      user: getRequiredEnv('EMAIL_USER'),
      pass: getRequiredEnv('EMAIL_PASS'),
    },

    from: getRequiredEnv('EMAIL_FROM'),
  },
};