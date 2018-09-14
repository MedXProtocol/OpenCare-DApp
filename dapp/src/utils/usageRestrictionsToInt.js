export const usageRestrictionsStringMap = {
  'Locked': 0,
  'Open To Everyone': 1,
  'Only Doctors': 2
}

export const usageRestrictionsToInt = function (usageRestrictionsString) {
  const usageRestrictionsInt = usageRestrictionsStringMap[usageRestrictionsString]

  if (usageRestrictionsInt === undefined) {
    throw new Error('Unknown usageRestrictions enum: ', usageRestrictionsString)
  }

  return usageRestrictionsInt
}
