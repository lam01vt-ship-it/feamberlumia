export function mapsEmbedUrl(address: string): string {
  const q = encodeURIComponent(address.trim())
  return `https://maps.google.com/maps?q=${q}&z=16&ie=UTF8&iwloc=&output=embed`
}

export function mapsDirectionsUrl(address: string): string {
  const q = encodeURIComponent(address.trim())
  return `https://www.google.com/maps/dir/?api=1&destination=${q}`
}
