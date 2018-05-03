import IpfsApi from 'ipfs-api';
import {promisify} from './common-util';
import { encrypt, decrypt } from '@/services/sign-in'

const ipfsApi = IpfsApi('ipfs.infura.io', '5001', {protocol: 'https'});

export async function uploadJson(rawJson) {
    const buffer = Buffer.from(rawJson);
    const bufferEncrypted = Buffer.from(encrypt(buffer))
    const uploadResult = await promisify(cb => ipfsApi.add(bufferEncrypted, cb));
    return uploadResult[0].hash;
}

export async function uploadFile(file) {
    const reader = new window.FileReader()
    await promisifyFileReader(reader, file);
    const buffer = Buffer.from(reader.result);
    const bufferEncrypted = Buffer.from(encrypt(buffer))
    const uploadResult = await promisify(cb => ipfsApi.add(bufferEncrypted, cb));
    return uploadResult[0].hash;
}

export async function downloadJson(hash) {
    return await promisify(cb => ipfsApi.cat(hash, (error, result) => {
      result = decrypt(result)
      cb(error, result)
    }));
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

// export async function uploadJson(rawJson) {
//     const { web3 } = window;

//     return await promisify(cb => web3.bzz.upload(rawJson, cb));
// }

// export async function downloadJson(hash) {
//     const { web3 } = window;

//     return await promisify(cb => web3.bzz.download(hash, cb));
// }
