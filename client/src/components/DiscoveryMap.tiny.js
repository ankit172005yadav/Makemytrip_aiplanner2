import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { collectEffects, watch } from 'tinybubble'

export default {
    name: 'DiscoveryMap',
    props: ['places', 'center', 'selected'],
    template: () => '<div class="discovery-map" ref="canvas" aria-label="Travel map"></div>',
    mounted() {
        const center = this.props.center
        this.map = L.map(this.refs.canvas, { zoomControl: false }).setView(center, 12)
        L.control.zoom({ position: 'bottomright' }).addTo(this.map)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19, attribution: '© OpenStreetMap contributors',
        }).addTo(this.map)
        this.markers = new Map()
        for (const place of this.props.places || []) {
            const marker = L.circleMarker([place.lat, place.lng], {
                radius: 7, color: '#f3f3f3', weight: 1, fillColor: '#171717', fillOpacity: 1,
            }).addTo(this.map)
            const title = document.createElement('span')
            title.textContent = place.title
            marker.bindTooltip(title)
            this.markers.set(place.id, marker)
        }
        this.disposers = collectEffects(() => watch(() => this.props.selected, place => {
            if (!place) return
            this.map.flyTo([place.lat, place.lng], Math.max(13, this.map.getZoom()), { duration: .55 })
            this.markers.get(place.id)?.openTooltip()
        }))
        this.resize = new ResizeObserver(() => this.map?.invalidateSize({ pan: false }))
        this.resize.observe(this.refs.canvas)
    },
    beforeDestroy() {
        this.resize?.disconnect()
        this.disposers?.forEach(dispose => dispose())
        this.map?.remove()
        this.map = null
    },
}
