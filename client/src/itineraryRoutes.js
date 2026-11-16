import L from 'leaflet'

export const itineraryDayColors = ['#ab183a', '#1459a0', '#137556']
export const itineraryStopNumber = (day, order) => (day + 1) + '.' + (order + 1)

export function addItineraryRoute(layer, points, day) {
    const style = { interactive: false }
    L.polyline(points, { ...style, color: '#fff', weight: 8, opacity: .9 }).addTo(layer)
    L.polyline(points, { ...style, color: itineraryDayColors[day], weight: 4, opacity: .95 }).addTo(layer)
}
