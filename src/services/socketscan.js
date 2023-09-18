const NodeClam = require("clamscan");
const config = require("../config");
ScanClient = new NodeClam().init({
  removeInfected: false, // If true, removes infected files
  quarantineInfected: false, // False: Don't quarantine, Path: Moves files to this place.
  scanLog: null, // Path to a writeable log file to write scan results into
  debugMode: false, // Whether or not to log info/debug/error msgs to the console
  fileList: null, // path to file containing list of files to scan (for scanFiles method)
  scanRecursively: true, // If true, deep scan folders recursively
  clamdscan: {
    socket: config.CLAMDSOCKET,
    host: config.CLAMDPORT,
    port: 3310,
  },
});

function streamScan(readableStream, index) {
  const metricKey = "stream-scan-" + index;
  ScanClient.then(async (clamscan) => {
    console.time(metricKey);
    clamscan.scanStream(readableStream, (err, { isInfected }) => {
      if (err) return console.error(err);
      // You can re-use the `clamscan` object as many times as you want
      if (isInfected) return console.log("Stream is infected! Booo!");
      console.timeEnd(metricKey);
    });
  });
}

module.exports = { streamScan };
