import 'idempotent-babel-polyfill'
import Eth from 'ethjs'
import { Hippo } from './lib/Hippo'

const hippo = new Hippo({
  privateKey: process.env.LAMBDA_CONFIG_PRIVKEY,
  providerUrl: process.env.LAMBDA_CONFIG_PROVIDER_URL,
  networkId: process.env.LAMBDA_CONFIG_NETWORK_ID
})

exports.handler = function (event, context, callback) {
  const responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.LAMBDA_CONFIG_CORS_ORIGIN
  }

  try {
    let ethAddress, name, publicKey

    if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) {
      if (event.queryStringParameters.ethAddress !== undefined &&
        event.queryStringParameters.ethAddress !== null &&
        event.queryStringParameters.ethAddress !== "") {
        ethAddress = event.queryStringParameters.ethAddress;
      }
      if (event.queryStringParameters.name !== undefined &&
        event.queryStringParameters.name !== null &&
        event.queryStringParameters.name !== "") {
        name = event.queryStringParameters.name;
      }
      if (event.queryStringParameters.publicKey !== undefined &&
        event.queryStringParameters.publicKey !== null &&
        event.queryStringParameters.publicKey !== "") {
        publicKey = event.queryStringParameters.publicKey;
      }
    }

    console.info('Upgrading ' + ethAddress + 'to be a doctor named ' + name)

    if (!Eth.isAddress(ethAddress)) {
      callback(`ethAddress is not a valid address: ${ethAddress}`)
    } else if (!name) {
      callback(`name is not valid, please enter a name`)
    } else if (!publicKey) {
      callback(`you must pass a publicKey`)
    } else {
      console.info('hippo.addOrReactivateDoctor ' + ethAddress + ' to be a doctor named ' + name + ' with public key ' + publicKey)
      hippo.addOrReactivateDoctor(ethAddress, name, publicKey)
        .then((transactionHash) => {
          console.info("YEZZZZ!")
          console.info('Successfully sent transaction with hash: ', transactionHash)
          callback(null, {
            statusCode: 200,
            body: JSON.stringify({ txHash: transactionHash }),
            headers: responseHeaders
          })
        })
        .catch(error => {
          console.info('WHOA YEA')
          console.error('big ol error: ', error.message)
          console.error('ERROR: ', error)
          callback(error)
        })
    }
  } catch (error) {
    console.info('?? ERRRRRRR')
    console.error('massive ol error: ', error.message)
    console.error('MASSIVE ERROR: ', error)
    callback(error)
  }
}
