import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { addItineraryRoute, itineraryDayColors, itineraryStopNumber } from './itineraryRoutes.js'

const tilePath = '/api/map-tiles/{z}/{x}/{y}.png'
const osmTiles = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const osmAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
const cityCenters = {
    Bengaluru: [12.9716, 77.5946],
    Jaipur: [26.9124, 75.7873],
}
const markerLabels = { stay: 'H', airport: '✈', activity: '•' }
const markerKinds = { stay: 'Stay', airport: 'Airport', activity: 'Activity' }

function isNumberedStop(point) {
    return point.kind === 'activity' && Number.isInteger(point.day) && point.day >= 0
        && Number.isInteger(point.order) && point.order >= 0
}

function validPoint(point) {
    return Number.isFinite(point?.lat) && Math.abs(point.lat) <= 90
        && Number.isFinite(point.lng) && Math.abs(point.lng) <= 180
}

function addMarker(layer, point, onSelect) {
    const kind = Object.hasOwn(markerKinds, point.kind) ? point.kind : 'activity'
    const pin = document.createElement('span')
    pin.className = `tm-map-marker-core tm-map-marker-core--${kind}`
    pin.setAttribute('aria-hidden', 'true')
    if (isNumberedStop(point)) {
        pin.textContent = itineraryStopNumber(point.day, point.order)
        pin.style.backgroundColor = itineraryDayColors[point.day]
    } else {
        pin.textContent = markerLabels[kind]
    }

    const name = `${markerKinds[kind]}: ${point.title}`
    const marker = L.marker([point.lat, point.lng], {
        icon: L.divIcon({ className: `tm-map-marker tm-map-marker--${kind}`, html: pin, iconSize: [32, 32], iconAnchor: [16, 16] }),
        title: name,
        alt: name,
        zIndexOffset: kind === 'stay' ? 100 : 0,
    })
    const tooltip = document.createElement('span')
    tooltip.textContent = point.title
    marker.bindTooltip(tooltip, {
        permanent: true,
        direction: kind === 'stay' ? 'right' : 'left',
        offset: [kind === 'stay' ? 13 : -13, 0],
        className: 'tm-map-label',
    })
    marker.on('add', () => {
        const element = marker.getElement()
        element.setAttribute('aria-label', name)
        element.dataset.stopId = point.id
        element.addEventListener('keydown', event => {
            if (event.key !== ' ' && event.key !== 'Enter') return
            event.preventDefault()
            event.stopPropagation()
            if (!event.repeat) onSelect?.(point)
        })
    })
    marker.on('click', () => onSelect?.(point))
    return marker.addTo(layer)
}

function drawRoutes(layer, points) {
    const days = new Map()
    for (const point of points.filter(isNumberedStop)) {
        if (!days.has(point.day)) days.set(point.day, [])
        days.get(point.day).push(point)
    }
    for (const [day, stops] of days) {
        if (stops.length < 2) continue
        const positions = stops.sort((a, b) => a.order - b.order).map(stop => [stop.lat, stop.lng])
        addItineraryRoute(layer, positions, day)
    }
}

export function mountTravemoreMap(container, onSelect) {
    container.classList.add('tm-map')
    container.setAttribute('role', 'region')
    if (!container.hasAttribute('aria-label')) container.setAttribute('aria-label', 'Trip map')
    container.dataset.basemap = 'carto'

    const map = L.map(container, { scrollWheelZoom: false, zoomControl: false, attributionControl: true })
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    const routes = L.layerGroup().addTo(map)
    const markers = L.layerGroup().addTo(map)
    const pins = new Map()
    const carto = L.tileLayer(tilePath, {
        maxZoom: 19,
        attribution: `${osmAttribution}, &copy; <a href="https://carto.com/attributions">CARTO</a>`,
    }).addTo(map)

    // Keep the trip markers usable even if both basemap services are unavailable.
    carto.once('tileerror', () => {
        carto.remove()
        container.dataset.basemap = 'osm'
        L.tileLayer(osmTiles, { maxZoom: 19, attribution: osmAttribution }).addTo(map)
    })

    let frame = 0
    let destroyed = false
    let mapCity
    let previousPoints
    let previousBounds
    let pendingView
    let pendingFocus

    function layout() {
        frame = 0
        if (container.clientWidth < 48 || container.clientHeight < 48) return
        map.invalidateSize({ animate: false, debounceMoveend: true })

        if (pendingView) {
            if (pendingView.length > 1) {
                const padding = Math.min(36, Math.floor(Math.min(container.clientWidth, container.clientHeight) / 6))
                map.fitBounds(pendingView, { padding: [padding, padding], maxZoom: 17, animate: false })
            } else {
                const center = pendingView[0] ?? cityCenters[mapCity] ?? [22.5, 79]
                map.setView(center, pendingView.length || cityCenters[mapCity] ? 13 : 5, { animate: false })
            }
            pendingView = null
        }
        if (pendingFocus !== undefined) {
            const marker = pins.get(pendingFocus)
            pendingFocus = undefined
            if (marker) {
                map.panInside(marker.getLatLng(), { padding: [36, 36], animate: false })
                marker.getElement()?.focus({ preventScroll: true })
            }
        }
    }

    function requestLayout() {
        if (!destroyed && !frame) frame = requestAnimationFrame(layout)
    }

    const resize = new ResizeObserver(requestLayout)
    resize.observe(container)

    return {
        update(city, points = []) {
            if (destroyed) return
            const visiblePoints = points.filter(validPoint)
            const signature = JSON.stringify([city, visiblePoints.map(({ id, lat, lng, kind, title, label, day, order }) => [
                id, lat, lng, kind, title, label, day, order,
            ])])
            if (signature !== previousPoints) {
                routes.clearLayers()
                markers.clearLayers()
                pins.clear()
                drawRoutes(routes, visiblePoints)
                for (const point of visiblePoints) pins.set(point.id, addMarker(markers, point, onSelect))
                previousPoints = signature
            }
            const positions = visiblePoints.map(({ lat, lng }) => [lat, lng])
            const bounds = JSON.stringify(positions.map(position => position.join(',')).sort())
            if (city !== mapCity || bounds !== previousBounds) {
                mapCity = city
                previousBounds = bounds
                pendingView = positions
                container.setAttribute('aria-label', city ? `Trip map for ${city}` : 'Trip map')
            }
            requestLayout()
        },
        focus(id) {
            if (destroyed || !pins.has(id)) return
            pendingFocus = id
            requestLayout()
        },
        destroy() {
            if (destroyed) return
            destroyed = true
            resize.disconnect()
            cancelAnimationFrame(frame)
            map.remove()
            container.classList.remove('tm-map')
            delete container.dataset.basemap
        },
    }
}
