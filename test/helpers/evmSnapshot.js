module.exports = function() {
  const id = Date.now()

  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_snapshot',
      id: id,
    }, (err1, snapshotRes) => {
      if (err1) return reject(err1)
      web3.currentProvider.sendAsync({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: id+1,
      }, (err2, res) => {
        console.log('Done mining: ', snapshotRes.result)
        return err2 ? reject(err2) : resolve(snapshotRes.result)
      })
    })
  })
}
