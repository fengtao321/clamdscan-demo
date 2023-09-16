const fs = require("fs");
const NodeClam = require("clamscan");

const ClamScan = new NodeClam().init({
  removeInfected: false, // If true, removes infected files
  quarantineInfected: false, // False: Don't quarantine, Path: Moves files to this place.
  scanLog: null, // Path to a writeable log file to write scan results into
  debugMode: false, // Whether or not to log info/debug/error msgs to the console
  fileList: null, // path to file containing list of files to scan (for scanFiles method)
  scanRecursively: true, // If true, deep scan folders recursively
  clamscan: {
    path: "/usr/local/bin/clamscan", // Path to clamscan binary on your server
    db: null, // Path to a custom virus definition database
    scanArchives: true, // If true, scan archives (ex. zip, rar, tar, dmg, iso, etc...)
    active: true, // If true, this module will consider using the clamscan binary
  },
  clamdscan: {
    socket: false, // Socket file for connecting via TCP
    host: false, // IP of host to connect to TCP interface
    port: false, // Port of host to use when connecting via TCP interface
    timeout: 60000, // Timeout for scanning files
    localFallback: true, // Use local preferred binary to scan if socket/tcp fails
    path: "/usr/local/bin/clamdscan", // Path to the clamdscan binary on your server
    configFile: null, // Specify config file if it's in an unusual place
    multiscan: true, // Scan using all available cores! Yay!
    reloadDb: false, // If true, will re-load the DB on every call (slow)
    active: true, // If true, this module will consider using the clamdscan binary
    bypassTest: false, // Check to see if socket is available when applicable
    tls: false, // Use plaintext TCP to connect to clamd
  },
  preference: "clamdscan", // If clamdscan is found and active, it will be used by default
});

// Get instance by resolving ClamScan promise object
ClamScan.then(async (clamscan) => {
  try {
    // You can re-use the `clamscan` object as many times as you want
    for (let i = 0; i < 10; i++) {
      console.time("load_file_" + i);
      const { isInfected, file, viruses } = await clamscan.isInfected(
        "./tmp/" + i + ".png"
      );
      if (isInfected) console.log(`${file} is infected with ${viruses}!`);
      console.timeEnd("load_file_" + i);
    }
  } catch (err) {
    // Handle any errors raised by the code in the try block
  }
}).catch((err) => {
  console.log(err);
  // Handle errors that may have occurred during initialization
});

// You'll need to specify your socket or TCP connection info

const ClamScanSocket = new NodeClam().init({
  removeInfected: false, // If true, removes infected files
  quarantineInfected: false, // False: Don't quarantine, Path: Moves files to this place.
  scanLog: null, // Path to a writeable log file to write scan results into
  debugMode: false, // Whether or not to log info/debug/error msgs to the console
  fileList: null, // path to file containing list of files to scan (for scanFiles method)
  scanRecursively: true, // If true, deep scan folders recursively
  clamdscan: {
    socket: "/tmp/clamd.sock",
    host: "127.0.0.1",
    port: 3310,
  },
});

// console.log("Socket stream scan start.....");
ClamScanSocket.then(async (clamscan) => {
  for (let i = 0; i < 10; i++) {
    streamScan("stream_scan_", i, clamscan);
  }
});

function streamScan(tag, index, clamscan) {
  console.time(tag + index);
  const readableStream = fs.createReadStream("./tmp/" + index + ".png");
  clamscan.scanStream(readableStream, (err, { isInfected }) => {
    if (err) return console.error(err);
    // You can re-use the `clamscan` object as many times as you want
    if (isInfected) return console.log("Stream is infected! Booo!");
    console.timeEnd(tag + index);
  });
}

ClamScanSocket.then(async (clamscan) => {
  console.time("virus");
  const readableStream = fs.createReadStream("./tmp/EICAR.txt");
  clamscan.scanStream(readableStream, (err, { isInfected }) => {
    if (err) return console.error(err);
    console.log("clamScan virus file");
    // You can re-use the `clamscan` object as many times as you want
    if (isInfected) return console.log("Stream is infected! Booo!");
    console.timeEnd("virus");
  });
});
