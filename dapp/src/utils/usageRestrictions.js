import invert from 'lodash.invert'

// Maps to the enums in AdminSettings.sol contract
export const usageRestrictionsMap = {
  0: 'Locked',
  1: 'Open To Everyone',
  2: 'Only Doctors'
}

export const usageRestrictionsMapInverted = invert(usageRestrictionsMap)

export const usageRestrictionsToInt = function (usageRestrictionsString) {
  const usageRestrictionsInt = usageRestrictionsMapInverted[usageRestrictionsString]

  if (usageRestrictionsInt === undefined) {
    throw new Error('Unknown usageRestrictions enum: ', usageRestrictionsString)
  }

  return parseInt(usageRestrictionsInt, 10)
}

export const usageRestrictionsToString = function (usageRestrictionsInt) {
  console.log(usageRestrictionsInt)
  if (usageRestrictionsInt === undefined) { return }

  const usageRestrictionsString = usageRestrictionsMap[usageRestrictionsInt]

  if (!usageRestrictionsString) {
    throw new Error('Unknown usageRestrictions enum: ', usageRestrictionsInt)
  }

  return usageRestrictionsString
}
