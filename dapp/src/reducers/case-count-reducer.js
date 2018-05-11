import update from 'immutability-helper';

export default function (state, action) {
  if (typeof state === 'undefined') {
    state = {
      loading: false,
      count: 0,
      error: null
    }
  }

  switch(action.type) {
    case 'OPEN_CASE_COUNT_FETCH_STARTED':
      state = update(state, {
        loading: { $set: true },
        message: { $set: null }
      })
      break
    case 'OPEN_CASE_COUNT_FETCH_SUCCEEDED':
      state = update(state, {
        loading: { $set: false },
        count: { $set: action.count }
      })
      break;
    case 'OPEN_CASE_COUNT_FETCH_FAILED':
      state = update(state, {
        loading: { $set: false },
        message: { $set: action.message }
      })
  }

  return state
}
