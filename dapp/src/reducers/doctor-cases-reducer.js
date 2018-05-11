import update from 'immutability-helper';

export default function (state, action) {
  if (typeof state === 'undefined') {
    state = {}
  }

  switch(action.type) {
    case 'CaseAuthorizationRequested':
      state = update(state, {
        [action.doctor]: {
          $set: {
            cases: {
              [action.address]: {
                address: action.address,
                requested: true
              }
            }
          }
        }
      })
      break;
  }

  return state
}
