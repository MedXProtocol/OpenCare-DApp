// Determines if the passed in case is open for the current Doctor
export const openCase = function(c) {
  return (c.status.match(/2/) && c.isDiagnosingDoctor) || (c.status.match(/6/) && !c.isDiagnosingDoctor)
}

// Determines if the passed in case has been closed for the current Doctor
export const historicalCase = function(c) {
  return (!c.status.match(/2/) && c.isDiagnosingDoctor) || (!c.status.match(/6/) && !c.isDiagnosingDoctor)
}
