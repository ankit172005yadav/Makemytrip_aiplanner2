import { globals, watch, collectEffects } from 'tinybubble'
import { travel } from '../services/travel.js'
import { router } from '../router.js'
import TripCard from './TripCard.tiny.js'
import AssistantPanel from './AssistantPanel.tiny.js'
import '../dashboard.css'
import '../home.css'
import '../workspace-pages.css'
import '../workspace-theme.css'
import DiscoveryMap from './DiscoveryMap.tiny.js'
import { guides, explorePlaces, lisbonPlaces } from '../discovery.js'
import { workspacePages } from '../workspacePages.js'

const getRailPreference = () => {
    const preference = localStorage.getItem('travelmore-rail')
    return preference === null ? null : preference === 'true'
}
const getSavedGuides = () => {
    try {
        const ids = JSON.parse(localStorage.getItem('travelmore-saved-guides') || '[]')
        return Array.isArray(ids) ? ids : []
    } catch { return [] }
}
const ahmedabad = [23.027, 72.581]
const pageName = () => {
    const route = location.pathname.split('/').filter(Boolean)
    return route[0] === 'inspiration' && route[1] ? 'guide' : route[0] || 'home'
}

export default {
    name: 'TravelDashboard',
    components: { 'trip-card': TripCard, 'assistant-panel': AssistantPanel, 'discovery-map': DiscoveryMap },
    data() { return { page: pageName(), guide: guides.find(item => location.pathname === item.link) || null, guideTab: 'overview', bookedOnly: false, selectedFlights: {}, selectedPlace: null, mapOnly: false, filtersOpen: false, ratedOnly: false, category: 'For you', discoveryQuery: '', savedIds: getSavedGuides(), chatQuery: '', hasChat: false, trips: [], loading: true, error: '', filter: 'all', query: '', createOpen: false, creating: false, assistantOpen: false, railCollapsed: getRailPreference(), menuOpen: false, updatesOpen: false, prototypeOpen: false, starter: null, draft: { title: '', description: '', lat: null, lng: null, address: '', startDate: '', endDate: '' } } },
    template() { return /*html*/`
    <main class="dashboard" :data-page="page" :class="{ 'rail-collapsed': railCollapsed === true, 'rail-expanded': railCollapsed === false, 'chat-drawer-open': menuOpen || updatesOpen }">
        <header class="home-mobile-header"><button type="button" class="nav-openMenu" @click="showPrototype" aria-label="View chats"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h18M3 17h10"></path></svg></button><a class="home-brand" href="/"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.991 5.27c1.466-.272 2.314-1.13 2.555-2.575.152 1.392 1.214 2.397 2.533 2.565-1.45.267-2.303 1.12-2.544 2.58a2.862 2.862 0 0 0-.806-1.732 2.887 2.887 0 0 0-1.738-.838ZM1.318 12.877C7.662 11.699 11.332 7.983 12.374 1.73c.657 6.026 5.256 10.375 10.964 11.1C17.063 13.987 13.37 17.68 12.328 24c-.317-2.877-1.45-5.414-3.488-7.499-2.085-2.084-4.6-3.262-7.522-3.624ZM.66 3.434C2.614 3.07 3.745 1.926 4.066 0c.202 1.857 1.62 3.197 3.378 3.42-1.933.356-3.07 1.494-3.392 3.44-.098-.886-.447-1.667-1.075-2.31C2.335 3.909 1.56 3.547.66 3.435Z"></path></svg> <span>TravelMore</span></a><button type="button" @click="showPrototype" aria-label="Create a trip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.6 7.1V5.8C7.6 4.8 8.4 4 9.4 4h4.2c1 0 1.8.8 1.8 1.8v1.3m-7.8 0H5.8C4.8 7.1 4 7.9 4 8.9v8.3c0 1 .8 1.8 1.8 1.8h5.7M7.6 7.1h9.6c1 0 1.8.8 1.8 1.8v2.9m-1 3.5v5m-2.5-2.5h5"></path></svg></button></header>
        <aside class="home-sidebar" aria-label="Workspace navigation"><div class="home-rail-toggle"><button type="button" @click="toggleRail" aria-label="Toggle sidebar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 5l-7 7 7 7m5-14-7 7 7 7"></path></svg></button></div>
            <a class="home-brand" href="/"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.991 5.27c1.466-.272 2.314-1.13 2.555-2.575.152 1.392 1.214 2.397 2.533 2.565-1.45.267-2.303 1.12-2.544 2.58a2.862 2.862 0 0 0-.806-1.732 2.887 2.887 0 0 0-1.738-.838ZM1.318 12.877C7.662 11.699 11.332 7.983 12.374 1.73c.657 6.026 5.256 10.375 10.964 11.1C17.063 13.987 13.37 17.68 12.328 24c-.317-2.877-1.45-5.414-3.488-7.499-2.085-2.084-4.6-3.262-7.522-3.624ZM.66 3.434C2.614 3.07 3.745 1.926 4.066 0c.202 1.857 1.62 3.197 3.378 3.42-1.933.356-3.07 1.494-3.392 3.44-.098-.886-.447-1.667-1.075-2.31C2.335 3.909 1.56 3.547.66 3.435Z"></path></svg> <span>TravelMore</span></a>
            <nav><button type="button" class="nav-showHome" @click="showHome"><svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.857 12.36a1.14 1.14 0 0 0-.366-.846L12.43 5l-7.063 6.514A1.143 1.143 0 0 0 5 12.36v6.354a1.143 1.143 0 0 0 1.143 1.143h12.571a1.143 1.143 0 0 0 1.143-1.143V12.36Z"></path></svg>Home</button><button type="button" class="nav-openMenu" @click="showPrototype"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.429 5a7.428 7.428 0 0 0-6.183 11.543L5 19.857l4.171-.754A7.429 7.429 0 1 0 12.43 5Z"></path></svg>Chats</button><button type="button" class="nav-showTrips" @click="showTrips"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.62 7.74V6.447a1.81 1.81 0 0 1 1.811-1.81h4.138a1.81 1.81 0 0 1 1.81 1.81V7.74m-7.758 0H5.81c-1 0-1.81.81-1.81 1.81v8.276c0 1 .81 1.81 1.81 1.81H17.19c1 0 1.81-.81 1.81-1.81V9.55c0-1-.81-1.81-1.81-1.81h-1.81m-7.76 0h7.76"></path></svg>Trips</button><button type="button" @click="showPrototype"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.156 15.72L15.711 19.164A2.071 2.071 0 0 1 14.248 19.77H6.308A2.07 2.07 0 0 1 4.238 17.7V6.314A2.07 2.07 0 0 1 6.308 4.244H17.693A2.07 2.07 0 0 1 19.763 6.314V14.254A2.07 2.07 0 0 1 19.156 15.72Z M14.587 19.742V16.665A2.07 2.07 0 0 1 16.657 14.595H19.734 M14.976 9.019L11.118 12.878A0.566 0.566 0 0 1 10.318 12.878L9.025 11.586"></path></svg>Agents</button><button type="button" class="nav-showExplore" @click="showPrototype"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.67 17.342A6.67 6.67 0 1 0 10.67 4a6.67 6.67 0 0 0 0 13.342ZM20 20l-4.615-4.615"></path></svg>Explore</button><button type="button" class="nav-showSaved" @click="showPrototype"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12.006 19.823-7.639-6.827c-4.151-4.097 1.951-11.963 7.639-5.6 5.687-6.363 11.762 1.53 7.638 5.6l-7.638 6.827Z"></path></svg>Saved</button><button type="button" @click="showPrototype"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16.4894 5.67793c1.1903 1.19024 1.859 2.80454 1.859 4.48777v7.3044h-12.6934v-7.3044c0-1.68323.66867-3.29753 1.85891-4.48777 1.19023-1.19023 2.80449-1.8589 4.48779-1.8589 1.6832 0 3.2975.66867 4.4877 1.8589z M10.0017 18.4291c0 .4932.2107.9662.5858 1.315.3751.3487.8838.5447 1.4142.5447s1.0391-.196 1.4142-.5447c.3751-.3488.5858-.8218.5858-1.315"></path></svg>Updates</button><button type="button" class="nav-showInspiration" @click="showInspiration"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21.167a8.357 8.357 0 1 0 0-16.714 8.357 8.357 0 0 0 0 16.714Z m.643-3.857 2.571-7.715L7.5 12.167l3.214 1.928 1.929 3.215Z"></path></svg>Inspiration</button><button type="button" @click="showPrototype"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c-2.33 0-4.766 0-6.798.459-.453.104-.87.365-1.2.752a3.01 3.01 0 0 0-.654 1.422C3 7.541 3 9.3 3 12s0 4.457.348 6.367a3.01 3.01 0 0 0 .654 1.422c.33.387.747.648 1.2.752C7.234 21 9.672 21 11.999 21c2.33 0 4.765 0 6.798-.459.452-.104.87-.365 1.2-.752.33-.387.557-.881.653-1.422.348-1.908.348-3.667.348-6.367s0-4.457-.348-6.367a3.01 3.01 0 0 0-.654-1.422 2.246 2.246 0 0 0-1.2-.752C16.765 3 14.328 3 12 3Z M12 9v5.998M9 12h5.998"></path></svg>Create</button></nav>
            <button class="home-new" type="button" @click="showPrototype">New chat</button>
            <div class="home-sidebar-footer"><span class="home-traveler"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 8a3 3 0 1 0 6 0 3 3 0 0 0-6 0Zm-3 10a6 6 0 0 1 12 0Z"></path></svg></span> Traveler <span class="dashboard-status" :class="{ online: online() }" :title="online() ? 'Connected' : 'Offline'"></span></div>
        </aside>
        <section x-if="page === 'home'" class="dashboard-main" ref="home">
            <div class="home-shortcuts" aria-label="Planning shortcuts"><button type="button" @click="showPrototype"><span class="shortcut-stays"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 11.188h13.875a1.5 1.5 0 0 1 1.5 1.5v3.562H4v-3.563a1.5 1.5 0 0 1 1.5-1.5ZM4 16.25v2.25M20.875 16.25v2.25 M19.188 11.188V6.125A1.125 1.125 0 0 0 18.063 5H6.813a1.125 1.125 0 0 0-1.125 1.125v5.063 M9.813 8.375h5.25a.75.75 0 0 1 .75.75v2.063h-6.75V9.124a.75.75 0 0 1 .75-.75Z"></path></svg></span>Stays</button><button type="button" @click="showPrototype"><span class="shortcut-flights"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.786 5.929h2.3a.7.7 0 0 1 .685.542L7.5 9.33 14.643 7.9a5.271 5.271 0 0 1 6.286 5.129 1.429 1.429 0 0 1-1.429 1.428h-6.286l-1.428 2.257a2.855 2.855 0 0 1-2.4 1.315H7.814a.716.716 0 0 1-.628-1.043L8.443 14.5H4.5a1.429 1.429 0 0 1-1.429-1.429V6.643a.714.714 0 0 1 .715-.714Z"></path></svg></span>Flights</button><button type="button" @click="showPrototype"><span class="shortcut-eats"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.629 11.357c1.704 0 3.085-1.727 3.085-3.857s-1.381-3.857-3.085-3.857c-1.705 0-3.086 1.727-3.086 3.857s1.381 3.857 3.086 3.857Zm0 0v9M7.5 3.643v16.714m3.214-16.714v3.214a3.215 3.215 0 1 1-6.428 0V3.643"></path></svg></span>Eats</button><button type="button" @click="showPrototype"><span class="shortcut-experiences"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 13c0-2.7-.1-5.2-.4-7.75M12 13c1-2.3 2.35-3.85 4.5-4.75M12 13c-2.15-.8-5.25-.7-7.5.1M12 13c-2.1 0-3.5 1.7-4.5 3.9M12 13c2.25-1.2 4.3-1 6.55-.2M12 13c-1.1 1.5-1.7 3.3-1.5 5M12 13l4.1 3.9M8.6 4.1v1.5m-.75-.75h1.5M4.1 7.6v1.5m-.75-.75h1.5M13.9 17.8v1.5m-.75-.75h1.5M19.6 5.6v1.5m-.75-.75h1.5M5.4 15.6v1.5m-.75-.75h1.5"></path></svg></span>Experiences</button><button type="button" @click="showPrototype"><span class="shortcut-events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.048 6.01V8.12m0 2.844v2.108m0 2.855v2.108M4.5 16.75a1.286 1.286 0 0 0 1.286 1.285h13.099a1.286 1.286 0 0 0 1.285-1.285v-2.366a2.452 2.452 0 0 1 0-4.732V7.286A1.286 1.286 0 0 0 18.885 6h-13.1A1.286 1.286 0 0 0 4.5 7.286v2.36a2.452 2.452 0 0 1 0 4.742v2.36Z"></path></svg></span>Events</button><button type="button" @click="showTrips"><span class="shortcut-newtrip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.62 7.103V5.81A1.81 1.81 0 0 1 9.432 4h4.138a1.81 1.81 0 0 1 1.81 1.81v1.293m-7.758 0H5.81c-1 0-1.811.811-1.811 1.81v8.277c0 1 .81 1.81 1.81 1.81h5.69M7.62 7.103h7.76m0 0h1.81c1 0 1.81.811 1.81 1.81v2.87M18.16 15.45v5M15.66 17.95h5"></path></svg></span>Trips</button></div>
            <section class="home-intro" aria-labelledby="home-title">
                <span class="home-spark"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.991 5.27c1.466-.272 2.314-1.13 2.555-2.575.152 1.392 1.214 2.397 2.533 2.565-1.45.267-2.303 1.12-2.544 2.58a2.862 2.862 0 0 0-.806-1.732 2.887 2.887 0 0 0-1.738-.838ZM1.318 12.877C7.662 11.699 11.332 7.983 12.374 1.73c.657 6.026 5.256 10.375 10.964 11.1C17.063 13.987 13.37 17.68 12.328 24c-.317-2.877-1.45-5.414-3.488-7.499-2.085-2.084-4.6-3.262-7.522-3.624ZM.66 3.434C2.614 3.07 3.745 1.926 4.066 0c.202 1.857 1.62 3.197 3.378 3.42-1.933.356-3.07 1.494-3.392 3.44-.098-.886-.447-1.667-1.075-2.31C2.335 3.909 1.56 3.547.66 3.435Z"></path></svg></span>
                <h1 id="home-title">Hey there, I’m your personal travel assistant. Help me learn how you like to travel, and I’ll put that to work for you.</h1>
                <button type="button" class="home-primary" @click="showPrototype">Set up my assistant</button>
            </section>
            <section class="home-cards" aria-label="Ways to get started"><button type="button" class="home-card home-card-assistant" @click="showPrototype"><img alt="" src="/mindtrip-reference/assistant.png"><strong>Set up my assistant</strong></button><button type="button" class="home-card home-card-trip" @click="openCreate" :disabled="!online()"><img alt="" src="/mindtrip-reference/trip.png"><strong>Plan a trip</strong></button><button type="button" class="home-card home-card-recs" @click="showPrototype"><img alt="" src="/mindtrip-reference/recs.png"><strong>Get local<br>recommendations</strong></button><button type="button" class="home-card home-card-receipt" @click="showPrototype"><img alt="" src="/mindtrip-reference/receipt.png"><strong>Organize a<br>booking receipt</strong></button></section>
            <section class="home-agents" ref="tools" aria-labelledby="tools-title">
                <div><h2 id="tools-title">More things I can do for you</h2><p>Get help with the details of your trip.</p></div>
                <div class="home-agent-options">
                    <button type="button" @click="showPrototype">✈️ Compare flight options</button>
                    <button type="button" @click="showPrototype">🍜 Find new restaurants</button>
                    <button type="button" @click="showPrototype">💎 Find local gems</button>
                    <button type="button" class="home-new" @click="showPrototype">Put me to work</button>
                </div>
            </section>
            <section class="home-library" ref="library" aria-labelledby="trips-title">
                <header class="dashboard-intro"><div><h2 id="trips-title">Your trips</h2><p>{{ summaryLine() }}</p></div><label class="dashboard-search"><span aria-hidden="true">⌕</span><input ref="search" x-model="query" placeholder="Search trips" aria-label="Search trips and stops" /></label></header>
                <nav class="dashboard-filters" aria-label="Trip filters"><button type="button" :class="{ active: filter === 'all' }" @click="setFilter('all')">All trips</button><button type="button" :class="{ active: filter === 'upcoming' }" @click="setFilter('upcoming')">Upcoming</button><button type="button" :class="{ active: filter === 'past' }" @click="setFilter('past')">Past</button><button type="button" :class="{ active: filter === 'undated' }" @click="setFilter('undated')">Undated</button></nav>
                <div x-if="error" class="app-error dashboard-error" role="alert"><span>{{ error }}</span><button type="button" @click="clearError" aria-label="Dismiss error">×</button></div><section class="trip-grid" :aria-busy="loading"><div x-if="loading" x-for="item in skeletons()" :key="item" class="dashboard-skeleton"></div><template x-if="!loading && !trips.length"><div class="dashboard-empty"><h2>Start with a journey in mind.</h2><p>Name your trip, then layer in stops, places, and practical details.</p><label class="dashboard-trip-name">Trip name<input x-model="draft.title" placeholder="e.g. A week in Kyoto" :disabled="!online()" /></label><button class="dashboard-new" type="button" @click="openCreate(true)" :disabled="!draft.title.trim() || !online()">Create trip</button></div></template><template x-if="!loading && trips.length"><trip-card x-for="trip in visibleTrips()" :key="trip.id" :trip="trip" :disabled="!online()" @open="openTrip" @add-stop="addStop" @delete="deleteTrip"></trip-card><p x-if="!visibleTrips().length" class="dashboard-filter-empty">{{ emptyFilterMessage() }}</p><button type="button" class="new-trip-card" @click="openCreate" :disabled="!online()"><div><span>＋</span><strong>New trip</strong><small>Name your trip</small></div></button></template></section>
            </section>
        </section>
        ${workspacePages}
        <section x-if="page === 'home'" class="home-chat" :class="{ expanded: assistantOpen }" aria-label="Assistant">
            <button type="button" class="home-chat-expand" @click="showPrototype" aria-label="Assistant"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.25" y="9.75" width="1.5" height="4.5" rx=".75" fill="currentColor"></rect><rect x="6.45" y="5.75" width="1.5" height="12.5" rx=".75" fill="currentColor"></rect><rect x="9.65" y="2.25" width="1.5" height="19.5" rx=".75" fill="currentColor"></rect><rect x="12.85" y="7.75" width="1.5" height="8.5" rx=".75" fill="currentColor"></rect><rect x="16.05" y="4.75" width="1.5" height="14.5" rx=".75" fill="currentColor"></rect><rect x="19.25" y="9.75" width="1.5" height="4.5" rx=".75" fill="currentColor"></rect></svg></button>
            <button type="button" class="prototype-composer" @click="showPrototype">Ask TravelMore…</button>
        </section>
        <nav class="home-mobile-nav" aria-label="Mobile workspace navigation"><button type="button" class="nav-showHome" @click="showHome"><svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.857 12.36a1.14 1.14 0 0 0-.366-.846L12.43 5l-7.063 6.514A1.143 1.143 0 0 0 5 12.36v6.354a1.143 1.143 0 0 0 1.143 1.143h12.571a1.143 1.143 0 0 0 1.143-1.143V12.36Z"></path></svg>Home</button><button type="button" class="nav-openMenu" @click="showPrototype"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.429 5a7.428 7.428 0 0 0-6.183 11.543L5 19.857l4.171-.754A7.429 7.429 0 1 0 12.43 5Z"></path></svg>Chat</button><button type="button" class="nav-showTrips" @click="showTrips"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.62 7.74V6.447a1.81 1.81 0 0 1 1.811-1.81h4.138a1.81 1.81 0 0 1 1.81 1.81V7.74m-7.758 0H5.81c-1 0-1.81.81-1.81 1.81v8.276c0 1 .81 1.81 1.81 1.81H17.19c1 0 1.81-.81 1.81-1.81V9.55c0-1-.81-1.81-1.81-1.81h-1.81m-7.76 0h7.76"></path></svg>Trips</button><button type="button" @click="showPrototype"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.156 15.72L15.711 19.164A2.071 2.071 0 0 1 14.248 19.77H6.308A2.07 2.07 0 0 1 4.238 17.7V6.314A2.07 2.07 0 0 1 6.308 4.244H17.693A2.07 2.07 0 0 1 19.763 6.314V14.254A2.07 2.07 0 0 1 19.156 15.72Z M14.587 19.742V16.665A2.07 2.07 0 0 1 16.657 14.595H19.734 M14.976 9.019L11.118 12.878A0.566 0.566 0 0 1 10.318 12.878L9.025 11.586"></path></svg>Agents</button><button type="button" @click="showPrototype"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.67 17.342A6.67 6.67 0 1 0 10.67 4a6.67 6.67 0 0 0 0 13.342ZM20 20l-4.615-4.615"></path></svg>Explore</button><button type="button" @click="showPrototype"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 8a3 3 0 1 0 6 0 3 3 0 0 0-6 0Zm-3 10a6 6 0 0 1 12 0Z"></path></svg> Setup</button></nav>
        <button x-if="menuOpen" class="home-menu-backdrop" type="button" @click="closeMenu" aria-label="Close chat menu"></button>
        <aside x-if="menuOpen" class="home-mobile-sheet" role="dialog" aria-modal="true" aria-label="Chat menu">
            <button type="button" class="home-menu-handle" @click="closeMenu" aria-label="Close chat menu"></button>
            <label class="workspace-search chat-search"><input x-model="chatQuery" placeholder="Search..." aria-label="Search chats"></label>
            <button type="button" @click="menuAssistant">New chat</button>
            <button type="button" @click="menuTrip" :disabled="!online()">New trip</button>
            <button type="button" @click="menuAssistant">Set up my assistant</button>
            <p>Chats</p>
            <button x-if="hasChat && matchesChat()" type="button" @click="menuAssistant">Workspace chat</button>
            <p x-if="!hasChat">No chats yet.</p>
            <p x-if="hasChat && !matchesChat()">No matching chats.</p>
        </aside>
        <button x-if="updatesOpen" class="home-menu-backdrop" type="button" @click="closeUpdates" aria-label="Close updates"></button>
        <aside x-if="updatesOpen" class="home-mobile-sheet updates-drawer" aria-label="Updates">
            <header><h2>Updates</h2><button type="button" @click="closeUpdates" aria-label="Close updates">×</button></header>
            <p x-if="!tripsNeedingAttention().length">No updates yet.</p>
            <button x-for="trip in tripsNeedingAttention()" :key="trip.id" type="button" class="update-item" @click="openTrip(trip)"><strong>{{ trip.title }}</strong><small>{{ trip.stats.openTodos }} open tasks</small></button>
        </aside>
        <div x-if="prototypeOpen" class="sheet-backdrop" @click.self="closePrototype">
            <section class="dashboard-sheet prototype-notice" role="dialog" aria-modal="true" aria-labelledby="prototype-title">
                <h2 id="prototype-title">Only for prototype purpose</h2>
                <button type="button" class="home-primary" @click="closePrototype" autofocus>OK</button>
            </section>
        </div>
        <button x-if="assistantOpen" type="button" class="home-scrim" @click="closeAssistant" aria-label="Close assistant"></button>
        <div x-if="createOpen" class="sheet-backdrop"><section class="create-sheet dashboard-sheet" role="dialog" aria-modal="true" aria-label="Create a new trip"><header><div><span class="trip-dialog-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.62 7.103V5.81A1.81 1.81 0 0 1 9.432 4h4.138a1.81 1.81 0 0 1 1.81 1.81v1.293m-7.758 0H5.81c-1 0-1.811.811-1.811 1.81v8.277c0 1 .81 1.81 1.81 1.81h5.69M7.62 7.103h7.76m0 0h1.81c1 0 1.81.811 1.81 1.81v2.87M18.16 15.45v5M15.66 17.95h5"></path></svg></span><h2>Create a trip</h2></div><button type="button" class="round-button" @click="closeCreate" aria-label="Close">×</button></header><form @submit-prevent="createTrip"><label>Trip name<input ref="tripName" x-model="draft.title" :disabled="creating" autofocus required placeholder="e.g. A week in Kyoto" /></label><div class="dashboard-date-grid"><label>Start<input type="date" x-model="draft.startDate" :disabled="creating" /></label><label>End<input type="date" x-model="draft.endDate" :disabled="creating" /></label></div><label>Note<textarea x-model="draft.description" rows="3" :disabled="creating" placeholder="A short intention for this trip"></textarea></label><div class="sheet-actions"><button type="button" class="button-secondary" @click="closeCreate" :disabled="creating">Cancel</button><button type="submit" class="button-primary" :disabled="creating || !draft.title.trim()">{{ creating ? 'Creating…' : 'Create trip' }}</button></div></form></section></div>
    </main>` },
    async mounted() { this.alive = true; this.keydown = event => this.onKeydown(event); window.addEventListener('keydown', this.keydown); this.disposers = collectEffects(() => watch(globals.$rpcStatus, status => { if (status === 'online') void this.load() })); if (this.online()) await this.load(); else this.data.loading.value = false },
    beforeDestroy() { this.alive = false; window.removeEventListener('keydown', this.keydown); this.disposers?.forEach(dispose => dispose()) },
    online() { return globals.$rpcStatus.value === 'online' },
    async load() { this.data.loading.value = true; try { const response = await travel.listTrips(); if (this.alive) this.data.trips.value = response.trips || []; if (['trips','bookings'].includes(this.data.page.value)) { const bookings = await Promise.allSettled((response.trips || []).map(async trip => [trip.id, (await travel.listFlightSearches({ tripId: trip.id })).candidates.some(candidate => candidate.selected)])); if (this.alive) this.data.selectedFlights.value = Object.fromEntries(bookings.filter(result => result.status === 'fulfilled').map(result => result.value)) } } catch (error) { if (this.alive) this.data.error.value = error.message } finally { if (this.alive) this.data.loading.value = false } },
    skeletons() { return [1, 2, 3, 4] }, clearError() { this.data.error.value = '' },
    summaryLine() { const trips = this.data.trips.value, dated = trips.filter(trip => trip.startDate || trip.endDate).length; return `${trips.length} trip${trips.length === 1 ? '' : 's'} · ${dated} with date${dated === 1 ? '' : 's'}` },
    setFilter(filter) { this.data.filter.value = filter },
    visibleTrips() { const query = this.data.query.value.trim().toLocaleLowerCase(), today = new Date().toISOString().slice(0, 10); return this.data.trips.value.filter(trip => { const start = trip.startDate?.slice(0, 10), end = trip.endDate?.slice(0, 10), matches = !query || `${trip.title || ''} ${trip.address || ''} ${(trip.stats?.stopNames || []).join(' ')}`.toLocaleLowerCase().includes(query); if (!matches || (this.data.bookedOnly.value && !this.data.selectedFlights.value[trip.id])) return false; if (this.data.filter.value === 'undated') return !start && !end; if (this.data.filter.value === 'upcoming') return !!start && start >= today; if (this.data.filter.value === 'past') return !!end && end < today; return true }) },
    emptyFilterMessage() { return this.data.filter.value === 'past' ? 'No past trips yet.' : this.data.filter.value === 'upcoming' ? 'No upcoming trips yet.' : this.data.filter.value === 'undated' ? 'No undated trips yet.' : 'No trips match this search.' },
    openTrip(trip) { router.navigate(`/trips/${encodeURIComponent(trip.id)}`) }, addStop(trip) { router.navigate(`/trips/${encodeURIComponent(trip.id)}?new=stop`) },

    async deleteTrip(trip) { if (!this.online()) return; try { await travel.deleteNode({ id: trip.id }); await this.load() } catch (error) { this.data.error.value = error.message } },
    showPrototype() { this.data.prototypeOpen.value = true },
    closePrototype() { this.data.prototypeOpen.value = false },
    showHome() { if (this.data.page.value !== 'home') location.assign('/'); else scrollTo(0, 0) },
    showTrips() { location.assign('/trips') },
    showExplore() { location.assign('/explore') },
    showSaved() { location.assign('/saved') },
    showInspiration() { location.assign('/inspiration') },
    toggleRail() { const collapsed = this.data.railCollapsed.value ?? (this.data.page.value === "home" && window.matchMedia("(min-width: 1550px)").matches); this.data.railCollapsed.value = !collapsed; localStorage.setItem("travelmore-rail", String(!collapsed)) },
    async openMenu() {
        this.closeUpdates()
        this.closeAssistant()
        this.data.menuOpen.value = !this.data.menuOpen.value
        if (this.data.menuOpen.value && this.online()) {
            try { const chat = await travel.getChat('workspace'); if (this.alive) this.data.hasChat.value = Boolean(chat.entries?.length) }
            catch { /* The chat drawer remains usable while chat history is unavailable. */ }
        }
    },
    matchesChat() { return 'workspace chat'.includes(this.data.chatQuery.value.trim().toLowerCase()) },
    saved(id) { return this.data.savedIds.value.includes(id) },
    toggleSave(id) {
        const next = this.saved(id) ? this.data.savedIds.value.filter(item => item !== id) : [...this.data.savedIds.value, id]
        this.data.savedIds.value = next
        localStorage.setItem('travelmore-saved-guides', JSON.stringify(next))
    },
    visibleGuides() {
        const query = this.data.discoveryQuery.value.trim().toLowerCase()
        return guides.filter(item => (this.data.page.value !== 'saved' || this.saved(item.id)) &&
            [item.title, item.author, item.location].some(value => value.toLowerCase().includes(query)))
    },
    allExplorePlaces() { return explorePlaces },
    exploreCenter() { return ahmedabad },
    categories() { return ['For you', 'Experiences', 'Restaurants', 'Stays', 'Locations'] },
    setCategory(category) { this.data.category.value = category },
    toggleMap() { this.data.mapOnly.value = !this.data.mapOnly.value },
    toggleFilters() { this.data.filtersOpen.value = !this.data.filtersOpen.value },
    visiblePlaces() {
        const category = this.data.category.value
        const query = this.data.discoveryQuery.value.trim().toLowerCase()
        return explorePlaces.filter(place => (!query || place.title.toLowerCase().includes(query)) &&
            (category === 'For you' || place.category === category) && (!this.data.ratedOnly.value || place.rating))
    },
    selectPlace(place) {
        this.data.selectedPlace.value = { ...place }
        if (window.matchMedia('(max-width: 700px)').matches && this.data.page.value === 'explore') this.data.mapOnly.value = true
    },
    guideCenter() { const guide = this.data.guide.value; return [guide.lat, guide.lng] },
    guidePlaces() {
        const guide = this.data.guide.value
        return guide.id === 'in-L3d715dZ' ? lisbonPlaces.map((place, id) => ({ ...place, id })) : [{ id: guide.id, title: guide.location, lat: guide.lat, lng: guide.lng }]
    },
    showOverview() { this.data.guideTab.value = 'overview' },
    showPlaces() { this.data.guideTab.value = 'places' },
    planGuide(guide) {
        this.openCreate()
        this.data.draft.value = { ...this.data.draft.value, title: guide.location, description: guide.source, lat: guide.lat, lng: guide.lng, address: guide.location }
    },
    bookedTrips() { return this.data.trips.value.filter(trip => this.data.selectedFlights.value[trip.id]) },
    datedTrips() { return this.data.trips.value.filter(trip => trip.startDate || trip.endDate).sort((a,b) => (a.startDate || a.endDate).localeCompare(b.startDate || b.endDate)) },
    closeMenu() { this.data.menuOpen.value = false },
    menuAssistant() { this.closeMenu(); this.openAssistant() },
    menuTrip() { this.closeMenu(); this.openCreate() },
    openAssistant() { this.closeMenu(); this.closeUpdates(); this.data.assistantOpen.value = true },
    closeAssistant() { this.data.assistantOpen.value = false },
    toggleAssistant() { this.data.assistantOpen.value = !this.data.assistantOpen.value },
    showTools() { this.refs.tools?.scrollIntoView() },
    onChatFocus(event) { if (event.target instanceof HTMLTextAreaElement) this.openAssistant() },
    suggestEvents() { this.startPrompt('Help me find events in ') },
    toggleUpdates() {
        this.closeMenu()
        this.closeAssistant()
        this.data.updatesOpen.value = !this.data.updatesOpen.value
    },
    closeUpdates() { this.data.updatesOpen.value = false },
    tripsNeedingAttention() {
        const today = new Date().toISOString().slice(0, 10)
        return this.data.trips.value.filter(trip => trip.stats?.openTodos > 0 && (!trip.endDate || trip.endDate >= today))
    },
    suggestInspiration() { this.startPrompt('Suggest destinations for my next trip.') },
    suggestReceipt() { this.startPrompt('Help me organize these booking details: ') },
    startPrompt(text) {
        this.openAssistant()
        this.data.starter.value = { text }
    },
    suggestStays() { this.startPrompt('Help me find a place to stay in ') },
    suggestFlights() { this.startPrompt('Help me compare flight options from ') },
    suggestFood() { this.startPrompt('Help me find places to eat in ') },
    suggestActivities() { this.startPrompt('Help me find things to do in ') },
    openCreate(preserve = false) { if (!preserve) this.data.draft.value = { title: '', description: '', lat: null, lng: null, address: '', startDate: '', endDate: '' }; this.data.createOpen.value = true }, closeCreate() { if (!this.data.creating.value) this.data.createOpen.value = false },
    async createTrip() { const draft = this.data.draft.value; if (!draft.title.trim()) return; this.data.creating.value = true; try { const result = await travel.createNode({ parentId: null, type: 'trip', title: draft.title.trim(), startDate: draft.startDate || null, endDate: draft.endDate || null, description: draft.description || '', lat: draft.lat, lng: draft.lng, address: draft.address || null }); router.navigate(`/trips/${result.node.id}`) } catch (error) { this.data.error.value = error.message } finally { if (this.alive) this.data.creating.value = false } },
    onKeydown(event) { const target = event.target, editing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement; if (event.key === 'Escape') { if (this.data.prototypeOpen.value) this.closePrototype(); else if (this.data.createOpen.value) this.closeCreate(); else if (this.data.menuOpen.value) this.closeMenu(); else if (this.data.updatesOpen.value) this.closeUpdates(); else if (this.data.assistantOpen.value) this.closeAssistant(); else if (this.data.query.value) this.data.query.value = ''; return } if (editing) return; if (event.key === 'n') { event.preventDefault(); if (this.online()) this.openCreate() } if (event.key === '/') { event.preventDefault(); this.refs.library?.scrollIntoView({ block: 'start' }); this.refs.search?.focus() } },
}
