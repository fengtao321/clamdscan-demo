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

  const fileScanPromises = [];
  for (let i = 0; i < numberToTest; i++) {
    fileScanPromises.push(processFileScan(i));
  }

  await Promise.all(fileScanPromises);

  //Download from s3, which gets you a stream (don’t write to disk) scan using socket
  const streamScanPromises = [];
  for (let i = 0; i < numberToTest; i++) {
    streamScanPromises.push(processStreamScan(i));
  }

  console.log("====================");
  // Promise.all(streamScanPromises)
  //   .then((results) => {
  //     console.log(results);
  //     clear(localFolderName, numberToTest); //remove test folder, clear s3 bucket
  //   })
  //   .catch((e) => console.log(e));

  try {
    await Promise.all(streamScanPromises);
  } catch (e) {
    console.log(e);
  }

  console.log("start to clear");
  clear(localFolderName, numberToTest);
};

const processFileScan = async function (i) {
  const key = i + ".png";
  const path = localFolderName + "/" + key;
  const metricKey = "file-scan-" + "download-file-" + key;
  console.time(metricKey);
  const { Body } = await downloadSingleImage(key);
  await writeFile(path, Body);
  console.timeEnd(metricKey);
  return fileScan(path);
};

const processStreamScan = async function (i) {
  const key = i + ".png";
  const metricKey = "stream-scan-" + "download-file-" + key;
  console.time(metricKey);
  const { Body } = await downloadSingleImage(key);
  console.timeEnd(metricKey);
  return await streamScan(Body, i);
};

start();
