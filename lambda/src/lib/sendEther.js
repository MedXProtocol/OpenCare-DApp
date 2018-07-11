export function sendEther(hippo, ethAddress, callback) {
  if (!hippo.web3().utils.isAddress(ethAddress)) {
    callback(new Error(`ethAddress is not a valid address: ${ethAddress}`))
  } else {
    hippo.lookupBetaFaucet()
      .then((betaFaucet) => {
        const encodedABI = betaFaucet.methods.sendEther(ethAddress).encodeABI()

        const tx = {
          from: hippo.ownerAddress(),
          to: betaFaucet.options.address,
          gas: 4612388,
          gasPrice: hippo.web3().utils.toWei('20', 'gwei'),
          data: encodedABI
        }

        hippo.sendTransaction(tx, callback)
      })
    .catch(error => callback(error))
  }
}
