const SkipList = artifacts.require('./SkipList.sol')
const TestSkipList = artifacts.require('./test/TestSkipList.sol')

contract('TestSkipList', function (accounts) {
  let skiplist;

  let account1 = accounts[0]
  let account2 = accounts[1]

  beforeEach(async () => {
    let skiplistLib = await SkipList.new()
    TestSkipList.link('SkipList', skiplistLib.address)
    skiplist = await TestSkipList.new()
  })

  describe('enqueue()', () => {
    it('should work', async () => {
      await skiplist.enqueue(account1, 1)
      await skiplist.enqueue(account2, 2)
      assert.equal(await skiplist.length(), 2)
    })

    it('should work with multiple skips', async () => {
      await skiplist.enqueue(account1, 1)
      assert.equal((await skiplist.peek(account1)).toNumber(), 0, 'zero1')
      await skiplist.enqueue(account1, 2)
      assert.equal((await skiplist.peek(account1)).toNumber(), 0, 'zero2')
      await skiplist.enqueue(account2, 3)
      assert.equal((await skiplist.peek(account1)).toNumber(), 3, 'good one 1')
      await skiplist.enqueue(account1, 4)
      assert.equal((await skiplist.peek(account1)).toNumber(), 3, 'good one 2')
      await skiplist.enqueue(account2, 5)
      assert.equal((await skiplist.peek(account1)).toNumber(), 3, 'good one 3')
    })
  })

  describe('dequeue()', () => {
    it('should work', async () => {
      await skiplist.enqueue(account1, 1)
      await skiplist.enqueue(account2, 2)
      assert.equal(await skiplist.length(), 2)

      await skiplist.dequeue(account1)
      assert.equal(await skiplist.length(), 1)
    })

    it('should respect the address', async () => {
      await skiplist.enqueue(account1, 1)
      await skiplist.enqueue(account2, 2)

      await skiplist.dequeue(account1)
      assert.equal(await skiplist.length(), 1)

      assert.equal(await skiplist.peek(account1), 0)
      assert.equal(await skiplist.peek(account2), 1)
      assert.equal(await skiplist.peek(0), 1)
    })
  })

  describe('peek()', () => {
    it('should return the value for the next node', async () => {
      await skiplist.enqueue(account1, 1)
      await skiplist.enqueue(account2, 2)

      assert.equal(await skiplist.peek(account1), 2)
      assert.equal(await skiplist.peek(account2), 1)
    })
  })
});
