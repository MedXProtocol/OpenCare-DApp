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

  compress: function(sourceImgObj, qualityPercent, outputFormat, scalePercent, srcOrientation) {
    if (document === undefined) {
      throw new Error("Cannot use JIC compress without document/window")
    }

    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")

    let width = sourceImgObj.naturalWidth
    let height = sourceImgObj.naturalHeight
    let mimeType = "image/jpeg"

    if (typeof outputFormat !== "undefined" && outputFormat === "png") {
      mimeType = "image/png"
    }

    console.log(
      "original dimensions: " +
        width +
        "px width X " +
        height +
        "px height"
    )

    if (scalePercent) {
      // console.log("scaling dimensions by: " + scalePercent * 100 + "%")
      width = parseInt(scalePercent * sourceImgObj.naturalWidth, 10)
      height = parseInt(scalePercent * sourceImgObj.naturalHeight, 10)

      console.log(
        "scaled dimensions: " +
          width +
          "px width X " +
          height +
          "px height"
      )
    }


    console.log(
      "scaled dimensions: " +
        width +
        "px width X " +
        height +
        "px height"
    )

    canvas.width = width
    canvas.height = height

    context.drawImage(sourceImgObj, 0, 0, canvas.width, canvas.height)
    // const imageData = context.getImageData(0, 0, canvas.width, canvas.height)



    // swap canvas dimensions for certain orientations before transform
    if (srcOrientation > 4 && srcOrientation < 9) {
      canvas.width = height
      canvas.height = width
    }

    // transform context based on orientation
    switch (srcOrientation) {
      case 2: context.transform(-1, 0, 0, 1, canvas.width, 0)
        break
      case 3: context.transform(-1, 0, 0, -1, canvas.width, canvas.height)
        break
      case 4: context.transform(1, 0, 0, -1, 0, canvas.height)
        break
      case 5: context.transform(0, 1, 1, 0, 0, 0)
        break
      case 6: context.transform(0, 1, -1, 0, canvas.height, 0)
        break
      case 7: context.transform(0, -1, -1, 0, canvas.height, canvas.width)
        break
      case 8: context.transform(0, -1, 1, 0, 0, canvas.width)
        break
      default: break;
    }


    context.drawImage(sourceImgObj, 0, 0, canvas.width, canvas.height)




    return canvas
  }
}
