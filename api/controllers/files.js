const moment = require('moment');
const _ = require('lodash');
const aws = require('aws-sdk');
const mime = require('mime-types');

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  signatureVersion: 'v4',
  region: 'us-east-2'
});

exports.getMimeTypeFromExtension = async (req, res, next) => {
  try {
    const extension = req.params.extension;

    const mimeType = mime.lookup(extension);
    res.status(200).json({ mimeType });
  } catch(error) {
    next(error);
  }
}

exports.createS3SignedUrl = async (req, res, next) => {
  try {
    const nameTokens = req.query.name.split('.');
    const extension = nameTokens[nameTokens.length - 1];
    nameTokens.pop();
    const name = nameTokens.map(n => _.kebabCase(n)).join('.') + '.' + extension;
    const contentType = req.query.contentType;
    const bucketKey = moment().valueOf() + name;

    const options = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: bucketKey,
      ContentType: contentType,
      ACL: 'public-read'
    };
    const url = await s3.getSignedUrlPromise('putObject', options);
    const s3PublicUrl = url.split('?')[0];
    const publicUrl = process.env.UPLOAD_PREFIX + s3PublicUrl.substring(s3PublicUrl.lastIndexOf('/') + 1);
    res.status(200).json({url, publicUrl});
  } catch(error) {
    next(error);
  }
}