import Web3 from 'web3'
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.LAMBDA_CONFIG_PROVIDER_URL))

import 'idempotent-babel-polyfill'
import { signTransaction } from './selfSignedFunctions'

// requires leading '0x' ! The key metamask exports is wrong!
const CONTRACT_OWNER_ADDRESS = '0x09c0048e162455b981a6caa2815469dfea18759d'

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

    const signed = await signTransaction(
      CONTRACT_OWNER_ADDRESS,
      ethAddress
    )

    const transaction = web3.eth.sendSignedTransaction(signed.rawTransaction)

    await new Promise((resolve, reject) => {
      transaction.on('transactionHash', hash => {
        console.log('await new Promise: ' + hash)
        console.log('responseHeaders: '+ responseHeaders['Content-Type'])
        console.log('responseHeaders: '+ responseHeaders['Access-Control-Allow-Origin'])

        console.log('JSON.stringify({ txHash: hash }): ' + JSON.stringify({ txHash: hash }))
        callback(null, {
          statusCode: '200',
          body: JSON.stringify({ txHash: hash }),
          headers: responseHeaders
        })
        resolve()
      })
      transaction.on('error', error => {
        callback(error)
        reject(error.message)
      })
    })

    // await promise.then((hash) => {
    //   console.log('await promise.then(hash): ' + hash)
    //   console.log('responseHeaders: ')
    //   console.table(responseHeaders)
    //   console.log('JSON.stringify({ txHash: hash }): ' + JSON.stringify({ txHash: hash }))
    //   callback(null, {
    //     statusCode: '200',
    //     body: JSON.stringify({ txHash: hash }),
    //     headers: responseHeaders
    //   })
    // }).catch((error) => {
    //   console.log('that catch ...')
    //   callback(error)
    // })

  } catch (error) {
    console.log('this catch!')
    callback(error)
  }
}
