import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { collectEffects, watch } from 'tinybubble'
import { addItineraryRoute, itineraryDayColors, itineraryStopNumber } from '../itineraryRoutes.js'
const coordinates = point => [point.lat,point.lng]

export default {
    name: 'ItineraryMap',
    props: ['days','meals','activeDay','selected','resetKey'],
    template: () => '<div class="discovery-map itinerary-map-canvas" ref="canvas" aria-label="Map of itinerary stops"></div>',
    mounted() {
        this.map = L.map(this.refs.canvas,{zoomControl:false,scrollWheelZoom:false})
        L.control.zoom({position:'bottomright'}).addTo(this.map)
        L.tileLayer('/api/map-tiles/{z}/{x}/{y}.png',{
            maxZoom:19,attribution:'© OpenStreetMap contributors, © CARTO',
        }).addTo(this.map)
        this.routes = L.layerGroup().addTo(this.map)
        this.draw()
        this.disposers = collectEffects(()=>{
            watch(()=>this.props.days,()=>this.draw())
            watch(()=>this.props.resetKey,()=>this.draw())
            watch(()=>this.props.activeDay,()=>this.draw())
            watch(()=>this.props.selected, point=>{
                if (!point) return
                this.map.flyTo(coordinates(point),Math.max(this.map.getZoom(),15),{duration:.55})
                this.markers.get(point.title)?.openPopup()
            })
        })
        this.resize = new ResizeObserver(()=>{
            this.map?.invalidateSize({pan:false})
            clearTimeout(this.resizeFit)
            this.resizeFit=setTimeout(()=>{
                if(!this.props.selected) this.fitRoute(false)
            },180)
        })
        this.resize.observe(this.refs.canvas)
    },
    draw() {
        this.routes.clearLayers()
        this.markers = new Map()
        const active = this.props.activeDay
        const bounds = []
        this.props.days.forEach((day,index)=>{
            if (active >= 0 && active !== index) return
            const points = day.stops.map(coordinates)
            bounds.push(...points)
            const color = itineraryDayColors[index]
            addItineraryRoute(this.routes, points, index)
            day.stops.forEach((stop,order)=>{
                const icon=L.divIcon({className:'itinerary-marker',html:'<span style="--marker:'+color+'">'+(active < 0 ? itineraryStopNumber(index, order) : (order+1))+'</span>',iconSize:[31,31],iconAnchor:[15,15]})
                const marker=L.marker(coordinates(stop),{icon,title:stop.title,alt:stop.title}).addTo(this.routes)
                const popup=document.createElement('div'),title=document.createElement('strong'),meta=document.createElement('div')
                title.textContent=stop.title
                meta.textContent='Day '+(index+1)+' · '+stop.time+' · '+stop.duration
                popup.append(title,meta)
                marker.bindPopup(popup)
                this.markers.set(stop.title,marker)
            })
        })
        this.props.meals.forEach((meals,index)=>{
            if (active >= 0 && active !== index) return
            for (const meal of meals) {
                const point=coordinates(meal)
                bounds.push(point)
                const icon=L.divIcon({className:'itinerary-food-marker',html:'<span aria-hidden="true">♨</span>',iconSize:[28,28],iconAnchor:[14,14]})
                const marker=L.marker(point,{icon,title:meal.title,alt:meal.title,zIndexOffset:100}).addTo(this.routes)
                const popup=document.createElement('div'),title=document.createElement('strong'),meta=document.createElement('div'),note=document.createElement('div')
                title.textContent=meal.title
                meta.textContent=meal.price+' · ★ '+meal.rating+' · '+meal.reviews+' sample reviews'
                note.textContent=meal.note+' Prototype venue.'
                popup.append(title,meta,note)
                marker.bindPopup(popup)
                this.markers.set(meal.title,marker)
            }
        })
        this.routeBounds=bounds
        this.fitRoute(this.map.getZoom()!==undefined)
    },
    fitRoute(animate) {
        if(!this.map || !this.routeBounds?.length || this.refs.canvas.clientWidth < 60 || this.refs.canvas.clientHeight < 60) return
        if(this.map.getZoom()===undefined) {
            this.map.setView(this.routeBounds[0],12,{animate:false})
            this.map.invalidateSize({pan:false})
        }
        this.map.fitBounds(this.routeBounds,{
            paddingTopLeft:[36,56],paddingBottomRight:[38,68],maxZoom:16,animate,
        })
    },
    beforeDestroy() {
        clearTimeout(this.resizeFit)
        this.resize?.disconnect()
        this.disposers?.forEach(dispose=>dispose())
        this.map?.remove()
        this.map=null
    },
}
