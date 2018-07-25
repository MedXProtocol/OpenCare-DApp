const evaluatingRegExp = new RegExp(/2/)
const challengingRegExp = new RegExp(/6/)

// Determines if the passed in case is open for the current Doctor
export const openCase = function(c) {
  return (
    evaluatingRegExp.test(c.status)
    && c.isDiagnosingDoctor
  ) || (
    challengingRegExp.test(c.status)
    && !c.isDiagnosingDoctor
  )
}

// Determines if the passed in case has been closed for the current Doctor
export const historicalCase = function(c) {
  return (
    !evaluatingRegExp.test(c.status)
    && c.isDiagnosingDoctor
  ) || (
    !challengingRegExp.test(c.status)
    && !c.isDiagnosingDoctor
  )
}
