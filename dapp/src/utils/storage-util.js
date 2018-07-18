import { ipfsApi } from '~/ipfsApi'
import { promisify } from './common-util'
import aes from '~/services/aes'

const ipfsMethodWithRetry = async (func, ...args) => {
  let result
  let retries = 0
  const maxRetries = 3

  while(result === undefined) {
    try {
      result = await func(...args)
    } catch (error) {
      if (++retries === maxRetries) {
        console.error(error)
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

export async function doUploadFile(file, encryptionKey, progressHandler) {
  progressHandler(33)
  const reader = new window.FileReader()
  await promisifyFileReader(reader, file)
  progressHandler(45)
  const buffer = Buffer.from(reader.result)
  const bufferEncrypted = Buffer.from(aes.encryptBytes(buffer, encryptionKey))
  progressHandler(67)
  const uploadResult = await promisify(cb => ipfsApi.add(bufferEncrypted, cb))
  progressHandler(89)
  const hash = uploadResult[0].hash
  await promisify(cb => ipfsApi.pin.add(hash, cb))
  progressHandler(100)
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
        var reader = new window.FileReader()
        reader.onloadend = () => {
          cb(error, reader.result)
        }
        reader.readAsDataURL(new Blob([result]))
      }
    })
  })
}

function promisifyFileReader(fileReader, file){
  return new Promise((resolve, reject) => {
    fileReader.onloadend = resolve  // CHANGE to whatever function you want which would eventually call resolve
    fileReader.readAsArrayBuffer(file)
  })
}
