import IpfsApi from 'ipfs-api';
import {promisify} from './common-util';
import aes from '~/services/aes'

const ipfsApi = IpfsApi(
  process.env.REACT_APP_IPFS_HOSTNAME || 'ipfs.medcredits.io',
  process.env.REACT_APP_IPFS_PORT || '5001',
  {protocol:
  process.env.REACT_APP_IPFS_PROTOCOL || 'https'})

export async function uploadJson(rawJson, encryptionKey) {
    const buffer = Buffer.from(rawJson);
    const bufferEncrypted = Buffer.from(aes.encryptBytes(buffer, encryptionKey))
    const uploadResult = await promisify(cb => ipfsApi.add(bufferEncrypted, cb));
    const hash = uploadResult[0].hash;
    await promisify(cb => ipfsApi.pin.add(hash, cb))
    return hash
}

export async function uploadFile(file, encryptionKey, progressHandler) {
    progressHandler(33)
    const reader = new window.FileReader()
    await promisifyFileReader(reader, file);
    progressHandler(50)
    const buffer = Buffer.from(reader.result);
    const bufferEncrypted = Buffer.from(aes.encryptBytes(buffer, encryptionKey))
    progressHandler(67)
    const uploadResult = await promisify(cb => ipfsApi.add(bufferEncrypted, cb));
    progressHandler(100)
    const hash = uploadResult[0].hash
    await promisify(cb => ipfsApi.pin.add(hash, cb))
    return hash
}

export async function downloadJson(hash, encryptionKey) {
    return await promisify(cb => {
      ipfsApi.cat(hash, (error, result) => {
        result = aes.decryptBytes(result, encryptionKey)
        const buffer = Buffer.from(result)
        cb(error, buffer.toString('utf8'))
      })
    });
}

export async function downloadImage(hash, encryptionKey) {
  return await promisify(cb => {
    ipfsApi.cat(hash, (error, result) => {
      if (error) {
        cb(error, null)
      } else {
        result = aes.decryptBytes(result, encryptionKey)
        var reader = new window.FileReader()
        reader.onloadend = () => {
          cb(error, reader.result)
        };
        reader.readAsDataURL(new Blob([result]));
      }
    })
  });
}

export function getFileUrl(hash) {
    return 'https://ipfs.infura.io/ipfs/' + hash;
}

function promisifyFileReader(fileReader, file){
    return new Promise((resolve, reject) => {
        fileReader.onloadend = resolve;  // CHANGE to whatever function you want which would eventually call resolve
        fileReader.readAsArrayBuffer(file);
    });
}
