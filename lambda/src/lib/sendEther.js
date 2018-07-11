export function sendEther(hippo, ethAddress, callback) {
  if (!hippo.web3().utils.isAddress(ethAddress)) {
    callback(new Error(`ethAddress is not a valid address: ${ethAddress}`))
  } else {
    hippo.lookupBetaFaucet().then((betaFaucet) => {
      const encodedABI = betaFaucet.methods.sendEther(ethAddress).encodeABI()

      const tx = {
        from: 0, //first account
        to: betaFaucet.options.address,
        gas: 4612388,
        gasPrice: hippo.web3().utils.toWei('20', 'gwei'),
        data: encodedABI
      }

      const transaction = hippo.sendTransaction(tx)

      callback(null, transaction)
    }).catch(error => callback(error))
  }
}
