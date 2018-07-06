const http = require('http')

/**
 * Pass the data to send as `event.data`, and the request options as
 * `event.options`. For more information see the HTTPS module documentation
 * at https://nodejs.org/api/https.html.
 *
 * Will succeed with the response body.
 */

exports.handler = (event, context, callback) => {
  console.log('event: ' + JSON.stringify(event))
  console.log('context: ' + JSON.stringify(context))
  console.log('callback: ' + JSON.stringify(callback))
  let ethAddress

  if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) {
    if (event.queryStringParameters.ethAddress !== undefined &&
      event.queryStringParameters.ethAddress !== null &&
      event.queryStringParameters.ethAddress !== "") {
      console.log("Received ethAddress: " + event.queryStringParameters.ethAddress);
      ethAddress = event.queryStringParameters.ethAddress;
    }
  } else {
    ethAddress = event.ethAddress // test event in AWS console
  }
  const path = '/donate/' + ethAddress
  console.log("path: " + path)

  let responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.LAMBDA_CONFIG_CORS_ORIGINS
  }

  const req = http.get({
    hostname: 'faucet.ropsten.be',
    port: 3001,
    path: path,
    agent: false
  }, (res) => {
    const { statusCode, headers } = res;
    console.log('statusCode: ', statusCode);
    console.log('headers: ', headers);
    console.log('headers stringified: ', JSON.stringify(headers));

    if (statusCode !== 200) {
      let error = new Error('Request Failed.\nStatus Code: ' + statusCode);

      callback(null, {
        statusCode: statusCode,
        body: error.message,
        headers: responseHeaders
      })

      console.error(error.message);
      // consume response data to free up memory
      res.resume();
      return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      console.log('Successfully processed HTTP response');
      console.log('rawData: ' + rawData);

      try {
        // const parsedData = JSON.parse(rawData);
        // console.log('parsedData: ' + parsedData);
        callback(null, {
          statusCode: '200',
          body: rawData,
          headers: responseHeaders
        })
        // callback(null, parsedData);
        // const done = (err, res) => callback(null, {
        // });
      } catch (e) {
        console.error(e.message);
        callback(null, {
          statusCode: '500',
          body: e.message,
          headers: responseHeaders
        })
      }
    });
  }).on('error', (e) => {
    console.error('Got error: ' + e.message);
    callback(null, {
      statusCode: '500',
      body: e.message,
      headers: responseHeaders
    })
  });
};
