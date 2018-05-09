module.exports = function(length) {
  return Array.apply(null, {length}).map(Number.call, Number)
}
