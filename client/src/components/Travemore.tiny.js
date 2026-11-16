import { dateLabel, destinations, mapPoints, money, night, origins, stopAlternatives, tripCost, weekend, weekendPrompt } from '../travemoreTrip.js'
import { mountTravemoreMap } from '../travemoreMap.js'
import { itineraryDayColors, itineraryStopNumber } from '../itineraryRoutes.js'
import '../travemore.css'

const clean = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char])
const action = (id, label, style = 'tm-outline') => `<button type="button" class="${style}" data-action="${id}">${clean(label)}</button>`
const dateRange = trip => `${dateLabel(trip.start)} – ${dateLabel(trip.end)}`
const people = count => `${count} traveller${count === 1 ? '' : 's'}`
const initialTrip = () => ({
    origin: 'Delhi', searchCity: 'Bengaluru', city: 'Bengaluru', budget: 15000, travelers: 1, ...weekend,
    confirmed: false, budgetFixed: false, datesFixed: false, partyFixed: false,
    flight: 'early', stay: 'central', quiet: false, unavailable: false,
})
const planningStages = ['review', 'view']
const examples = [
    ['weekend', weekendPrompt],
    ['city', 'Plan a weekend in Bengaluru'],
    ['compare', 'Where can I go from Delhi?'],
]
const planActions = [
    ['stays', 'Compare stays'], ['flights', 'Show a later flight'],
    ['quieter', 'Make Saturday quieter'], ['why', 'Why this plan?'],
]

function costRows(cost) {
    return `<dl class="tm-costs"><div><dt>Return flights</dt><dd>${money(cost.flights)}</dd></div>
        <div><dt>Stay</dt><dd>${money(cost.lodge)}</dd></div><div><dt>Activities</dt><dd>${money(cost.activities)}</dd></div></dl>`
}

function bookingRows(trip, cost, changed = '', focus = null) {
    const reservations = `<div class="tm-booking ${changed === 'flights' ? 'tm-updated' : ''}">
        <div class="tm-row"><strong>Flights</strong><b>${money(cost.flights)}</b></div>
        <div class="tm-leg"><strong>${cost.originAirport} → ${cost.place.airport}</strong><span>${dateLabel(trip.start)} · ${cost.flight.outbound}</span></div>
        <div class="tm-leg"><strong>${cost.place.airport} → ${cost.originAirport}</strong><span>${dateLabel(trip.end)} · ${cost.flight.inbound}</span></div>
        <div class="tm-row-actions">${action('flights', 'Compare flights', 'tm-link')}${action('map-airport', 'Show airport', 'tm-link')}</div>
        </div>
        <div class="tm-booking ${changed === 'stays' ? 'tm-updated' : ''}">
        <div class="tm-row"><strong>Stay</strong><b>${money(cost.lodge)}</b></div>
        <div class="tm-stay"><strong>${cost.stay.name}</strong><span>${cost.stay.area} · 1 night · ${cost.rooms} room${cost.rooms > 1 ? 's' : ''}</span></div>
        <p class="${trip.unavailable ? 'tm-warning' : 'tm-muted'}">${trip.unavailable ? 'Unavailable in this simulation. Choose a replacement.' : cost.stay.note}</p>
        <div class="tm-row-actions">${action('stays', trip.unavailable ? 'Find a replacement' : 'Compare stays', 'tm-link')}${action('map-stay', 'Show on map', 'tm-link')}</div>
        </div>`
    const stops = `<div class="tm-booking">
        <div class="tm-row"><strong>Activities</strong><b>${money(cost.activities)}</b></div>
        ${cost.days.map((day, index) => `<section class="tm-day" style="--tm-day:${itineraryDayColors[index]}">
            <div class="tm-row"><h3>${dateLabel(index === 0 ? trip.start : trip.end)}</h3>${focus ? action('day-' + index, 'Show day on map', 'tm-link') : ''}</div>
            ${day.map((item, order) => {
                const id = 'day-' + index + '-' + order
                return `<div class="tm-stop ${focus?.id === id ? 'tm-stop-selected' : ''} ${focus?.changed === id ? 'tm-stop-updated' : ''}" data-stop="${id}">
                    <button type="button" class="tm-stop-main" data-action="map-${id}">
                        <span class="tm-stop-number">${itineraryStopNumber(index, order)}</span>
                        <span class="tm-stop-text"><strong>${clean(item.title)}</strong><small>${clean(item.note)}</small></span>
                        <span class="tm-stop-time">${item.time}<small>${item.duration}</small></span>
                    </button>
                    ${focus ? `<details class="tm-stop-details"><summary>Stop options</summary>
                        <div class="tm-row-actions">
                            ${action('replace-' + index + '-' + order, 'Replace stop', 'tm-link')}
                            ${order > 0 ? action('move-' + index + '-' + order + '-up', 'Move earlier', 'tm-link') : ''}
                            ${order < day.length - 1 ? action('move-' + index + '-' + order + '-down', 'Move later', 'tm-link') : ''}
                        </div></details>` : ''}
                </div>`
            }).join('')}</section>`).join('')}
        ${focus ? action('quieter', trip.quiet ? 'Restore Saturday activities' : 'Make Saturday quieter', 'tm-link') : ''}
        </div>`
    return focus ? stops + reservations : reservations + stops
}

function mountPlanner(root) {
    const composer = root.querySelector('form')
    const input = composer.elements.intent
    const chat = root.querySelector('.tm-messages')
    const chatPopover = root.querySelector('.tm-chat-popover')
    const panel = root.querySelector('.tm-itinerary')
    const viewTrip = root.querySelector('.tm-view-trip')
    const mapPanel = root.querySelector('.tm-map-pane')
    const mapDock = root.querySelector('.tm-map-dock')
    const mapDetail = mapPanel.querySelector('.tm-map-detail')
    const dialog = root.querySelector('dialog')
    const dialogBody = dialog.querySelector('.tm-dialog-body')
    const announce = root.querySelector('.tm-announcer')
    const originContext = root.querySelector('#tm-search-origin')
    const cityContext = root.querySelector('#tm-search-city')
    const mobileBrief = root.querySelector('.tm-mobile-brief')
    const threadOrigin = root.querySelector('.tm-thread-origin')
    let trip = initialTrip()
    let stage = 'start'
    let messages = []
    let undo = null
    let modal = ''
    const modalTrail = []
    let restoreAction = null
    let compareChoice = ''
    let activeDay = 'all'
    let airportVisible = false
    let mapSelection = ''
    let map
    let entryComposer
    let quietProposal = null
    let replacement = null
    let changedStop = ''

    function showChat(open) {
        root.dataset.chatOpen = String(open)
        chatPopover.inert = !open
    }

    function selectStop(id, scroll = false) {
        for (const row of panel.querySelectorAll('[data-stop]')) row.classList.toggle('tm-stop-selected', row.dataset.stop === id)
        if (scroll) panel.querySelector(`[data-stop="${id}"]`)?.scrollIntoView({ block: 'nearest' })
    }

    function refreshMap() {
        if (stage === 'start') return
        const ready = stage === 'ready' || stage === 'approved'
        const cost = tripCost(trip)
        const points = ready ? mapPoints(trip, cost, activeDay, airportVisible) : []
        if (!map) map = mountTravemoreMap(mapPanel.querySelector('.tm-map-canvas'), point => {
            mapSelection = point.id
            selectStop(point.id, !dialog.open)
            refreshMap()
        })
        map.update(trip.city, points)
        mapPanel.classList.toggle('tm-map-preview', !ready)
        mapPanel.querySelector('.tm-map-heading h2').textContent = ready ? 'On the map' : trip.city + ' area'
        for (const button of mapPanel.querySelectorAll('[data-map-day]')) {
            button.setAttribute('aria-pressed', String(button.dataset.mapDay === activeDay))
        }
        mapPanel.querySelector('[data-action=toggle-airport]').setAttribute('aria-pressed', String(airportVisible))
        const selected = points.find(point => point.id === mapSelection)
        for (const pin of mapPanel.querySelectorAll('.tm-map-marker')) {
            pin.classList.toggle('tm-map-selected', Boolean(selected && pin.dataset.stopId === selected.id))
        }
        mapDetail.innerHTML = selected
            ? `<strong>${clean(selected.title)}</strong><p>${clean([selected.label, selected.time, selected.duration].filter(Boolean).join(' · '))}</p>
                ${selected.kind === 'stay' ? action('stays', 'Compare stays', 'tm-link') : selected.kind === 'airport' ? action('flights', 'Compare flights', 'tm-link') : action('jump-' + selected.id, 'Show in itinerary', 'tm-link')}`
            : ready ? '<p>Choose a pin to see how it fits your trip.</p>' : '<p>Your stays and activities will appear here as you plan.</p>'
    }

    function showOnMap(id, opener) {
        mapSelection = id
        if (id === 'airport') airportVisible = true
        if (id === 'stay') activeDay = 'all'
        if (id.startsWith('day-')) activeDay = id.split('-')[1]
        if (!mapPoints(trip, tripCost(trip), activeDay, airportVisible).some(point => point.id === id)) mapSelection = 'stay'
        if (matchMedia('(max-width: 760px)').matches && modal !== 'view') {
            modalTrail.length = 0
            openModal('view', opener)
        } else if (dialog.open && modal !== 'view') {
            modalTrail.length = 0
            dialog.close()
        }
        refreshMap()
        selectStop(mapSelection)
        map?.focus(mapSelection)
    }

    function add(role, body, actions = []) {
        messages.push({ role, body, actions })
    }

    function removeActions(ids) {
        for (const message of messages) message.actions = message.actions.filter(([id]) => !ids.includes(id))
    }

    function planReason(cost = tripCost(trip)) {
        if (trip.flight === 'early' && trip.stay === 'central' && !trip.quiet) return cost.place.reason
        const pace = trip.quiet ? (trip.flight === 'late' ? ' Saturday is set aside for check-in and rest.' : ' Saturday has just one short outing.') : ''
        return cost.flight.note + ' ' + cost.stay.note + pace
    }

    function constraints(showEdit = true) {
        return `<dl class="tm-constraints">
          <div><dt>Fixed</dt><dd>${trip.origin}${trip.budgetFixed ? ' · ' + money(trip.budget) + ' total' : ''}${trip.datesFixed ? ' · ' + dateRange(trip) : ''}${trip.confirmed ? ' · ' + trip.city : ''}${trip.partyFixed ? ' · ' + people(trip.travelers) : ''}</dd></div>
          <div><dt>Flexible</dt><dd>${trip.confirmed ? '' : 'Destination · '}Flight time · Stay area</dd></div>
          <div><dt>Assumed</dt><dd>${[!trip.partyFixed && people(trip.travelers), !trip.datesFixed && dateRange(trip), !trip.budgetFixed && money(trip.budget) + ' total'].filter(Boolean).join(' · ') || 'None'}</dd></div>
          </dl>${showEdit ? action('preferences', 'Edit trip details', 'tm-link') : ''}`
    }

    function totalBlock(cost) {
        const difference = trip.budget - cost.total
        return `<div class="tm-total"><span>Estimated trip total</span><strong>${money(cost.total)}</strong><small>Whole party · ${people(trip.travelers)}</small>
            <span class="tm-budget ${difference < 0 ? 'tm-budget-over' : ''}">${difference < 0 ? money(-difference) + ' over budget' : money(difference) + ' under budget'}</span>
            ${costRows(cost)}<p class="tm-muted">Meals and local transport excluded.</p></div>`
    }

    function savingAction(cost) {
        const alternatives = [
            ...cost.place.stays.filter(option => !trip.unavailable || option.id !== trip.stay)
                .map(option => ({ id: 'stays', name: option.name, total: tripCost(trip, trip.city, trip.flight, option.id).total })),
            ...cost.flightOptions.map(option => ({ id: 'flights', name: option.id === 'early' ? 'the early flight' : 'the later flight', total: tripCost(trip, trip.city, option.id).total })),
            ...(!trip.quiet ? [{ id: 'quieter', name: 'a quieter Saturday', total: tripCost({ ...trip, quiet: true }).total }] : []),
        ].sort((a, b) => a.total - b.total)
        const best = alternatives[0]
        if (best && best.total < cost.total) return `<p>Choose ${best.name} to save ${money(cost.total - best.total)}.${best.total > trip.budget ? ' The plan will still be above your limit.' : ''}</p>${action(best.id, best.id === 'stays' ? 'Compare stays' : best.id === 'flights' ? 'Compare flights' : 'Make Saturday quieter', 'tm-link')}`
        return `<p>These options are already at their lowest price for ${trip.city}.</p>${action('compare', 'Compare destinations', 'tm-link')}`
    }

    function itinerary() {
        const cost = tripCost(trip)
        return `<div class="tm-destination" style="--destination:url('${cost.place.image}')">
            <div><span>${trip.origin} to</span><h2>${trip.city}</h2><p>${dateRange(trip)} · ${people(trip.travelers)}</p></div>
            </div>${totalBlock(cost)}
            ${cost.total > trip.budget ? `<div class="tm-recovery">${savingAction(cost)}</div>` : ''}
            ${bookingRows(trip, cost, root.dataset.changed, { id: mapSelection, changed: changedStop })}
            <details class="tm-details"><summary>Trip preferences</summary>${constraints()}
                ${trip.city === 'Bengaluru' ? '<p class="tm-muted">Photo by <a class="tm-credit-link" href="https://commons.wikimedia.org/wiki/File:Vidhana_Soudha_in_daylight.jpg">Basavaraj M</a> · <a class="tm-credit-link" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a> · Cropped</p>' : ''}</details>
            <div class="tm-review-action"><span><small>Trip estimate</small><strong>${money(cost.total)}</strong></span>
                ${action('review', stage === 'approved' ? 'View approved trip' : 'Review trip', 'tm-primary')}</div>`
    }

    function render({ scroll = false, changed = '' } = {}) {
        if (scroll) showChat(true)
        const cost = tripCost(trip)
        const ready = stage === 'ready' || stage === 'approved'
        const priorStage = root.dataset.stage
        root.dataset.reveal = String(ready && (priorStage === 'start' || priorStage === 'clarify' || priorStage === 'compare'))
        root.dataset.stage = stage
        root.dataset.changed = changed
        chat.innerHTML = messages.map(message => `<article class="tm-message tm-${message.role}">
            ${message.role === 'assistant' ? '<b class="tm-speaker">Travemore</b>' : ''}
            <p>${clean(message.body)}</p>
            ${message.actions.length ? `<div class="tm-choices">${message.actions.map(([id, label]) => action(id, label)).join('')}</div>` : ''}
            </article>`).join('')
        panel.innerHTML = ready ? itinerary() : `<div class="tm-pending">
            <header><h2>Trip brief</h2><p class="tm-muted">${stage === 'compare' ? 'Comparing destinations' : 'Search context'}</p></header>
            <dl class="tm-brief-rows">
                <div><dt>Leaving from</dt><dd>${trip.origin} <small>${cost.originAirport}</small></dd></div>
                <div><dt>Destination</dt><dd>${trip.searchCity || 'Open to options'}${trip.searchCity ? '<small>From search</small>' : ''}</dd></div>
                <div><dt>Travel dates</dt><dd>${dateRange(trip)}</dd></div>
                <div><dt>Travellers</dt><dd>${people(trip.travelers)}</dd></div>
                <div><dt>Trip budget</dt><dd>${money(trip.budget)} <small>Total</small></dd></div>
            </dl>
            <details class="tm-brief-details"><summary>Planning preferences</summary>${constraints(false)}</details>
            ${action('preferences', 'Edit trip details', 'tm-link')}
        </div>`
        viewTrip.innerHTML = ready ? action('view', 'View map', 'tm-outline') : ''
        mobileBrief.innerHTML = !ready && stage !== 'start'
            ? `<strong>From ${trip.origin}</strong><span>${dateRange(trip)}</span><span>${money(trip.budget)} total</span>`
            : ''
        threadOrigin.textContent = 'From ' + trip.origin
        originContext.value = trip.origin
        cityContext.value = trip.searchCity
        refreshMap()
        input.placeholder = ready ? 'Ask to edit this itinerary…' : 'A weekend away, a place, or a budget…'
        if (entryComposer) {
            const position = composer.getBoundingClientRect()
            const offset = Math.max(-112, Math.min(112, entryComposer.top - position.top))
            const timing = { duration: 240, easing: 'cubic-bezier(.2,.8,.24,1)' }
            composer.animate([{ transform: `translateY(${offset}px)`, opacity: .65 }, { transform: 'translateY(0)', opacity: 1 }], timing)
            chat.querySelector('.tm-user')?.animate([{ transform: 'translateY(14px)', opacity: .2 }, { transform: 'translateY(0)', opacity: 1 }], timing)
            chat.querySelector('.tm-assistant')?.animate([{ opacity: .35, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { ...timing, delay: 80, fill: 'backwards' })
            entryComposer = null
        }
        if (scroll) requestAnimationFrame(() => { chat.scrollTop = chat.scrollHeight })
        if (changed) announce.textContent = `Trip updated. Estimated total ${money(cost.total)} for ${people(trip.travelers)}.`
    }

    function recommend(city) {
        trip = { ...trip, city, confirmed: true, stay: 'central', flight: 'early', quiet: false, unavailable: false, stopOrder: {}, stopOverrides: {} }
        undo = null
        removeActions(['choose-Bengaluru', 'choose-Jaipur', 'compare', 'undo', 'apply-quiet', 'cancel-quiet'])
        quietProposal = null
        changedStop = ''
        activeDay = 'all'
        airportVisible = false
        mapSelection = ''
        stage = 'ready'
        const cost = tripCost(trip)
        const price = cost.total <= trip.budget
            ? `${money(cost.total)} for ${people(trip.travelers)}, ${money(trip.budget - cost.total)} under your total budget.`
            : `${money(cost.total)} for ${people(trip.travelers)}, ${money(cost.total - trip.budget)} over your total budget. I’ve put the cheapest changes next to the estimate.`
        add('assistant', `${city}, ${dateRange(trip)}. ${planReason(cost)} ${price}`, planActions)
        render({ scroll: true })
        announce.textContent = `Trip ready. Estimated total ${money(cost.total)}.`
    }

    function compareDestinations() {
        const cities = Object.keys(destinations).map(city => {
            const cost = tripCost({ ...trip, flight: 'early', stay: 'central', quiet: false }, city)
            return { city, total: cost.total }
        })
        if (stage !== 'ready' && stage !== 'approved') stage = 'compare'
        if (dialog.open) {
            modalTrail.length = 0
            dialog.close()
        }
        add('assistant', `Same dates, ${people(trip.travelers)}. Jaipur comes to ${money(cities[1].total)} with more Saturday time in the old city. Bengaluru comes to ${money(cities[0].total)} with a central stay near the park. Which would you like to plan?`, [
            ['choose-Jaipur', `Jaipur · ${money(cities[1].total)}`],
            ['choose-Bengaluru', `Bengaluru · ${money(cities[0].total)}`],
        ])
        render({ scroll: true })
    }

    function openModal(next, opener) {
        if (!dialog.open) {
            restoreAction = opener?.dataset.action || null
            dialog.showModal()
        }
        modal = next
        compareChoice = ''
        renderModal()
        dialog.scrollTop = 0
        dialog.querySelector('[data-modal-title]').focus({ preventScroll: true })
    }

    function renderModal() {
        const cost = tripCost(trip)
        const titles = { view: 'Trip map', review: 'Review your trip', stays: 'Compare stays', flights: 'Compare flights', preferences: 'Trip details', approved: 'Trip approved', stop: 'Replace stop' }
        dialog.dataset.screen = modal
        let body = ''
        if (modal === 'view') body = '<div class="tm-mobile-map-dock"></div>'
        if (modal === 'stop' && replacement) {
            const current = cost.days[replacement.day][replacement.order]
            const options = stopAlternatives(trip.city, current.key)
                .filter(option => !cost.days.flat().some(stop => stop.title === option.title))
            body = `<p class="tm-review-summary">${clean(current.title)} · ${current.time}</p>
                ${options.map(option => `<div class="tm-option"><div class="tm-row"><strong>${clean(option.title)}</strong><b>${money(option.price)}</b></div>
                  <p>${clean(option.note)}</p>${action('use-stop-' + option.key, 'Use this stop', 'tm-primary')}</div>`).join('') || '<p class="tm-muted">No other stops are available for this time slot.</p>'}`
        }
        if (modal === 'review') {
            body = `<p class="tm-review-summary">${trip.origin} ↔ ${trip.city} · ${dateRange(trip)} · ${people(trip.travelers)}</p>
                <div class="tm-review-grid">
                    <div class="tm-review-rows">${bookingRows(trip, cost)}
                        <div class="tm-modal-actions">${action('preferences', 'Edit trip details', 'tm-link')}${action('availability', 'Recheck stay availability', 'tm-link')}</div>
                    </div>
                    <div class="tm-review-price">${totalBlock(cost)}
                        ${cost.total > trip.budget ? `<div class="tm-recovery">${savingAction(cost)}</div>` : ''}
                        <p class="tm-review-note tm-muted">Prices and availability are simulated.</p>
                    </div>
                    <footer class="tm-review-footer">${action('chat', 'Back to chat', 'tm-link')}
                        <button class="tm-primary" data-action="approve" ${trip.unavailable || cost.total > trip.budget ? 'disabled' : ''}>Approve trip</button>
                    </footer>
                </div>`
        }
        if (modal === 'stays' || modal === 'flights') {
            const options = modal === 'stays' ? cost.place.stays : cost.flightOptions
            const current = modal === 'stays' ? trip.stay : trip.flight
            body = options.map(option => {
                const isCurrent = option.id === current
                const unavailable = modal === 'stays' && isCurrent && trip.unavailable
                const selected = option.id === compareChoice
                const newCost = modal === 'stays' ? tripCost(trip, trip.city, trip.flight, option.id) : tripCost(trip, trip.city, option.id)
                const diff = newCost.total - cost.total
                const label = modal === 'stays' ? option.name : option.id === 'early' ? 'Early departure' : 'Later departure'
                const detail = modal === 'stays' ? option.area : cost.originAirport + ' → ' + cost.place.airport + ' · ' + option.outbound
                return `<div class="tm-option ${selected ? 'tm-selected' : ''}"><div class="tm-row"><strong>${label}</strong><b>${money(modal === 'stays' ? newCost.lodge : newCost.flights)}</b></div>
                    <p class="tm-muted">${detail}${isCurrent ? ' · Current choice' : ''}</p><p>${option.note}</p>
                    ${unavailable ? '<p class="tm-warning">Unavailable</p>' : isCurrent ? '' : `<div class="tm-row"><span>${diff === 0 ? 'Same total' : money(Math.abs(diff)) + (diff < 0 ? ' less' : ' more')}</span>${action('preview-' + option.id, selected ? 'Previewing' : 'Preview change')}</div>`}
                    </div>`
            }).join('')
            if (compareChoice) {
                const next = modal === 'stays' ? tripCost(trip, trip.city, trip.flight, compareChoice) : tripCost(trip, trip.city, compareChoice)
                body += `<div class="tm-preview"><div class="tm-row"><strong>New trip total</strong><strong>${money(next.total)}</strong></div>
                    <p>${money(Math.abs(trip.budget - next.total))} ${trip.budget >= next.total ? 'under' : 'over'} budget</p>
                    ${action('apply', 'Apply change', 'tm-primary')}</div>`
            }
        }
        if (modal === 'preferences') {
            body = `<p class="tm-muted">Departing from ${trip.origin}. The budget covers the whole party.</p>
                <form class="tm-pref-form"><label>Trip budget (₹)<input name="budget" type="number" min="1000" max="1000000" step="1" required value="${trip.budget}"></label>
                <label>Travellers<input name="travelers" type="number" min="1" max="8" step="1" required value="${trip.travelers}"></label>
                <label>Depart<input name="start" type="date" required value="${trip.start}"></label>
                <label>Return<input name="end" type="date" required value="${trip.end}"></label>
                <p class="tm-warning" role="alert" data-form-error></p><button class="tm-primary">Save details</button></form>`
        }
        if (modal === 'approved') body = `<p>${trip.city} · ${dateRange(trip)} · ${people(trip.travelers)}</p>${totalBlock(cost)}<p class="tm-muted">Plan approved in this prototype.</p><div class="tm-modal-actions">${action('close', 'Back to conversation', 'tm-primary')}</div>`
        dialogBody.innerHTML = `<header class="tm-dialog-header"><h2 id="tm-modal-title" data-modal-title tabindex="-1">${titles[modal]}</h2>
            <button type="button" class="tm-close" data-action="close" aria-label="Close ${titles[modal].toLowerCase()}">×</button></header>${body}`
        const dock = dialogBody.querySelector('.tm-mobile-map-dock') || mapDock
        if (mapPanel.parentElement !== dock) dock.append(mapPanel)
    }

    function closeModal() {
        if (modalTrail.length) {
            openModal(modalTrail.pop())
        } else {
            dialog.close()
        }
    }

    function editOption(kind, opener) {
        if (planningStages.includes(modal)) modalTrail.push(modal)
        openModal(kind, opener)
    }

    function update(fields, changed, message, canUndo = true) {
        quietProposal = null
        removeActions(['undo', 'apply-quiet', 'cancel-quiet'])
        if (changed !== 'activity') changedStop = ''
        undo = canUndo ? { fields: Object.fromEntries(Object.keys(fields).map(key => [key, trip[key]])), changed } : null
        trip = { ...trip, ...fields }
        if (stage === 'approved') stage = 'ready'
        add('assistant', message, canUndo ? [['undo', 'Undo change']] : [])
        render({ scroll: true, changed })
        if (dialog.open && planningStages.includes(modal)) renderModal()
    }

    function suggestQuiet() {
        if (trip.flight === 'late') {
            add('assistant', 'Saturday already has just hotel check-in after the later flight. I can help you shorten a Sunday stop instead.')
            return render({ scroll: true })
        }
        removeActions(['apply-quiet', 'cancel-quiet'])
        const saturdayKeys = new Set(tripCost(trip).days[0].map(stop => stop.key))
        const stopOverrides = Object.fromEntries(Object.entries(trip.stopOverrides || {}).filter(([key]) => !saturdayKeys.has(key)))
        const next = { quiet: !trip.quiet, stopOrder: { ...trip.stopOrder, 0: [] }, stopOverrides }
        const cost = tripCost({ ...trip, ...next })
        quietProposal = next
        const changes = cost.days[0].map(stop => stop.title + ' (' + stop.duration + ')').join(' and ')
        if (dialog.open) {
            modalTrail.length = 0
            dialog.close()
        }
        add('assistant', `I’d ${next.quiet ? 'make Saturday lighter' : 'restore the original Saturday'} with ${changes}. Flights, Sunday and your stay will stay in the plan. New estimate ${money(cost.total)}.`, [['apply-quiet', 'Apply Saturday edit'], ['cancel-quiet', 'Keep current plan']])
        render({ scroll: true })
    }

    function revealEditedStop(day, order) {
        activeDay = String(day)
        changedStop = 'day-' + day + '-' + order
        mapSelection = changedStop
    }

    function reorderStop(day, order, direction) {
        const stops = tripCost(trip).days[day]
        const next = order + (direction === 'up' ? -1 : 1)
        if (!stops[next]) return
        const keys = stops.map(stop => stop.key)
        keys[order] = stops[next].key
        keys[next] = stops[order].key
        revealEditedStop(day, next)
        update({ stopOrder: { ...trip.stopOrder, [day]: keys } }, 'activity', `Moved ${stops[order].title} ${direction === 'up' ? 'earlier' : 'later'} in the day.`)
        selectStop(changedStop, true)
    }

    function applyOption() {
        if (!compareChoice) return
        const fields = modal === 'stays' ? { stay: compareChoice, unavailable: false } : { flight: compareChoice }
        const cost = tripCost({ ...trip, ...fields })
        const label = modal === 'stays' ? `Stay changed to ${cost.stay.name}. ${cost.stay.note}` : `Flights updated. ${cost.flight.note}`
        update(fields, modal, `${label} The new total is ${money(cost.total)}.`)
        closeModal()
    }

    function showAvailability() {
        if (trip.stay !== 'central' || trip.unavailable) {
            add('assistant', trip.unavailable ? 'Your current stay is unavailable in this scenario. Choose a replacement to keep the rest of your trip.' : 'Your current stay is still available in the simulation.', trip.unavailable ? [['stays', 'Find a replacement']] : [])
            render({ scroll: true })
            if (dialog.open && trip.unavailable) renderModal()
            else if (dialog.open) {
                const note = document.createElement('p')
                note.className = 'tm-budget'
                note.setAttribute('role', 'status')
                note.textContent = 'Your current stay is available in the simulation.'
                dialogBody.querySelector('.tm-modal-actions')?.before(note)
            }
            return
        }
        update({ unavailable: true }, 'stays', `${tripCost(trip).stay.name} is now unavailable in this simulation. Your flights and activities are still in place.`, false)
        if (dialog.open) editOption('stays')
    }

    function submitIntent(raw) {
        const value = raw.trim().slice(0, 600)
        if (!value) return
        const message = value.toLowerCase()
        const city = message.includes('jaipur') ? 'Jaipur' : /bengaluru|bangalore/.test(message) ? 'Bengaluru' : ''
        const budgetMatch = /(?:₹\s*|\brs\.?\s*|\b(?:budget(?:\s+of)?|under|within|max(?:imum)?|total(?:\s+of)?)\s+(?:is\s+)?)([\d,]+(?:\.\d+)?)\s*(k|thousand)?/i.exec(value)
            || /\b(\d+(?:\.\d+)?)\s*(k|thousand)\b/i.exec(value)
        const budget = budgetMatch && Math.round(Number(budgetMatch[1].replaceAll(',', '')) * (budgetMatch[2] ? 1000 : 1))
        const matchPeople = /\b(\d+)\s*(?:travell?ers|people|adults|persons|of us)\b/i.exec(value)
        const perPerson = /per\s+(person|travell?er|adult)/i.test(value)
        const started = stage !== 'start'
        const ready = stage === 'ready' || stage === 'approved'
        if (!started && !matchMedia('(prefers-reduced-motion: reduce)').matches) entryComposer = composer.getBoundingClientRect()
        add('user', value)
        if (stage === 'start') stage = 'clarify'
        const party = Number(matchPeople?.[1] ?? trip.travelers)
        if (party < 1 || party > 8 || (budgetMatch && (budget < 1000 || budget * (perPerson ? party : 1) > 1000000))) {
            add('assistant', 'This demo supports 1–8 travellers and a total budget from ₹1,000 to ₹10,00,000. Which details should I use?', [['preferences', 'Edit trip details']])
            return render({ scroll: true })
        }
        if (matchPeople) trip = { ...trip, travelers: Number(matchPeople[1]), partyFixed: true }
        const mentionedOrigin = /\b(?:from|leaving)\s+(delhi|mumbai)\b/i.exec(value)
        if (!ready && mentionedOrigin) trip.origin = Object.keys(origins).find(origin => origin.toLowerCase() === mentionedOrigin[1].toLowerCase())
        if (budget >= 1000 && budget <= 1000000) trip = { ...trip, budget: budget * (perPerson ? trip.travelers : 1), budgetFixed: true }
        if (!started && /\b(?:this\s+)?weekend\b/i.test(value) && !/next\s+weekend/i.test(value)) trip.datesFixed = true
        if (perPerson && budget >= 1000 && budget <= 1000000) add('assistant', `Using ${money(trip.budget)} for the whole party based on ${money(budget)} per traveller.`)
        if (/next weekend|different dates|change (?:my |the )?dates|\b\d{4}-\d{2}-\d{2}\b/.test(message)) {
            add('assistant', 'Which departure and return dates should I use?', [['preferences', 'Edit trip details']])
            render({ scroll: true })
            return openModal('preferences')
        }
        if (/compare destinations|open to|what else|where can i go|anywhere|other destinations/.test(message)) return compareDestinations()
        if (city && (!ready || city !== trip.city)) return recommend(city)
        if (ready) {
            if (budget || matchPeople) {
                if (stage === 'approved') stage = 'ready'
                const sum = tripCost(trip).total
                add('assistant', `Updated to ${people(trip.travelers)} with a ${money(trip.budget)} total budget. The plan comes to ${money(sum)}.${sum > trip.budget ? ' See the itinerary for ways to bring the cost down.' : ''}`, planActions)
                render({ scroll: true, changed: 'preferences' })
                return
            }
            if (/stay|hotel/.test(message) && /availab|sold out/.test(message)) return showAvailability()
            if (/stay|hotel/.test(message) && /compare|swap|cheaper|change|show/.test(message)) { render({ scroll: true }); return openModal('stays') }
            if (/flight/.test(message) && /later|earlier|compare|change/.test(message)) { render({ scroll: true }); return openModal('flights') }
            if (/quiet|relax|slow down/.test(message)) return perform('quieter')
            if (/undo/.test(message)) return perform('undo')
            if (/review|book/.test(message)) { render({ scroll: true }); return openModal('review') }
            if (/date|travell?er|budget/.test(message)) { render({ scroll: true }); return openModal('preferences') }
            if (/why|reason/.test(message)) return perform('why')
            add('assistant', 'I can compare flights or stays, adjust Saturday, or update your travel dates and budget. What would help?', planActions)
        } else {
            const cue = trip.searchCity
            add('assistant', `I’m using ${trip.origin} as your starting point. ${cue ? 'Should I keep ' + cue + ' as the destination, or compare weekend trips' : 'Would you like me to compare weekend trips'} you can do for ${money(trip.budget)}? That’s the whole-trip budget for ${people(trip.travelers)}.`,
                cue ? [['choose-' + cue, 'Keep ' + cue], ['compare', 'Compare destinations']] : [['compare', 'Compare destinations']])
        }
        render({ scroll: true })
    }

    function perform(id, opener) {
        if (id.startsWith('prompt-')) return submitIntent(examples.find(([key]) => key === id.slice(7))[1])
        if (id.startsWith('map-')) return showOnMap(id.slice(4), opener)
        if (id.startsWith('jump-')) {
            const stop = id.slice(5)
            if (dialog.open) dialog.close()
            requestAnimationFrame(() => selectStop(stop, true))
            return
        }
        if (id.startsWith('day-')) {
            activeDay = id.slice(4)
            mapSelection = ''
            selectStop('')
            return refreshMap()
        }
        if (id.startsWith('move-')) {
            const [, day, order, direction] = id.split('-')
            return reorderStop(Number(day), Number(order), direction)
        }
        if (id.startsWith('replace-')) {
            const [, day, order] = id.split('-')
            replacement = { day: Number(day), order: Number(order) }
            return openModal('stop', opener)
        }
        if (id.startsWith('use-stop-') && replacement) {
            const { day, order } = replacement
            const current = tripCost(trip).days[day][order]
            const option = stopAlternatives(trip.city, current.key).find(item => item.key === id.slice(9))
            if (!option) return
            revealEditedStop(day, order)
            update({ stopOverrides: { ...trip.stopOverrides, [current.key]: option.key } }, 'activity', `Replaced ${current.title} with ${option.title}.`)
            closeModal()
            selectStop(changedStop, true)
            return
        }
        if (id.startsWith('choose-')) {
            const city = id.slice(7)
            add('user', 'Plan the weekend in ' + city)
            return recommend(city)
        }
        if (id.startsWith('preview-')) {
            compareChoice = id.slice(8)
            renderModal()
            dialog.querySelector('[data-action=apply]').focus()
            return
        }
        switch (id) {
            case 'toggle-airport':
                airportVisible = !airportVisible
                if (!airportVisible && mapSelection === 'airport') mapSelection = ''
                return refreshMap()
            case 'compare': return compareDestinations()
            case 'stays':
            case 'flights': return editOption(id, opener)
            case 'review':
                if (modal === 'view') modalTrail.push('view')
                return openModal(stage === 'approved' ? 'approved' : 'review', opener)
            case 'view':
            case 'preferences':
                if (planningStages.includes(modal)) modalTrail.push(modal)
                return openModal(id, opener)
            case 'availability': return showAvailability()
            case 'apply': return applyOption()
            case 'close': return closeModal()
            case 'hide-chat':
                showChat(false)
                input.focus({ preventScroll: true })
                return
            case 'chat':
                modalTrail.length = 0
                return closeModal()
            case 'why':
                add('assistant', planReason() + ' The estimate includes flights, a stay, and activities. Meals and local transport are separate.')
                return render({ scroll: true })
            case 'quieter': return suggestQuiet()
            case 'apply-quiet': {
                if (!quietProposal) return
                const cost = tripCost({ ...trip, ...quietProposal })
                revealEditedStop(0, cost.days[0].length - 1)
                update(quietProposal, 'activity', `Saturday updated. ${cost.days[0].at(-1).title} is on the map. New total ${money(cost.total)}.`)
                selectStop(changedStop, true)
                return
            }
            case 'cancel-quiet':
                if (!quietProposal) return
                quietProposal = null
                removeActions(['apply-quiet', 'cancel-quiet'])
                add('assistant', 'Kept your current Saturday plan.')
                return render({ scroll: true })
            case 'undo':
                if (!undo) {
                    add('assistant', 'There’s no recent change to undo.')
                    return render({ scroll: true })
                }
                return update(undo.fields, undo.changed, `Previous choice restored. Your total is ${money(tripCost({ ...trip, ...undo.fields }).total)}.`, false)
            case 'approve':
                if (trip.unavailable || tripCost(trip).total > trip.budget) return
                stage = 'approved'
                modalTrail.length = 0
                add('assistant', `Approved. Your ${trip.city} trip for ${people(trip.travelers)} is estimated at ${money(tripCost(trip).total)}.`)
                render({ scroll: true })
                return openModal('approved')
            case 'reset':
                trip = initialTrip()
                stage = 'start'
                messages = []
                undo = null
                quietProposal = null
                changedStop = ''
                showChat(false)
                input.value = ''
                render()
                return input.focus()
        }
    }

    root.addEventListener('click', event => {
        const button = event.target.closest('[data-action]')
        if (button) perform(button.dataset.action, button)
    })
    composer.addEventListener('submit', event => {
        event.preventDefault()
        if (!input.value.trim() && (stage === 'ready' || stage === 'approved')) {
            if (root.dataset.chatOpen === 'false') showChat(true)
            add('assistant', 'What would you like to change in this itinerary?', planActions)
            render({ scroll: true })
            return
        }
        submitIntent(input.value)
        input.value = ''
    })
    originContext.addEventListener('change', () => {
        trip.origin = originContext.value
    })
    cityContext.addEventListener('change', () => {
        trip.searchCity = cityContext.value
        trip.city = cityContext.value || 'Bengaluru'
    })
    input.addEventListener('keydown', event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
            event.preventDefault()
            composer.requestSubmit()
        }
    })
    dialog.addEventListener('submit', event => {
        event.preventDefault()
        const values = new FormData(event.target)
        const start = values.get('start')
        const end = values.get('end')
        if (Date.parse(end) - Date.parse(start) !== night || new Date(start).getUTCDay() !== 6) {
            event.target.querySelector('[data-form-error]').textContent = 'Choose a Saturday departure and return the following Sunday.'
            return
        }
        const travelers = Number(values.get('travelers'))
        const budget = Number(values.get('budget'))
        update({ start, end, travelers, budget, datesFixed: true, partyFixed: true, budgetFixed: true }, 'preferences',
            `Updated to ${dateRange({ start, end })}, ${people(travelers)}, with a ${money(budget)} total budget.`, false)
        closeModal()
    })
    dialog.addEventListener('cancel', event => {
        if (!modalTrail.length) return
        event.preventDefault()
        closeModal()
    })
    dialog.addEventListener('close', () => {
        modal = ''
        modalTrail.length = 0
        if (mapPanel.parentElement !== mapDock) mapDock.append(mapPanel)
        const opener = [...root.querySelectorAll('[data-action]')].find(button => button.dataset.action === restoreAction && button.getClientRects().length && !dialog.contains(button))
        const destination = opener || input
        destination.focus({ preventScroll: true })
    })
    showChat(false)
    render()
    const viewport = window.visualViewport
    const syncViewport = () => root.style.setProperty('--tm-viewport', `${Math.round(viewport.height)}px`)
    viewport?.addEventListener('resize', syncViewport)
    if (viewport) syncViewport()
    return () => {
        viewport?.removeEventListener('resize', syncViewport)
        map?.destroy()
    }
}

export default {
    name: 'Travemore',
    mounted() {
        this.disposePlanner = mountPlanner(this.refs.planner)
    },
    beforeDestroy() { this.disposePlanner?.() },
    template() { return `
        <div class="tm" data-stage="start" ref="planner">
            <header class="tm-top"><div class="tm-top-inner">
                <a class="tm-brand" href="/inspiration" aria-label="MakeMyTrip planning home">make<em>my</em>trip</a>
                <span class="tm-product">Travemore</span>
                <nav aria-label="Travemore">${action('reset', 'New trip', 'tm-outline')}</nav>
            </div></header>
            <main class="tm-main">
                <section class="tm-conversation" aria-label="Trip planning conversation">
                    <header class="tm-thread-heading"><div><strong>Travemore</strong><span>Trip planner</span></div><span class="tm-thread-origin">From Delhi</span></header>
                    <div class="tm-intro">
                        <h1>What kind of trip are you thinking?</h1>
                        <p>Tell Travemore what you have in mind. It’ll put flights, a stay, and things to do into one editable plan.</p>
                    </div>
                    <aside class="tm-itinerary" aria-label="Trip itinerary"></aside>
                    <div class="tm-compose-wrap">
                        <div class="tm-view-trip"></div>
                        <div class="tm-mobile-brief"></div>
                        <section class="tm-chat-popover" aria-label="Travemore replies">
                            <div class="tm-chat-header"><strong>Travemore</strong>${action('hide-chat','Hide replies','tm-link')}</div>
                            <div class="tm-messages" role="log" aria-label="Conversation"></div>
                        </section>
                        <div class="tm-entry-box">
                            <form class="tm-composer"><label class="tm-sr" for="tm-intent">Message Travemore</label><textarea id="tm-intent" name="intent" rows="2" maxlength="600" placeholder="A weekend away, a place, or a budget…"></textarea><button class="tm-primary" type="submit" aria-label="Send message"><span class="tm-send-label">Send</span><span aria-hidden="true">↑</span></button></form>
                            <div class="tm-context" role="group" aria-label="Editable demo search context">
                                <span class="tm-context-caption">Demo search</span>
                                <select id="tm-search-origin" aria-label="Departure city"><option value="Delhi">From Delhi</option><option value="Mumbai">From Mumbai</option></select>
                                <select id="tm-search-city" aria-label="Destination from search"><option value="Bengaluru">Bengaluru in your search</option><option value="Jaipur">Jaipur in your search</option><option value="">No destination selected</option></select>
                            </div>
                        </div>
                        <div class="tm-starters">${examples.map(([id, label], index) => `<button type="button" data-action="prompt-${id}" class="${index === 0 ? 'tm-starter-primary' : 'tm-outline'}"><span class="tm-command-icon" aria-hidden="true">${['↗', '⌖', '⌕'][index]}</span><span>${label}</span><span class="tm-command-arrow" aria-hidden="true">↵</span></button>`).join('')}</div>
                    </div>
                </section>
                <div class="tm-map-dock">
                    <section class="tm-map-pane" aria-label="Trip map">
                        <header class="tm-map-heading"><h2>On the map</h2>${action('toggle-airport', 'Airport', 'tm-map-filter')}</header>
                        <div class="tm-map-days" aria-label="Map day filter">
                            <button class="tm-map-filter" data-action="day-all" data-map-day="all" type="button" aria-pressed="true">Both days</button>
                            <button class="tm-map-filter" data-action="day-0" data-map-day="0" type="button" aria-pressed="false">Saturday</button>
                            <button class="tm-map-filter" data-action="day-1" data-map-day="1" type="button" aria-pressed="false">Sunday</button>
                        </div>
                        <div class="tm-map-canvas"></div>
                        <div class="tm-map-detail" role="status"><p>Choose a pin to see how it fits your trip.</p></div>
                    </section>
                </div>
            </main>
            <div class="tm-sr tm-announcer" role="status" aria-atomic="true"></div>
            <dialog class="tm-dialog" aria-labelledby="tm-modal-title"><div class="tm-dialog-body"></div></dialog>
        </div>
    ` },
}
