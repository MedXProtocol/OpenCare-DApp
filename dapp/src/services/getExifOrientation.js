import { promisify } from '~/utils/promisify'

// https://stackoverflow.com/questions/7584794/accessing-jpeg-exif-rotation-data-in-javascript-on-the-client-side
// -2: not jpeg
// -1: not defined

export const getExifOrientation = async function(file) {
  var reader = new FileReader()

  return await promisify(cb => {
    reader.onload = function(e) {
      let error
      const view = new DataView(e.target.result)

      if (view.getUint16(0, false) !== 0xffd8) {
        return cb(error, -2)
      }

      const length = view.byteLength
      let offset = 2

      while (offset < length) {
        if (view.getUint16(offset + 2, false) <= 8) {
          return cb(error, -1)
        }

        const marker = view.getUint16(offset, false)
        offset += 2

        if (marker === 0xffe1) {
          offset += 2

          if (view.getUint32(offset, false) !== 0x45786966) {
            return cb(error, -1)
          }

          const little = view.getUint16((offset += 6), false) === 0x4949
          offset += view.getUint32(offset + 4, little)

          const tags = view.getUint16(offset, little)
          offset += 2

          for (var i = 0; i < tags; i++) {
            if (view.getUint16(offset + i * 12, little) === 0x0112) {
              const result = view.getUint16(offset + i * 12 + 8, little)
              return cb(error, result)
            }
          }
        } else if ((marker & 0xff00) !== 0xff00) {
          break
        } else {
          offset += view.getUint16(offset, false)
        }
      }

      return cb(error, -1)
    }

    reader.readAsArrayBuffer(file)
  })
}
