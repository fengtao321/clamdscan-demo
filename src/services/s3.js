const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { writeFile } = require("fs/promises");

async function uploadMultipleImages(file, uploadFileNum) {
  for (let i = 0; i < uploadFileNum; i++) {
    await uploadSingleImage(i + ".png", file);
  }
}

function uploadSingleImage(filename, Body) {
  return s3Client.send(
    new PutObjectCommand({
      Bucket: config.uploadBucket,
      Key: filename,
      Body,
    })
  );
}

async function downloadSingleImage(key, path, info) {
  const start = Date.now();
  const command = new GetObjectCommand({
    Bucket: config.uploadBucket,
    Key: key,
  });
  const { Body } = await s3Client.send(command);

  await writeFile(path, Body);
  metricLog(start, {
    ...info,
    name: "Download Processing",
  });
}

async function removeFromUploadBucket(key, info) {
  const start = Date.now();
  await s3Client.send(
    new DeleteObjectCommand({ Bucket: config.uploadBucket, Key: key })
  );
  metricLog(start, {
    ...info,
    name: "Remove Processing",
  });
}

function clear(numberToTest) {
  for (let i = 0; i < numberToTest; i++) {
    try {
      fs.unlinkSync(folderName + "/" + i + ".png");
    } catch (err) {
      console.error(err);
    }
  }

  fs.rmdirSync(folderName);
}

module.exports = { uploadMultipleImages, clear };
