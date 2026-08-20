const requiredEnv = (name) => {
  const value = process.env[name];

  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
};

module.exports = {
  aws: {
    accessKeyId: requiredEnv('AWS_ACCESS_KEY_ID'),
    secretAccessKey: requiredEnv('AWS_SECRET_ACCESS_KEY'),
    region: requiredEnv('AWS_REGION'),

    s3: {
      bucket: requiredEnv('AWS_S3_BUCKET'),
    },
  },
};