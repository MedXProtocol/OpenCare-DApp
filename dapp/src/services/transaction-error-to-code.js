const ERROR_CODE_REGEXPS = {
  userRevert: /User denied transaction signature/,
  outOfGas: /Transaction ran out of gas/,
  evmRevert: /Transaction has been reverted by the EVM/,
  incorrectNonce: /the tx doesn't have the correct nonce/
}

export const transactionErrorToCode = function (errorString) {
  return Object.keys(ERROR_CODE_REGEXPS).find((errorCode) => ERROR_CODE_REGEXPS[errorCode].test(errorString))
}
