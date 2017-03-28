require('dotenv').config();
var fs = require('fs'),
    backup = require('mongodb-backup'),
    tar = require('tar-fs'),
    AWS = require('aws-sdk');

// Use ENVIRONMENT_MODE set to 'local' to use AWS IAM key for testing this project. Otherwise it's better to use a Role
if (process.env['ENVIRONMENT_MODE'] === 'local') {
  AWS.config.update({
    accessKeyId: process.env['AWS_KEY'],
    secretAccessKey: process.env['AWS_SECRET_KEY'],
    region: process.env['AWS_REGION']
  });
}

// required process parameters
var mongoIp = process.env['MONGODB_URL'];
var database = process.env['MONGODB_DB'];
var username = process.env['MONGODB_USER'];
var password = process.env['MONGODB_PASSWORD'];
var bucket = process.env['S3_BUCKET'];

// Construct a MongoDB URL
var mongoUrl = 'mongodb://' + username + ':' + password + '@' + mongoIp + '/' + database;

// Create a filename for the backup file
var timestamp = new Date().toISOString().replace(/\..+/g, '').replace(/:/g, '').replace(/T/g, '-');

var tempDir = "/tmp";
var filename = database + '-' + timestamp + '.tar';

// Remove a given directory
var deleteFolderRecursive = function (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

// Clean up the temporary directory used for holding backup data
var cleanUpTempDir = function () {
  fs.unlink(tempDir + '/' + filename, function (err) {
    if (err) {
      console.log(err, "error in removing the backup .tar file");
    } else {
      deleteFolderRecursive(tempDir + '/' + database);
    }
  });
};

// Upload the backup file to an AWS S3 bucket
var uploadToAwsS3 = function (s3bucket) {
  var bucket = new AWS.S3({params: {Bucket: s3bucket}});

  bucket.putObject({
    Key: 'db-backups/' + filename,
    Body: fs.createReadStream(tempDir + '/' + filename),
    ServerSideEncryption: 'AES256', // AES256 Server Side Encryption
  }, function (err, data) {
    // Clean up the temporary directory
    // cleanUpTempDir();

    if (err) {
      console.log(err, "error in uploading the backup file to S3 bucket");
    } else {
      console.log(null, "Uploaded a backup file [" + filename
        + "] to a S3 bucket [" + s3bucket + "]");
    }
  });
};

// Connect to the database in MongoDB and back up .bson files for all collections
backup({
  uri: mongoUrl,
  root: tempDir,
  tar: filename,
  callback: function (err) {
    if (err) {
      console.log(err, "error in backing up MongoDB database");
    } else {
      uploadToAwsS3(bucket);
    }
  }
});

