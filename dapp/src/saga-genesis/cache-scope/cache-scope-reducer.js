export default function (state, {type, call, response, error, calls, key}) {
  if (typeof state === 'undefined') {
    state = {}
  }

  return state
}
