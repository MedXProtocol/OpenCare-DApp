import { fetchCaseStatus } from '../get-doctor-cases'
import {
  getDoctorAuthorizationRequestCount,
  getDoctorAuthorizationRequestCaseAtIndex
} from '@/utils/web3-util'

test('It works', () => {
  let cases = fetchCaseStatus()
  expect(cases.next().value).toEqual(expect.objectContaining({
    CALL: {
      fn: getDoctorAuthorizationRequestCount,
      args: [],
      context: null
    }
  }))

  expect(cases.next(1).value).toEqual(expect.objectContaining({
    PUT: {
      action: {
        type: "DOCTOR_CASES_FETCH_STARTED",
        count: 1
      },
      channel: null
    }
  }))

  expect(cases.next().value).toEqual(expect.objectContaining({
    CALL: {
      fn: getDoctorAuthorizationRequestCaseAtIndex,
      args: [0],
      context: null
    }
  }))

  expect(cases.next('address').value).toEqual(expect.objectContaining({
    PUT: {
      action: {
        type: "DOCTOR_CASES_FETCH_SINGLE_SUCCEEDED",
        address: 'address',
        index: 0
      },
      channel: null
    }
  }))

  expect(cases.next().value).toEqual(expect.objectContaining({
    PUT: {
      action: {
        type: "DOCTOR_CASES_FETCH_SUCCEEDED"
      },
      channel: null
    }
  }))

  expect(cases.next()).toEqual({done: true})
})
