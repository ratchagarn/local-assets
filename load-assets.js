var mkdirp = require('mkdirp'),
    fs = require('fs'),
    _ = require('lodash'),
    purl = require('purl'),
    http = require('http'),
    baseAssetsPath = './public/',
    _PORT = process.env.PORT || 6969;

var resources = JSON.parse(fs.readFileSync('./resources.json')),
    totalResources = resources.length;
    count = 0;

if (totalResources > 0) {
  console.log('[LOG] =>', 'Start Download ' + totalResources + ' file(s)');
}
else {
  console.log('[LOG] =>', 'Download file not found.');
  console.log('[LOG] =>', 'please add url for downlaod resources in `resources.json`.');
}


/**
 * Create assets dir
 * ------------------------------------------------------------
 */

var downloadAssets = [];

_.forEach(resources, function(url) {

    var pathFragments = purl(url).pathname.replace('/', '').split('/'),
      filename = pathFragments.pop(),
      deepDirName = pathFragments.join('/'),
      destination = baseAssetsPath + deepDirName;

  // create destination directory
  mkdirp.sync(destination);

  var downloadDest = destination + '/' + filename;
  downloadAssets.push({
    filename: filename,
    url: url,
    dest: downloadDest
  });

  // download all file asynchronous
  // var downloadDest = destination + '/' + filename;
  // download(url, downloadDest, function(err) {
  //   if (!err) {
  //     console.log('Download file(s) successed (' + filename + ') ' + (++count) + '/' + totalResources);
  //     if (count === totalResources) {
  //       console.log('All download file ready for access.');
  //       console.log('Go to http://localhost:' + _PORT + ' for see all available url.');
  //     }
  //   }
  //   else {
  //     console.log('[ERROR] ==>', "Can't download file please check url (" + url + ") or internet connection.");
  //   }
  // });
});


_download(downloadAssets);


function _download(assetData) {
  var data = assetData.shift();
  if (data) {
    download(data.url, data.dest, function(err) {
      if (!err) {
        console.log('Download file(s) successed (' + data.filename + ') ' + (++count) + '/' + totalResources);
        if (count === totalResources) {
          console.log('All download file ready for access.');
          console.log('Go to http://localhost:' + _PORT + ' for see all available url.');
        }
      }
      else {
        console.log('[ERROR] ==>', "Can't download file please check url (" + url + ") or internet connection.");
      }
      _download(assetData);
    });
  }
}


/**
 * Helper for download file from url and write file to destination
 * ------------------------------------------------------------
 * http://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js-without-using-third-party-libraries
 */

function download(url, dest, cb) {
  var file = fs.createWriteStream(dest);

  http
    .get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(cb || function(){});
      });
    })
    .on('error', function(err) {
      // fs.unlink(dest);
      if (cb) {
        cb(err);
      }
    });
};