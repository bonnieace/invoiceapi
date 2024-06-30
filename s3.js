const AWS = require('aws-sdk');

 async function uploadToS3(fileBuffer, fileName) {
  try {
    const { NEXT_PUBLIC_S3_ACCESS_KEY_ID, NEXT_PUBLIC_S3_SECRET_ACCESS_KEY, NEXT_PUBLIC_S3_BUCKET_NAME } = process.env;

    if (!NEXT_PUBLIC_S3_ACCESS_KEY_ID || !NEXT_PUBLIC_S3_SECRET_ACCESS_KEY || !NEXT_PUBLIC_S3_BUCKET_NAME) {
      throw new Error('Missing S3 configuration environment variables.');
    }

    AWS.config.update({
      accessKeyId: NEXT_PUBLIC_S3_ACCESS_KEY_ID,
      secretAccessKey: NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
      region: 'eu-north-1',
    });

    const s3 = new AWS.S3();
    const fileKey = 'uploads/' + Date.now().toString() + '-' + fileName.replace(' ', '-');
    const params = {
      Bucket: NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: fileKey,
      Body: fileBuffer,
    };

    await s3.putObject(params).promise();

    console.log('Successfully uploaded to S3:', fileKey);
    return {
      fileKey,
      fileName,
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

 function getS3Url(fileKey) {
  const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.eu-north-1.amazonaws.com/${fileKey}`;
  return url;
}
module.exports={
  uploadToS3,
  getS3Url


}
