export const requiredNetworkIds = function () {
  return (process.env.REACT_APP_REQUIRED_NETWORK_IDS || '').split(/\s+/).map(id => parseInt(id, 10))
}
