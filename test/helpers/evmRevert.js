module.exports = function(snapshotId) {
  const id = Date.now()

  console.log('evmRevert: ', snapshotId)

  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_revert',
      params: [snapshotId],
      id: id,
    }, err1 => {
      if (err1) return reject(err1)

      web3.currentProvider.sendAsync({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: id+1,
      }, (err2, res) => {
        console.log('evmRevert resolve: ', err2, res, snapshotId)
        return err2 ? reject(err2) : resolve(res)
      })
    })
  })
}
