export function addLogListener(address) {
  return {
    type: 'ADD_LOG_LISTENER',
    address
  }
}

export function removeLogListener(address) {
  return {
    type: 'REMOVE_LOG_LISTENER',
    address
  }
}
