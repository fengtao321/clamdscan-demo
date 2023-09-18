require("dotenv").config({ path: `./.env.${process.env.NODE_ENV}` });

module.exports = {
  CLAMSCANPATH: process.env.CLAMSCANPATH,
  CLAMDSCANPATH: process.env.CLAMDSCANPATH,
  CLAMDSOCKET: process.env.CLAMDSOCKET,
  CLAMDHOST: process.env.CLAMDHOST,
  CLAMDPORT: process.env.CLAMDPORT,
  UPLOADBUCKET: process.env.UPLOADBUCKET,
};
