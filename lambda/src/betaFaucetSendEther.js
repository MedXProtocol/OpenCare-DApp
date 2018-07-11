import 'idempotent-babel-polyfill'
import { Hippo } from './lib/Hippo'
import { sendEther } from './lib/sendEther'

const hippo = new Hippo({
  privateKey: process.env.LAMBDA_CONFIG_PRIVKEY,
  providerUrl: process.env.LAMBDA_CONFIG_PROVIDER_URL,
  networkId: process.env.LAMBDA_CONFIG_NETWORK_ID
})

exports.handler = function (event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

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

    console.log('Sending Ether to ', ethAddress)
    sendEther(hippo, ethAddress, (error, transactionHash) => {
      if (error) {
        console.error('Web3Error: ', error)
        callback(error)
      } else {
        console.log('Successfully sent transaction with hash: ', transactionHash)
        callback(null, {
          statusCode: '200',
          body: JSON.stringify({ txHash: transactionHash }),
          headers: responseHeaders
        })
      }
    })

  } catch (error) {
    console.error('MASSIVE ERROR: ', error)
    callback(error)
  }
}
