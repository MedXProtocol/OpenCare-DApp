import 'idempotent-babel-polyfill'
import { Hippo } from './lib/Hippo'
import { sendEther } from './lib/sendEther'

const hippo = new Hippo({
  privateKey: process.env.LAMBDA_CONFIG_PRIVKEY,
  providerUrl: process.env.LAMBDA_CONFIG_PROVIDER_URL,
  networkId: process.env.LAMBDA_CONFIG_NETWORK_ID
})

exports.handler = (event, context, callback) => {
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

    const transaction = sendEther(hippo, ethAddress, (error, transaction) => {
      transaction.on('transactionHash', hash => {
        callback(null, {
          statusCode: '200',
          body: JSON.stringify({ txHash: hash }),
          headers: responseHeaders
        })
      })
    })

  } catch (error) {
    console.log(error)
    callback(error)
  }
}
