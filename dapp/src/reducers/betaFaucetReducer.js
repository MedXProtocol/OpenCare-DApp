export const betaFaucet = function (state, { type }) {
  if (typeof state === 'undefined') {
    state = {}
  }

  switch(type) {
    case 'HIDE_BETA_FAUCET_MODAL':
      state = {
        ...state,
        betaFaucetModalDismissed: true
      }
      break

    case 'SHOW_BETA_FAUCET_MODAL':
      state = {
        ...state,
        betaFaucetModalDismissed: false
      }
      break

    case 'SIGNED_OUT':
      state = {}
      break

    // no default
  }

  return state
}
