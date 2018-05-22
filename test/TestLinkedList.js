const TestLinkedList = artifacts.require('./test/TestLinkedList.sol')

contract('TestLinkedList', function (accounts) {
  let linkedList;

  beforeEach(async () => {
    linkedList = await TestLinkedList.new()
  })

  describe('enqueue()', () => {
    it('should enqueue a value', async () => {
      await linkedList.enqueue(14)
      assert.equal(await linkedList.length(), 1)
    })

    it('should enqueue multiple values', async () => {
      await linkedList.enqueue(1)
      await linkedList.enqueue(2)
      assert.equal(await linkedList.length(), 2)
      assert.equal(await linkedList.peek(), 1)

      await linkedList.dequeue()
      assert.equal(await linkedList.peek(), 2)
      assert.equal(await linkedList.length(), 1)

      await linkedList.dequeue()
      assert.equal(await linkedList.length(), 0)

      await linkedList.enqueue(17)
      assert.equal(await linkedList.length(), 1)
      assert.equal(await linkedList.peek(), 17)
    })
  })

  describe('dequeue()', () => {
    it('should do nothing if empty', async () => {
      await linkedList.dequeue()
      assert.equal(await linkedList.length(), 0)
    })

    it('should remove a value', async () => {
      await linkedList.enqueue(14)
      assert.equal(await linkedList.length(), 1)
      assert.equal(await linkedList.peek(), 14)
      await linkedList.dequeue()
      assert.equal(await linkedList.length(), 0)
    })
  })

  describe('remove()', () => {
    describe('with three nodes', () => {
      beforeEach(async () => {
        await linkedList.enqueue(1)
        await linkedList.enqueue(2)
        await linkedList.enqueue(3)
      })

      it('should remove a middle node correctly', async () => {
        assert.equal(await linkedList.prevId(2), 3)
        assert.equal(await linkedList.nextId(2), 1)
        assert.equal(await linkedList.length(), 3)

        await linkedList.remove(2)

        assert.equal(await linkedList.length(), 2)
        assert.equal(await linkedList.prevId(1), 3)
        assert.equal(await linkedList.nextId(3), 1)
      })

      it('should remove a head node correctly', async () => {
        await linkedList.remove(1)

        assert.equal(await linkedList.length(), 2)
        assert.equal(await linkedList.peekId(), 2)
        assert.equal(await linkedList.nextId(2), 0)
      })

      it('should remove a tail node correctly', async () => {
        await linkedList.remove(3)

        assert.equal(await linkedList.length(), 2)
        assert.equal(await linkedList.prevId(2), 0)
      })
    })

    it('should remove a single node correctly', async () => {
      await linkedList.enqueue(1)

      linkedList.remove(1)

      assert.equal(await linkedList.length(), 0)
      assert.equal(await linkedList.peekId(), 0)
      assert.equal(await linkedList.peek(), 0)
    })
  })
});
