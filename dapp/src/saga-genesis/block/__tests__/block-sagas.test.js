import * as blockSagas from '../block-sagas'
import {
  call,
  fork,
  put
} from 'redux-saga/effects'

const WEB3_1_0_BLOCK = {
  "number":"0x78",
  "hash":"0xaf8af186fde03c16bf0a632d54661d0c4c55181824f7b9e1f775040d37c9f281",
  "parentHash":"0x5cc2ccd626dd89bbe7c410b6f3b78d8b3d760f9d9e77d77117334be698f93851",
  "mixHash":"0x1010101010101010101010101010101010101010101010101010101010101010",
  "nonce":"0x0000000000000000",
  "sha3Uncles":"0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
  "logsBloom":"0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "transactionsRoot":"0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
  "stateRoot":"0x39229e61fcd92681f5b90512349dbfdae03f46be53c66c1dbaa3abb5af6ce55c",
  "receiptsRoot":"0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
  "miner":"0x0000000000000000000000000000000000000000",
  "difficulty":"0x0",
  "totalDifficulty":"0x0",
  "extraData":"0x00",
  "size":"0x03e8",
  "gasLimit":"0x6691b7",
  "gasUsed":"0x7bf0",
  "timestamp":"0x5b2bd1a9",
  "transactions":[
    {
      "hash":"0xc42cbf81a8dc9c4a5473f3fa8759d18e17cdbcb338ffa57a65cbff1e615a01b5",
      "nonce":"0x5f",
      "blockHash":"0xaf8af186fde03c16bf0a632d54661d0c4c55181824f7b9e1f775040d37c9f281",
      "blockNumber":"0x78",
      "transactionIndex":"0x00",
      "from":"0x09c0048e162455b981a6caa2815469dfea18759d",
      "to":"0x8fa5944b15c1ab5db6bcfb0c888bdc6b242f0fa6",
      "value":"0x0",
      "gas":"0x6691b7",
      "gasPrice":"0x174876e800",
      "input":"0xa91d58b4000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    }
  ],
  "uncles":[]
}

describe('blockSagas', () => {
  describe('latestBlock()', () => {
    it('should correctly invalidate all of the addresses discovered', () => {
      const block = WEB3_1_0_BLOCK
      const address = '0x8fa5944b15c1ab5db6bcfb0c888bdc6b242f0fa6'
      var generator = blockSagas.latestBlock({ block })
      expect(generator.next().value).toEqual(call(blockSagas.collectAllTransactionAddresses, block.transactions))
      let gens = generator.next([address]).value
      expect(gens.next().value).toEqual(fork(put, { type: 'CACHE_INVALIDATE_ADDRESS', address }))
    })
  })

  describe('collectAllTransactionAddresses()', () => {
    it('should call collectTransactionAddresses for each', () => {
      const transactions = [1]
      var generator = blockSagas.collectAllTransactionAddresses(transactions)
      let gens = generator.next().value
      expect(gens.next().value).toEqual(call(blockSagas.collectTransactionAddresses, new Set(), 1))
      expect(gens.next().done).toBeTruthy()
      let lastCall = generator.next()
      expect(lastCall.done).toBeTruthy()
      expect(lastCall.value).toEqual(new Set())
    })
  })
})