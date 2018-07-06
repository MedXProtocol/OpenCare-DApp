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
    'Access-Control-Allow-Origin': process.env.LAMBDA_CONFIG_CORS_ORIGINS
  }

  try {
    // sign transaction

    // send ether

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
