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
  * Modified by Chuck Bergeron to support downsizing/upsizing dimensions of image,
  * and correct rotate / scale / transform based on EXIF Orientation data,
  * also to support ES6 imports
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
   * @param {Float} scalePercent: The percentage to downscale or upscale the image to
   * @param {Number} srcOrientation: The orientation from the EXIF data as an integer
   *
   * @return {canvas} The canvas element with the resultant image, ready to be converted to
   *                  an array buffer, a blog, etc
   */

  compress: function(sourceImgObj, qualityPercent, scalePercent, srcOrientation) {
    if (document === undefined) {
      throw new Error("Cannot use JIC compress without document/window")
    }

    let width = sourceImgObj.naturalWidth
    let height = sourceImgObj.naturalHeight
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")

    // console.log(`original dimensions: ${width} px width X ${height} px height`)
    if (scalePercent) {
      // console.log(`scaling dimensions by: ${scalePercent * 100}%`)
      width = parseInt(scalePercent * sourceImgObj.naturalWidth, 10)
      height = parseInt(scalePercent * sourceImgObj.naturalHeight, 10)
    }
    // console.log(`original dimensions: ${width} px width X ${height} px height`)



    // console.log(`orientation from EXIF data: ${srcOrientation})

    // swap canvas dimensions for certain orientations before transform
    if (srcOrientation > 4 && srcOrientation < 9) {
      canvas.width = height
      canvas.height = width
    } else {
      canvas.width = width
      canvas.height = height
    }

    // transform context based on orientation
    switch (srcOrientation) {
      case 2: context.transform(-1, 0, 0, 1, width, 0)
        break
      case 3: context.transform(-1, 0, 0, -1, width, height)
        break
      case 4: context.transform(1, 0, 0, -1, 0, height)
        break
      case 5: context.transform(0, 1, 1, 0, 0, 0)
        break
      case 6: context.transform(0, 1, -1, 0, height, 0)
        break
      case 7: context.transform(0, -1, -1, 0, height, width)
        break
      case 8: context.transform(0, -1, 1, 0, 0, width)
        break
      default: break;
    }

    context.drawImage(sourceImgObj, 0, 0, width, height)

    return canvas
  }
}
