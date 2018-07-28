/*!
 * JIC JavaScript Library v2.0.2
 * https://github.com/brunobar79/J-I-C/
 *
 * Copyright 2016, Bruno Barbieri
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: Tue Jul 11 13:13:03 2016 -0400
 */

/*!
  * Modified by Chuck Bergeron to support downsizing dimensions of image
  * and to support ES6 imports
  *
  * Date: Fri Jul 27th, 16:22:23 2018 -0800
  */

/**
 * Create the jic object.
 * @constructor
 */

export const jicImageCompressor = {
  /**
   * Receives an Image Object (can be JPG OR PNG) and returns a new Image Object compressed
   *
   * @param {Image} sourceImgObj The source Image Object
   * @param {Float} qualityPercent The resulting output quality (1 is uncompressed, 0.5 is 50% compressed)
   * @param {String} output format: Possible values are jpg and png
   * @param {Float} scalePercent: The percentage to downscale or upscale the image to
   *
   * @return {base64 data} The compressed Image in base64
   */

  compress: function(sourceImgObj, qualityPercent, outputFormat, scalePercent) {
    if (document === undefined) {
      throw new Error("Cannot use JIC compress without document/window")
    }

    const canvas = document.createElement("canvas")
    let canvasWidth = sourceImgObj.naturalWidth
    let canvasHeight = sourceImgObj.naturalHeight
    let mimeType = "image/jpeg"

    if (typeof outputFormat !== "undefined" && outputFormat === "png") {
      mimeType = "image/png"
    }

    // console.log(
    //   "original dimensions: " +
    //     canvasWidth +
    //     "px width X " +
    //     canvasHeight +
    //     "px height"
    // )

    if (scalePercent) {
      // console.log("scaling dimensions by: " + scalePercent * 100 + "%")
      canvasWidth = parseInt(scalePercent * sourceImgObj.naturalWidth, 10)
      canvasHeight = parseInt(scalePercent * sourceImgObj.naturalHeight, 10)

      // console.log(
      //   "scaled dimensions: " +
      //     canvasWidth +
      //     "px width X " +
      //     canvasHeight +
      //     "px height"
      // )
    }

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    canvas.getContext("2d").drawImage(sourceImgObj, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL(mimeType, qualityPercent)
  },

  // /**
  //  * Receives an Image Object and upload it to the server via ajax
  //  * @param {Image} compressed_img_obj The Compressed Image Object
  //  * @param {String} The server side url to send the POST request
  //  * @param {String} file_input_name The name of the input that the server will receive with the file
  //  * @param {String} filename The name of the file that will be sent to the server
  //  * @param {function} successCallback The callback to trigger when the upload is succesful.
  //  * @param {function} (OPTIONAL) errorCallback The callback to trigger when the upload failed.
  //  * @param {function} (OPTIONAL) duringCallback The callback called to be notified about the image's upload progress.
  //  * @param {Object} (OPTIONAL) customHeaders An object representing key-value  properties to inject to the request header.
  //  */

  // upload: function(
  //   compressed_img_obj,
  //   upload_url,
  //   file_input_name,
  //   filename,
  //   successCallback,
  //   errorCallback,
  //   duringCallback,
  //   customHeaders
  // ) {
  //   //ADD sendAsBinary compatibilty to older browsers
  //   if (XMLHttpRequest.prototype.sendAsBinary === undefined) {
  //     XMLHttpRequest.prototype.sendAsBinary = function(string) {
  //       var bytes = Array.prototype.map.call(string, function(c) {
  //         return c.charCodeAt(0) & 0xff
  //       })
  //       this.send(new Uint8Array(bytes).buffer)
  //     }
  //   }

  //   var type = "image/jpeg"
  //   if (filename.substr(-4).toLowerCase() === ".png") {
  //     type = "image/png"
  //   }

  //   var data = compressed_img_obj.src
  //   data = data.replace("data:" + type + ";base64,", "")

  //   var xhr = new XMLHttpRequest()
  //   xhr.open("POST", upload_url, true)
  //   var boundary = "someboundary"

  //   xhr.setRequestHeader(
  //     "Content-Type",
  //     "multipart/form-data; boundary=" + boundary
  //   )

  //   // Set custom request headers if customHeaders parameter is provided
  //   if (customHeaders && typeof customHeaders === "object") {
  //     for (var headerKey in customHeaders) {
  //       xhr.setRequestHeader(headerKey, customHeaders[headerKey])
  //     }
  //   }

  //   // If a duringCallback function is set as a parameter, call that to notify about the upload progress
  //   if (duringCallback && duringCallback instanceof Function) {
  //     xhr.upload.onprogress = function(evt) {
  //       if (evt.lengthComputable) {
  //         duringCallback((evt.loaded / evt.total) * 100)
  //       }
  //     }
  //   }

  //   xhr.sendAsBinary(
  //     [
  //       "--" + boundary,
  //       'Content-Disposition: form-data; name="' +
  //         file_input_name +
  //         '"; filename="' +
  //         filename +
  //         '"',
  //       "Content-Type: " + type,
  //       "",
  //       atob(data),
  //       "--" + boundary + "--"
  //     ].join("\r\n")
  //   )

  //   xhr.onreadystatechange = function() {
  //     if (this.readyState === 4) {
  //       if (this.status === 200) {
  //         successCallback(this.responseText)
  //       } else if (this.status >= 400) {
  //         if (errorCallback && errorCallback instanceof Function) {
  //           errorCallback(this.responseText)
  //         }
  //       }
  //     }
  //   }
  // }
}
