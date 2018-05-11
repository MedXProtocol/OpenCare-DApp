import update from 'immutability-helper';

export default function (state, action) {
  if (typeof state === 'undefined') {
    state = {}
  }

  switch(action.type) {
    case 'CASE_FETCH_SUCCEEDED':
      state = update(state, {
        [action.address]: {
          $set: action.status
        }
      })
      break;
  }

  console.log(action)

  return state
}
