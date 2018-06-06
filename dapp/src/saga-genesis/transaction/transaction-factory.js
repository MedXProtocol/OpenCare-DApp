let transactionIds = 1

export function nextId() {
  transactionIds += 1
  return transactionIds
}
