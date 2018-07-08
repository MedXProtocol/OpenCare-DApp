// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').config({ path: '../.envrc' })
// }

import Web3 from 'web3';
const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/emO8rPnBiGuzIJx5vMzk'));

import 'idempotent-babel-polyfill';
import * as selfSignedFunctions from './selfSignedFunctions'

// requires leading '0x' ! The key metamask exports is wrong!
const CONTRACT_OWNER_ADDRESS = '0x09c0048e162455b981a6caa2815469dfea18759d';

/**
 * Pass the data to send as `event.data`, and the request options as
 * `event.options`.
 *
 */

exports.handler = (event, context, callback) => {
  let ethAddress

  if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) {
    if (event.queryStringParameters.ethAddress !== undefined &&
      event.queryStringParameters.ethAddress !== null &&
      event.queryStringParameters.ethAddress !== "") {
      console.log("Received ethAddress: " + event.queryStringParameters.ethAddress);
      ethAddress = event.queryStringParameters.ethAddress;
    }
  }

  let responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.LAMBDA_CONFIG_CORS_ORIGIN
  }

  try {
    const functionName = 'sendEther'
    const functionInputs = [{
      type: 'address',
      name: '_to'
    }]

    console.log("CONTRACT_OWNER_ADDRESS: " + CONTRACT_OWNER_ADDRESS)
    console.log("ethAddress: " + ethAddress)

    // sign transaction
    selfSignedFunctions.sendSignedContractTransaction(
      CONTRACT_OWNER_ADDRESS,
      functionName,
      functionInputs,
      ethAddress
    )

    callback(null, {
      statusCode: '200',
      body: '',
      headers: responseHeaders
    })
  } catch (e) {
    console.error(e.message);
    callback(null, {
      statusCode: '500',
      body: e.message,
      headers: responseHeaders
    })
  }
}
