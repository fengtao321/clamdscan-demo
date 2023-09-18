const NodeClam = require("clamscan");

const ScanClient = new NodeClam().init({
  removeInfected: false, // If true, removes infected files
  quarantineInfected: false, // False: Don't quarantine, Path: Moves files to this place.
  scanLog: null, // Path to a writeable log file to write scan results into
  debugMode: false, // Whether or not to log info/debug/error msgs to the console
  fileList: null, // path to file containing list of files to scan (for scanFiles method)
  scanRecursively: true, // If true, deep scan folders recursively
  clamscan: {
    path: process.env.CLAMSCAN_BIN, // Path to clamscan binary on your server
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
    path: process.env.CLAMDSCAN_BIN, // Path to the clamdscan binary on your server
    configFile: null, // Specify config file if it's in an unusual place
    multiscan: true, // Scan using all available cores! Yay!
    reloadDb: false, // If true, will re-load the DB on every call (slow)
    active: true, // If true, this module will consider using the clamdscan binary
    bypassTest: false, // Check to see if socket is available when applicable
    tls: false, // Use plaintext TCP to connect to clamd
  },
  preference: "clamdscan", // If clamdscan is found and active, it will be used by default
});

function fileScan(path) {
  const metricKey = "file-scan-" + path;
  console.time(metricKey);

  return ScanClient.then(async (clamscan) => {
    const { isInfected, file, viruses } = await clamscan.isInfected(path);
    if (isInfected) console.log(`${file} is infected with ${viruses}!`);
    console.timeEnd(metricKey);
  });
}

module.exports = { fileScan };
