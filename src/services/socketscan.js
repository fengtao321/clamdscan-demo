const NodeClam = require("clamscan");

function client() {
  return new NodeClam().init({
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
}
function streamScan(index, clamscan) {
  console.time(index);
  const readableStream = fs.createReadStream("./tmp/" + index + ".png");
  clamscan.scanStream(readableStream, (err, { isInfected }) => {
    if (err) return console.error(err);

    console.log(isInfected);

    // You can re-use the `clamscan` object as many times as you want
    if (isInfected) return console.log("Stream is infected! Booo!");
    console.timeEnd(index);
  });
}
