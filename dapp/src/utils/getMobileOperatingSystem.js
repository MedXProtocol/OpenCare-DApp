export const getMobileOperatingSystem = function() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "iOS"
  } else if (/android/i.test(userAgent)) {
    return "Android"
  }

  return "unknown"
}
