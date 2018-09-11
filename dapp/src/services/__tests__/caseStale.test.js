import { caseStale } from '~/services/caseStale'
import { caseStatus } from '~/utils/caseStatus'
import { latestBlock } from '../__mocks__/latestBlock'

describe('caseStale', () => {

  let compareTime, status, context, secondsInADay, latestBlockTimestamp, currentTime

  beforeEach(() => {
    compareTime = (Date.now() / 1000)
    status = undefined
    context = undefined
    secondsInADay = 30
    currentTime = Math.floor(Date.now() / 1000)
  })

  describe('as doctor', () => {
    beforeEach(() => {
      context = 'doctor'
    })

    it('is accurate when enough time has passed as a Doctor waiting on a patient', () => {
      compareTime = compareTime - 1500
      status = caseStatus('Evaluated')
      context = 'doctor'

      expect(caseStale(compareTime, status, context, secondsInADay, currentTime)).toEqual(true)

      status = caseStatus('Challenging')
      expect(caseStale(compareTime, status, context, secondsInADay, currentTime)).toEqual(true)

      status = caseStatus('Evaluating')
      expect(caseStale(compareTime, status, context, secondsInADay, currentTime)).toEqual(false)
    })

    it('is false when not enough time has passed as a Doctor waiting on a Patient', () => {
      compareTime = compareTime - 45
      status = caseStatus('Evaluated')
      context = 'doctor'
      expect(caseStale(compareTime, status, context, secondsInADay, currentTime)).toEqual(false)
    })

    it('is false when in Challenging state and not enough time has passed as a Doctor waiting on a Patient', () => {
      compareTime = compareTime - 95
      status = caseStatus('Challenging')
      context = 'doctor'
      expect(caseStale(compareTime, status, context, secondsInADay, currentTime)).toEqual(false)
    })

    describe('using latestBlock timestamp as currentTime', () => {
      beforeEach(() => {
        status = caseStatus('Evaluated')
        context = 'doctor'

        latestBlockTimestamp = latestBlock.timestamp
      })

      it('is false when not enough time passed', () => {
        compareTime = latestBlockTimestamp - (secondsInADay * 1)
        expect(caseStale(compareTime, status, context, secondsInADay, latestBlockTimestamp)).toEqual(false)
      })

      it('is true when enough time has passed', () => {
        compareTime = latestBlockTimestamp - (secondsInADay * 5)
        expect(caseStale(compareTime, status, context, secondsInADay, latestBlockTimestamp)).toEqual(true)
      })

    })

  })

  describe('as patient', () => {
    it('is accurate when enough time has passed as a Patient waiting on a Doctor', () => {
      compareTime = compareTime - 1500
      status = caseStatus('Evaluating')
      context = 'patient'
      expect(caseStale(compareTime, status, context, secondsInADay, currentTime)).toEqual(true)

      status = caseStatus('Challenging')
      expect(caseStale(compareTime, status, context, secondsInADay, currentTime)).toEqual(true)

      status = caseStatus('Evaluated')
      expect(caseStale(compareTime, status, context, secondsInADay, currentTime)).toEqual(false)
    })
  })

  it('returns false when compareTime or status is undefined', () => {
    compareTime = undefined
    status = 1
    expect(caseStale(compareTime, status, context, secondsInADay, currentTime)).toEqual(false)

    compareTime = compareTime - 1500
    status = undefined
    expect(caseStale(compareTime, status, context, secondsInADay, currentTime)).toEqual(false)
  })

  it('returns false when not a status we care about', () => {
    compareTime = compareTime - 1500
    context = 'doctor'
    status = caseStatus('Open')
    expect(caseStale(compareTime, status, context, secondsInADay, currentTime)).toEqual(false)

    status = caseStatus('Closed')
    expect(caseStale(compareTime, status, context, secondsInADay, currentTime)).toEqual(false)

    status = caseStatus('ClosedConfirmed')
    expect(caseStale(compareTime, status, context, secondsInADay, currentTime)).toEqual(false)
  })

})
