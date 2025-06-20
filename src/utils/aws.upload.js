require('dotenv').config();
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.BUCKET_NAME;

/**
 * Upload one file buffer (or stream) to a gym's photos or videos folder.
 */
async function uploadGymMedia(gymId, body, originalName, type, acl = 'private') {
  if (!['photos','videos'].includes(type)) {
    throw new Error(`type must be 'photos' or 'videos'`);
  }

  let fileBody = body;
  if (typeof body === 'string') {
    fileBody = fs.createReadStream(body);
    originalName = path.basename(body);
  }

  const ext = path.extname(originalName);
  const key = `gym_${gymId}/${type}/${Date.now()}_${path.basename(originalName)}`;
  const contentType = type === 'photos'
    ? `image/${ext.replace('.','')}`
    : `video/${ext.replace('.','')}`;

  const params = {
    Bucket: BUCKET,
    Key: key,
    Body: fileBody,
    ACL: acl,
    ContentType: contentType,
  };

  const { Location } = await s3.upload(params).promise();
  return { key, url: Location };
}

/**
 * List all media keys (and URLs) for a given gym and type.
 */
async function listGymMedia(gymId, type) {
  const prefix = `gym_${gymId}/${type}/`;
  const resp = await s3.listObjectsV2({ Bucket: BUCKET, Prefix: prefix }).promise();

  return resp.Contents.map(obj => {
    // if the key is a video, force inline disposition
    const isVideo = obj.Key.match(/\.(mp4|mov|webm)$/i);
    return {
      key: obj.Key,
      url: getGymMediaUrl(obj.Key, isVideo
        ? {
            responseContentDisposition: 'inline',
            // you could also infer type dynamically if needed:
            responseContentType: 'video/mp4'
          }
        : {}
      ),
      size: obj.Size,
      lastModified: obj.LastModified,
    };
  });
}

/**
 * Delete one object from S3 by its key.
 */
async function deleteGymMedia(key) {
  await s3.deleteObject({ Bucket: BUCKET, Key: key }).promise();
  return { deleted: key };
}

/**
 * Generate a presigned GET URL (valid 1h) for a given key.
 * @param {string} key 
 * @param {object} opts  Optional overrides:
 *   - responseContentDisposition: e.g. 'inline'  
 *   - responseContentType:         e.g. 'video/mp4'
 */
function getGymMediaUrl(key, opts = {}) {
  const params = {
    Bucket: BUCKET,
    Key: key,
    Expires: 60 * 60, // 1 hour
    // allow override of these two:
    ...(opts.responseContentDisposition && { ResponseContentDisposition: opts.responseContentDisposition }),
    ...(opts.responseContentType &&        { ResponseContentType: opts.responseContentType }),
  };

  return s3.getSignedUrl('getObject', params);
}

module.exports = {
  uploadGymMedia,
  listGymMedia,
  deleteGymMedia,
  getGymMediaUrl,
};
