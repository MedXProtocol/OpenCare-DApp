export const betaFaucet = function (state, { type }) {
  if (typeof state === 'undefined') {
    state = {}
  }

  switch(type) {
    case 'BETA_FAUCET_MODAL_DISMISSED':
      state = {
        ...state,
        betaFaucetModalDismissed: true
      }
      break

    case 'BETA_FAUCET_MODAL_SMISSED':
      state = {
        ...state,
        betaFaucetModalDismissed: false
      }
      break

    // no default
  }

  return state
}
