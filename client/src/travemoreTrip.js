import { indiaGuides } from './indiaGuides.js'

export const weekendPrompt = 'Show me the best I can do for ₹15K this weekend'
export const weekend = { start: '2026-11-21', end: '2026-11-22' }
export const night = 86_400_000
export const origins = { Delhi: 'DEL', Mumbai: 'BOM' }

const rupees = new Intl.NumberFormat('en-IN')
export const money = amount => '₹' + rupees.format(amount)
export const dateLabel = date => new Intl.DateTimeFormat('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
}).format(new Date(date))

function stop(key, title, start, minutes, price, coordinates, note) {
    return { key, title, start, minutes, price, coordinates, note }
}

const jaipurGuideStops = indiaGuides.find(guide => guide.id === 'jaipur').days.flatMap(day => day.stops)
function jaipurStop(key, title, start, minutes, price, note) {
    const { lat, lng } = jaipurGuideStops.find(item => item.title === title)
    return stop(key, title, start, minutes, price, [lat, lng], note)
}

export const destinations = {
    Bengaluru: {
        airport: 'BLR', region: 'Karnataka', image: '/discovery/bengaluru.jpg',
        coordinates: {
            airport: [13.1989, 77.7068], central: [12.9759, 77.5982],
            value: [12.9784, 77.6408], quiet: [12.9427, 77.5732],
        },
        flights: [
            { id: 'early', price: 8200, outbound: '07:10–10:00', inbound: '20:45–23:35', note: 'Arrive in time for lunch and an afternoon in Cubbon Park.' },
            { id: 'late', price: 8900, outbound: '12:35–15:25', inbound: '20:45–23:35', note: 'Sleep in on Saturday. Move the park walk to Sunday.' },
        ],
        stays: [
            { id: 'central', name: 'Cubbon House', area: 'Central Bengaluru', price: 3700, note: 'Walk to Cubbon Park and the museum.' },
            { id: 'value', name: 'Metro Courtyard', area: 'Indiranagar', price: 2900, note: 'Allow 25 minutes by metro to the park and museum.' },
            { id: 'quiet', name: 'Lalbagh Residency', area: 'Basavanagudi', price: 4200, note: 'A quieter base. Allow 30 minutes to the city centre.' },
        ],
        saturday: [
            stop('cubbon', 'Cubbon Park', '14:00', 45, 0, [12.9763, 77.5929], 'Shaded paths around the central lawns.'),
            stop('museum', 'Visvesvaraya Museum', '15:35', 75, 600, [12.9750, 77.5962], 'Hands-on galleries a short walk from the park.'),
        ],
        sunday: [
            stop('lalbagh', 'Lalbagh Botanical Garden', '09:30', 75, 500, [12.9499, 77.5887], 'Start at the glasshouse and take the lake loop.'),
            stop('gandhi', 'Gandhi Bazaar', '11:30', 45, 400, [12.9455, 77.5735], 'Browse the flower stalls and stop for a snack.'),
        ],
        easy: [
            stop('cubbon', 'Cubbon Park', '15:00', 30, 0, [12.9763, 77.5929], 'Follow the shaded loop at an easy pace.'),
            stop('vidhana', 'Vidhana Soudha viewpoint', '16:00', 20, 0, [12.9791, 77.5920], 'A short walk to the public view of the façade.'),
        ],
        alternatives: [
            stop('vidhana', 'Vidhana Soudha viewpoint', '16:00', 20, 0, [12.9791, 77.5920], 'See the façade from the public side of the road.'),
            stop('ulsoor', 'Ulsoor Lake', '16:00', 30, 0, [12.9831, 77.6205], 'An easy waterfront walk east of the centre.'),
        ],
        reason: 'The early flight leaves Saturday afternoon free. A central stay puts the first stops within walking distance.',
    },
    Jaipur: {
        airport: 'JAI', region: 'Rajasthan', image: '/discovery/jaipur-amer.jpg',
        coordinates: {
            airport: [26.8242, 75.8122], central: [26.9212, 75.8256],
            value: [26.9221, 75.7946], quiet: [26.9313, 75.7896],
        },
        flights: [
            { id: 'early', price: 6100, outbound: '08:15–09:20', inbound: '20:05–21:10', note: 'Arrive before the old city gets busy.' },
            { id: 'late', price: 6600, outbound: '13:05–14:10', inbound: '20:05–21:10', note: 'A slower start leaves room for one afternoon stop.' },
        ],
        stays: [
            { id: 'central', name: 'Pink City Courtyard', area: 'Old City', price: 3400, note: 'Walk to Hawa Mahal and Johari Bazaar.' },
            { id: 'value', name: 'Sindhi Camp Guesthouse', area: 'Sindhi Camp', price: 2500, note: 'Allow 20 minutes by metro to the old city.' },
            { id: 'quiet', name: 'Bani Park House', area: 'Bani Park', price: 3900, note: 'A quieter neighbourhood, about 25 minutes from the old city.' },
        ],
        saturday: [
            jaipurStop('hawa', 'Hawa Mahal', '13:00', 45, 500, 'Start with the façade and the upper galleries.'),
            jaipurStop('johari', 'Johari Bazaar', '14:45', 60, 0, 'Browse the jewellery lanes on foot.'),
        ],
        sunday: [
            jaipurStop('amer', 'Amer Fort', '09:00', 120, 550, 'Leave time for the main courtyards.'),
            jaipurStop('jaigarh', 'Jaigarh Fort', '11:30', 75, 250, 'Follow the ramparts for views back toward Amer.'),
        ],
        easy: [
            stop('hawa-view', 'Hawa Mahal façade', '15:00', 20, 0, [26.9239, 75.8267], 'See the Pink City landmark from the street.'),
            jaipurStop('johari', 'Johari Bazaar', '15:50', 30, 0, 'Take a short loop around the market.'),
        ],
        alternatives: [
            jaipurStop('jal', 'Jal Mahal viewpoint', '16:00', 30, 0, 'A short lakeside break with a view of the water palace.'),
            jaipurStop('bapu', 'Bapu Bazaar', '16:00', 30, 0, 'Browse textiles in the old-city market.'),
        ],
        reason: 'The short flight keeps most of Saturday open. Staying in the old city makes the first afternoon easy to do on foot.',
    },
}

const mumbaiFlights = {
    Bengaluru: [
        { id: 'early', price: 6100, outbound: '07:20–09:05', inbound: '20:10–21:55', note: 'Arrive before lunch and spend the afternoon in Cubbon Park.' },
        { id: 'late', price: 6900, outbound: '13:05–14:50', inbound: '20:10–21:55', note: 'Leave after lunch. Move the park walk to Sunday.' },
    ],
    Jaipur: [
        { id: 'early', price: 7200, outbound: '07:40–09:30', inbound: '20:40–22:30', note: 'Arrive before the old city gets busy.' },
        { id: 'late', price: 7550, outbound: '12:50–14:40', inbound: '20:40–22:30', note: 'A later arrival leaves time to explore near your stay.' },
    ],
}

export function stopAlternatives(city, key) {
    return destinations[city].alternatives.filter(item => item.key !== key)
}

function timeMinutes(start) {
    const [hour, minute] = start.split(':').map(Number)
    return hour * 60 + minute
}

function timeLabel(minutes) {
    return [Math.floor(minutes / 60), minutes % 60].map(value => String(value).padStart(2, '0')).join(':')
}

function arrangeDay(stops, keys, overrides, place) {
    const available = new Map(stops.map(item => [item.key, item]))
    const order = [...new Set([...(keys ?? []), ...available.keys()])].filter(key => available.has(key))
    let nextAvailable = 0
    return order.map((key, index) => {
        const original = available.get(key)
        const replacement = place.alternatives.find(item => item.key === overrides?.[key])
        const item = replacement ?? original
        const start = Math.max(timeMinutes(stops[index].start), nextAvailable)
        const end = start + item.minutes
        nextAvailable = end + 10
        return { ...item, key, start: timeLabel(start), time: timeLabel(start) + '–' + timeLabel(end), duration: item.minutes + ' min' }
    })
}

export function mapPoints(trip, cost, day, airport) {
    const location = cost.place.coordinates
    const point = (id, title, coordinates, kind, label) => ({
        id, title, lat: coordinates[0], lng: coordinates[1], kind, label,
    })
    const activities = cost.days.flatMap((events, index) => {
        if (day !== 'all' && Number(day) !== index) return []
        return events.map((item, order) => ({
            ...point('day-' + index + '-' + order, item.title, item.coordinates, 'activity', dateLabel(index === 0 ? trip.start : trip.end)),
            day: index, order, key: item.key, time: item.time, duration: item.duration, note: item.note,
        }))
    })
    const stay = point('stay', cost.stay.name, location[trip.stay], 'stay', cost.stay.area + (trip.unavailable ? ' · Unavailable' : ' · Approximate location'))
    return [...(day === 'all' ? [stay] : []), ...activities, ...(airport ? [point('airport', cost.place.airport + ' airport', location.airport, 'airport', 'Arrival and return flights')] : [])]
}

export function tripCost(trip, city = trip.city, flightId = trip.flight, stayId = trip.stay) {
    const place = destinations[city]
    const origin = Object.hasOwn(origins, trip.origin) ? trip.origin : 'Delhi'
    const originAirport = origins[origin]
    const flightOptions = origin === 'Mumbai' ? mumbaiFlights[city] : place.flights
    const flight = flightOptions.find(option => option.id === flightId)
    const stay = place.stays.find(option => option.id === stayId)
    const rooms = Math.ceil(trip.travelers / 2)
    const saturday = trip.quiet ? place.easy : place.saturday
    const schedule = flight.id === 'late'
        ? [[stop('check-in', 'Check in at ' + stay.name, '17:00', 30, 0, place.coordinates[stayId], 'Leave the evening free after the later flight.')],
            [...saturday, ...place.sunday].map((item, index) => ({ ...item, start: ['08:30', '09:45', '11:30', '14:15'][index] }))]
        : [saturday, place.sunday]
    const days = schedule.map((stops, day) => arrangeDay(stops, trip.stopOrder?.[day], trip.stopOverrides, place))
    const flights = flight.price * trip.travelers
    const lodge = stay.price * rooms
    const activities = days.flat().reduce((sum, activity) => sum + activity.price * trip.travelers, 0)
    return { place, originAirport, flightOptions, flight, stay, rooms, days, flights, lodge, activities, total: flights + lodge + activities }
}
