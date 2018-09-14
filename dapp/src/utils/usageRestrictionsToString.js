const usageRestrictionsMap = {
  0: 'Locked',
  1: 'Open To Everyone',
  2: 'Only Doctors'
}

export const usageRestrictionsToString = function (usageRestrictionsInt) {
  if (usageRestrictionsInt === undefined) { return }

  const usageRestrictionsString = usageRestrictionsMap[usageRestrictionsInt]

  if (!usageRestrictionsString) {
    throw new Error('Unknown usageRestrictions enum: ', usageRestrictionsInt)
  }

  return usageRestrictionsString
}
