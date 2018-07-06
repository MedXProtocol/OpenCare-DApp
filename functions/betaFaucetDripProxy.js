(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var http = __webpack_require__(1);

/**
 * Pass the data to send as `event.data`, and the request options as
 * `event.options`. For more information see the HTTPS module documentation
 * at https://nodejs.org/api/https.html.
 *
 * Will succeed with the response body.
 */

exports.handler = function (event, context, callback) {
  console.log('event: ' + JSON.stringify(event));
  console.log('context: ' + JSON.stringify(context));
  console.log('callback: ' + JSON.stringify(callback));
  var ethAddress = void 0;

  if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) {
    if (event.queryStringParameters.ethAddress !== undefined && event.queryStringParameters.ethAddress !== null && event.queryStringParameters.ethAddress !== "") {
      console.log("Received ethAddress: " + event.queryStringParameters.ethAddress);
      ethAddress = event.queryStringParameters.ethAddress;
    }
  } else {
    ethAddress = event.ethAddress; // test event in AWS console
  }
  var path = '/donate/' + ethAddress;
  console.log("path: " + path);

  var responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  var req = http.get({
    hostname: 'faucet.ropsten.be',
    port: 3001,
    path: path,
    agent: false
  }, function (res) {
    var statusCode = res.statusCode,
        headers = res.headers;

    console.log('statusCode: ', statusCode);
    console.log('headers: ', headers);
    console.log('headers stringified: ', JSON.stringify(headers));

    var error = void 0;
    if (statusCode !== 200) {
      error = new Error('Request Failed.\nStatus Code: ' + statusCode);
    }
    if (error) {
      console.error(error.message);
      // consume response data to free up memory
      res.resume();
      return;
    }

    res.setEncoding('utf8');
    var rawData = '';
    res.on('data', function (chunk) {
      rawData += chunk;
    });
    res.on('end', function () {
      console.log('Successfully processed HTTP response');
      console.log('rawData: ' + rawData);

      try {
        // const parsedData = JSON.parse(rawData);
        // console.log('parsedData: ' + parsedData);
        callback(null, {
          statusCode: '200',
          body: rawData,
          headers: responseHeaders
        });
        // callback(null, parsedData);
        // const done = (err, res) => callback(null, {
        // });
      } catch (e) {
        console.error(e.message);
        callback(null, {
          statusCode: '500',
          body: e.message,
          headers: responseHeaders
        });
      }
    });
  }).on('error', function (e) {
    console.error('Got error: ' + e.message);
    callback(null, {
      statusCode: '500',
      body: e.message,
      headers: responseHeaders
    });
  });
};

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ })
/******/ ])));