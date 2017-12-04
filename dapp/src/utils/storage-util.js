import IpfsApi from 'ipfs-api';
import {promisify} from './common-util';

const ipfsApi = IpfsApi('ipfs.infura.io', '5001', {protocol: 'https'});

export async function uploadJson(rawJson) {
    const buffer = Buffer.from(rawJson);
    const uploadResult = await promisify(cb => ipfsApi.add(buffer, cb));
    return uploadResult[0].hash;
}

export async function uploadFile(file) {
    const reader = new window.FileReader()
    await promisifyFileReader(reader, file);
    const buffer = Buffer.from(reader.result);
    const uploadResult = await promisify(cb => ipfsApi.add(buffer, cb));
    return uploadResult[0].hash;
}

export async function downloadJson(hash) {
    return await promisify(cb => ipfsApi.cat(hash, cb));
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