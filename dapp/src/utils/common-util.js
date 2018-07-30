export const promisify = (funcToCall) => {
  return new Promise((resolve, reject) => {
    return funcToCall((error, result) => {
      if (error) { reject(error) }

      resolve(result)
    })
  })
}

export const isNotEmptyString = (value) => {
  return value && value !== ""
}
