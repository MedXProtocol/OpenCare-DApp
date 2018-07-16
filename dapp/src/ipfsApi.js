import IpfsApi from 'ipfs-api';

export const ipfsApi = IpfsApi(
  process.env.REACT_APP_IPFS_HOSTNAME || 'ipfs.medcredits.io',
  process.env.REACT_APP_IPFS_PORT || '5001',
  {protocol:
  process.env.REACT_APP_IPFS_PROTOCOL || 'https'})
