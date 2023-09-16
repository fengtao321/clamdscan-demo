const fs = require("fs");
const { uploadMultipleImages } = require("./services/s3");

const numberToTest = 1;
const file = fs.readFileSync("tmp/0.png");
const folder = "test";

await uploadMultipleImages(file, numberToTest);
