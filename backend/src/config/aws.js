// AWS configuration template
// Fill with your AWS credentials and S3 bucket settings.

module.exports = {
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '<YOUR_AWS_ACCESS_KEY_ID>',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '<YOUR_AWS_SECRET_ACCESS_KEY>',
    region: process.env.AWS_REGION || '<YOUR_AWS_REGION>',
    s3: {
      bucket: process.env.AWS_S3_BUCKET || '<YOUR_S3_BUCKET_NAME>',
    },
  },

  // Initialize and export AWS SDK clients in actual implementation.
};
