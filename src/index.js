const { init, clear, downloadSingleImage } = require("./services/s3");
const { fileScan } = require("./services/filescan");
const { streamScan } = require("./services/socketscan");
const { writeFile } = require("fs/promises");

const numberToTest = 10;
const localFolderName = "test";
const start = async function () {
  //upload images, create local test folder
  await init(localFolderName, numberToTest);
  //Download from s3, write to disk, scan with clamdscan (current way), unlink file

  for (let i = 0; i < numberToTest; i++) {
    const key = i + ".png";
    const path = localFolderName + "/" + key;
    const metricKey = "file-scan-" + "download-file-" + key;
    console.time(metricKey);
    const { Body } = await downloadSingleImage(key);
    await writeFile(path, Body);
    console.timeEnd(metricKey);
    await fileScan(path);
  }

  //Download from s3, which gets you a stream (don’t write to disk) scan using socket
  promises = [];
  for (let i = 0; i < numberToTest; i++) {
    promises.push(processStreamScan(i));
  }

  Promise.all(promises)
    .then((results) => {
      console.log(results);
      clear(localFolderName, numberToTest); //remove test folder, clear s3 bucket
    })
    .catch((e) => console.log(e));
};

const processStreamScan = async function (i) {
  const key = i + ".png";
  const metricKey = "stream-scan-" + "download-file-" + key;
  console.time(metricKey);
  const { Body } = await downloadSingleImage(key);
  console.timeEnd(metricKey);
  return streamScan(Body, i);
};

start();
