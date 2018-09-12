export default function (state, { type, key, props }) {
  if (typeof state === 'undefined') {
    state = {}
  }

  if (type.startsWith('END_SAGA_')) {
    state = {...state}
    delete state[key]
  } else if (type === 'SAGA_RAN') {
    state = {...state}
    state[key] = props
  }

  return state
}
