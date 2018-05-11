import update from 'immutability-helper';

export default function (state, action) {
  if (typeof state === 'undefined') {
    state = {
      cases: {}
    }
  }

  switch(action.type) {
    case 'CASE_DATE_FETCH_SUCCEEDED':
      state = update(state, {
        cases: {
          [action.address]: {
            $set: action.date
          }
        }
      })
      break;
  }

  return state
}
