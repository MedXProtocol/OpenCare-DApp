import Web3 from 'web3'
const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/emO8rPnBiGuzIJx5vMzk'))

import 'idempotent-babel-polyfill'
import { signTransaction } from './selfSignedFunctions'

// requires leading '0x' ! The key metamask exports is wrong!
const CONTRACT_OWNER_ADDRESS = '0x09c0048e162455b981a6caa2815469dfea18759d'

async function processTransaction(ethAddress) {
  const functionName = 'sendEther'
  const functionInputs = [{
    type: 'address',
    name: '_to'
  }]

  return await signTransaction(
    CONTRACT_OWNER_ADDRESS,
    functionName,
    functionInputs,
    ethAddress
  )
}

exports.handler = async (event, context, callback) => {
  const responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.LAMBDA_CONFIG_CORS_ORIGIN
  }

  try {
    let ethAddress

    if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) {
      if (event.queryStringParameters.ethAddress !== undefined &&
        event.queryStringParameters.ethAddress !== null &&
        event.queryStringParameters.ethAddress !== "") {
        ethAddress = event.queryStringParameters.ethAddress;
      }
    }

    const signed = await processTransaction(ethAddress)

    const transaction = web3.eth.sendSignedTransaction(signed.rawTransaction)

    const promise = new Promise((resolve, reject) => {
      transaction.on('transactionHash', hash => {
        console.log('hash')
        console.log(hash)
        resolve(hash)
      })
      transaction.on('error', error => {
        console.error(error.message)
        reject(error.message)
      })
    })


    await promise.then((hash) => {
      callback(null, {
        statusCode: '200',
        body: JSON.stringify({ txHash: hash }),
        headers: responseHeaders
      })
    }).catch((error) => {
      callback(null, {
        statusCode: '500',
        body: error.message,
        headers: responseHeaders
      })
    })

  } catch (error) {
    callback(null, {
      statusCode: '500',
      body: error.message,
      headers: responseHeaders
    })
  }
}
