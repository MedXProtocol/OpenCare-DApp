const SkipList = artifacts.require('./SkipList.sol')
const SkipListInstrumentation = artifacts.require('./test/SkipListInstrumentation.sol')
const TestSkipList = artifacts.require('./test/TestSkipList.sol')

contract('TestSkipList', function (accounts) {
  let skiplist;

  let account1 = accounts[0]
  let account2 = accounts[1]
  let account3 = accounts[2]

  beforeEach(async () => {
    let skiplistLib = await SkipList.new()
    let skiplistInstrumentationLib = await SkipListInstrumentation.new()
    TestSkipList.link('SkipList', skiplistLib.address)
    TestSkipList.link('SkipListInstrumentation', skiplistInstrumentationLib.address)
    skiplist = await TestSkipList.new()
  })

  describe('enqueue()', () => {
    it('should work', async () => {
      let tailId = await skiplist.tailId()
      assert.equal(tailId, 0, 'No tail exists')
      assert.equal(await skiplist.segmentId(account1, tailId), 0, 'tail does not have a segment')

      await skiplist.enqueue(account1, 1)
      assert.equal(await skiplist.peek(account2), 1, 'Account 2 can see the value')
      assert.equal((await skiplist.peekSegmentId(account1)).toString(), 1, 'Account 1 has a skip node')
      assert.equal(await skiplist.peekLastBadNodeId(account1), 1, 'Account 1 current skip is the first node')
      assert.equal((await skiplist.peekSegmentId(account2)).toString(), 0, 'Account 2 does not have a skip node')

      await skiplist.enqueue(account1, 2)
      assert.equal(await skiplist.peekSegmentId(account1), 1, 'segment id has not changed')
      assert.equal(await skiplist.peekLastBadNodeId(account1), 2, 'last bad node has been updated')
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

    it('should work after queueing another', async () => {
      await skiplist.enqueue(account1, 1)
      await skiplist.enqueue(account1, 2)
      assert.equal(await skiplist.peek(account1), 0)
      assert.equal(await skiplist.peek(account2), 1)
      assert.equal(await skiplist.peekSegmentId(account2), 0)
      assert.equal(await skiplist.peekSegmentId(account1), 1)
      assert.equal((await skiplist.peekLastBadNodeId(account1)).toString(), 2, 'account1 skipping all')

      await skiplist.dequeue(account2)
      assert.equal(await skiplist.peek(account1), 0)
      assert.equal(await skiplist.peek(account2), 2)
      assert.equal(await skiplist.peek(account3), 2)

      await skiplist.enqueue(account2, 3)
      assert.equal(await skiplist.peek(account1), 3)
      assert.equal(await skiplist.peek(account2), 2)
      assert.equal(await skiplist.peek(account3), 2)

      await skiplist.dequeue(account3)
      assert.equal(await skiplist.peek(account1), 3)
      assert.equal(await skiplist.peek(account2), 0)
      assert.equal(await skiplist.peek(account3), 3)
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
