import IpfsApi from 'ipfs-api';
import {promisify} from './common-util';

const ipfsApi = IpfsApi('localhost', '5001')

export async function uploadToIpfs(rawJson) {
    const buffer = Buffer.from(rawJson);
    return await promisify(cb => ipfsApi.add(buffer, cb));
}

export async function downloadFromIpfs(hash) {
    return await promisify(cb => ipfsApi.get(hash, cb));
}