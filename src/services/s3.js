const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("fs");
const { NodeHttpHandler } = require("@aws-sdk/node-http-handler");
const https = require("https");
const config = require("../config");

const s3Client = new S3Client({
  // Use a custom request handler so that we can adjust the HTTPS Agent and
  // socket behavior.
  requestHandler: new NodeHttpHandler({
    httpsAgent: new https.Agent({
      maxCachedSessions: 0,
      maxSockets: 20,

      // keepAlive is a default from AWS SDK. We want to preserve this for
      // performance reasons.
      keepAlive: true,
      keepAliveMsecs: 1000,
    }),
    socketTimeout: 5000,
  }),
});

const UPLOAD_BUCKET_NAME = config.UPLOADBUCKET;

async function init(localFolderName, uploadFileNum) {
  if (!fs.existsSync(localFolderName)) {
    fs.mkdirSync(localFolderName);
  }
  await uploadImages(uploadFileNum);
}

async function uploadImages(uploadFileNum) {
  const file = fs.readFileSync("tmp/0.png");
  for (let i = 0; i < uploadFileNum; i++) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: UPLOAD_BUCKET_NAME,
        Key: i + ".png",
        Body: file,
      })
    );
  }
}

function clear(localFolderName, uploadFileNum) {
  for (let i = 0; i < uploadFileNum; i++) {
    try {
      fs.unlinkSync(localFolderName + "/" + i + ".png");
    } catch (err) {
      console.error(err);
    }
  }

  fs.rmdirSync(localFolderName);

  for (let i = 0; i < uploadFileNum; i++) {
    s3Client.send(
      new DeleteObjectCommand({ Bucket: UPLOAD_BUCKET_NAME, Key: i + ".png" })
    );
  }
}

async function downloadSingleImage(key) {
  const command = new GetObjectCommand({
    Bucket: UPLOAD_BUCKET_NAME,
    Key: key,
  });

  return await s3Client.send(command);
}

module.exports = { init, clear, downloadSingleImage };
