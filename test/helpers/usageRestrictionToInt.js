const usageRestrictionsMap = {
  'Locked': 0,
  'Open To Everyone': 1,
  'Only Doctors': 2
}

module.exports = function (usageRestrictionsString) {
  const usageRestrictionsInt = usageRestrictionsMap[usageRestrictionsString]

  if (!usageRestrictionsInt) {
    throw new Error('Unknown usageRestrictions: ', usageRestrictionsString)
  }

  return usageRestrictionsInt
}
