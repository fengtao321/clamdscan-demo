const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("fs");

const s3Client = new S3Client({});
const UPLOAD_BUCKET_NAME = "clamav-test-download";

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
  const file = await s3Client.send(command);
  return file;
}

module.exports = { init, clear, downloadSingleImage };
