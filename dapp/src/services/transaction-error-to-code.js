const ERROR_CODE_REGEXPS = {
  userRevert: /User denied transaction signature/,
  outOfGas: /Transaction ran out of gas/,
  evmRevert: /Transaction has been reverted by the EVM/
}

export const transactionErrorToCode = function (errorString) {
  return Object.keys(ERROR_CODE_REGEXPS).find((errorCode) => ERROR_CODE_REGEXPS[errorCode].test(errorString))
}
