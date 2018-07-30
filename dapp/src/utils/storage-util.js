import { ipfsApi } from '~/ipfsApi'
import { promisify } from '~/utils/common-util'
import { sleep } from '~/utils/sleep'
import aes from '~/services/aes'

function updateUploadProgress(progressHandler, uploadProgress) {
  if (uploadProgress < 88) {
    uploadProgress += 2
    progressHandler(uploadProgress)
  }

  return uploadProgress
}

const ipfsMethodWithRetry = async (func, ...args) => {
  let result
  let retries = 0
  const maxRetries = 3

  while(result === undefined) {
    try {
      result = await func(...args)
    } catch (error) {
      if (++retries === maxRetries) {
        console.warn(error)
        return null
      }
    }
  }

  return result
}

export async function uploadJson(rawJson, encryptionKey) {
  return await ipfsMethodWithRetry(doUploadJson, rawJson, encryptionKey)
}

export async function doUploadJson(rawJson, encryptionKey) {
  const buffer = Buffer.from(rawJson)
  const bufferEncrypted = Buffer.from(aes.encryptBytes(buffer, encryptionKey))
  const uploadResult = await promisify(cb => ipfsApi.add(bufferEncrypted, cb))
  const hash = uploadResult[0].hash
  await promisify(cb => ipfsApi.pin.add(hash, cb))
  return hash
}

export async function uploadFile(file, encryptionKey, progressHandler) {
  return await ipfsMethodWithRetry(doUploadFile, file, encryptionKey, progressHandler)
}

export async function doUploadFile(fileAsArrayBuffer, encryptionKey, progressHandler) {
  let uploadProgress = 40 // reset each time

  // ENCRYPTING
  progressHandler(uploadProgress)
  const buffer = Buffer.from(fileAsArrayBuffer)
  const bufferEncrypted = Buffer.from(aes.encryptBytes(buffer, encryptionKey))
  await sleep(300)

  // UPLOADING
  progressHandler(51)
  const interval = setInterval(function() {
    uploadProgress = updateUploadProgress(progressHandler, uploadProgress)
  }, 500)

  const uploadResult = await promisify(cb => ipfsApi.add(bufferEncrypted, cb))
  clearInterval(interval)

  // PINNING TO IPFS
  progressHandler(90)
  const hash = uploadResult[0].hash
  await promisify(cb => ipfsApi.pin.add(hash, cb))
  await sleep(300)

  // DONE!
  progressHandler(100)
  await sleep(600)

  return hash
}

export async function downloadJson(hash, encryptionKey) {
  return await ipfsMethodWithRetry(doDownloadJson, hash, encryptionKey)
}

export async function doDownloadJson(hash, encryptionKey) {
  return await promisify(cb => {
    ipfsApi.cat(hash, (error, result) => {
      if (error) {
        cb(error, result)
      } else {
        result = aes.decryptBytes(result || '', encryptionKey)
        const buffer = Buffer.from(result)
        cb(error, buffer.toString('utf8'))
      }
    })
  })
}

export async function downloadImage(hash, encryptionKey) {
  return await ipfsMethodWithRetry(doDownloadImage, hash, encryptionKey)
}

export async function doDownloadImage(hash, encryptionKey) {
  return await promisify(cb => {
    ipfsApi.cat(hash, (error, result) => {
      if (error) {
        cb(error, result)
      } else {
        result = aes.decryptBytes(result, encryptionKey)
        const reader = new window.FileReader()
        reader.onloadend = () => {
          let result = reader.result

          // we only save jpeg's on upload & if mime type is missing add it back in
          result = reader.result.replace("data:;base64,", "data:image/jpeg;base64,")

          cb(error, result)
        }
        reader.readAsDataURL(new Blob([result]))
      }
    })
  })
}
