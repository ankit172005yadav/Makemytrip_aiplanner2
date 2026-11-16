export const workspacePages = /*html*/`
<section x-if="page === 'explore' || page === 'saved'" class="workspace-page"><h1>Only for prototype purpose</h1><nav class="workspace-tabs" aria-label="Available pages"><a href="/inspiration">Inspiration</a><a href="/trips">My Trips</a></nav></section>
<section x-if="page === 'trips' || page === 'bookings' || page === 'calendar'" class="workspace-page trips-page">
    <header class="workspace-page-heading"><h1>Your trips</h1><button class="home-primary" type="button" @click="openCreate" :disabled="!online()">＋ New trip</button></header>
    <nav class="workspace-tabs" aria-label="Trips views">
        <a href="/trips" :class="{ current: page === 'trips' }">Trips</a><a href="/bookings" :class="{ current: page === 'bookings' }">Bookings</a><a href="/calendar" :class="{ current: page === 'calendar' }">Calendar</a>
    </nav>
    <div x-if="page === 'trips'" class="workspace-trip-controls">
        <label><input type="checkbox" role="switch" x-model="bookedOnly"> <span>Booked only</span></label>
        <select x-model="filter" aria-label="Trip view"><option value="all">All</option><option value="upcoming">Upcoming</option><option value="past">Past</option><option value="undated">Undated</option></select>
    </div>
    <p x-if="error" role="alert">{{ error }}</p>
    <p x-if="loading" role="status">Loading trips…</p>
    <section x-if="!loading && page === 'trips'">
        <section x-if="visibleTrips().length" class="trip-grid"><trip-card x-for="trip in visibleTrips()" :key="trip.id" :trip="trip" :disabled="!online()" @open="openTrip" @add-stop="addStop" @delete="deleteTrip"></trip-card></section>
        <div x-if="!visibleTrips().length" class="workspace-empty"><img src="/mindtrip-reference/recs.png" alt=""><h2>{{ trips.length ? 'No trips match these filters.' : 'No trips yet? No problem.' }}</h2><p x-if="!trips.length">Create one now — access your plans from here anytime.</p><button class="home-primary" type="button" @click="openCreate" :disabled="!online()">Create a trip</button></div>
    </section>
    <section x-if="!loading && page === 'bookings'" class="workspace-dated"><h2>Selected flights</h2><p x-if="!bookedTrips().length">You haven’t selected any flights in your trips.</p><button x-for="trip in bookedTrips()" :key="trip.id" type="button" @click="openTrip(trip)">{{ trip.title }}</button></section>
    <section x-if="!loading && page === 'calendar'" class="workspace-dated"><h2>Dated trips</h2><p x-if="!datedTrips().length">Add dates to a trip to see it here.</p><button x-for="trip in datedTrips()" :key="trip.id" type="button" @click="openTrip(trip)">{{ trip.title }} <small>{{ trip.startDate || trip.endDate }}</small></button></section>
</section>

<section x-if="page === 'inspiration'" class="workspace-page inspiration-page">
    <h1>{{ page === 'saved' ? 'Saved' : 'Inspiration' }}</h1>
    <label class="workspace-search"><input x-model="discoveryQuery" placeholder="Search for location or handle" aria-label="Search for location or handle"><span aria-hidden="true">⌕</span></label>
    <h2>{{ page === 'saved' ? 'Saved guides' : 'Featured guides' }}</h2>
    <p x-if="!visibleGuides().length">No matching guides.</p>
    <div class="inspiration-grid">
        <article class="inspiration-card" x-for="item in visibleGuides()" :key="item.id">
            <div class="discovery-cover"><a :href="item.link" :aria-label="item.title"><img :src="item.cover" alt="" loading="lazy"></a>
                <span class="discovery-count">{{ item.count }} places</span>
                <div class="discovery-actions"><button type="button" :aria-label="saved(item.id) ? 'Remove saved guide' : 'Save guide'" :aria-pressed="saved(item.id)" @click="toggleSave(item.id)">{{ saved(item.id) ? '♥' : '♡' }}</button><button type="button" aria-label="Plan a trip from guide" @click="planGuide(item)" :disabled="!online()">＋</button></div>
            </div>
            <a class="discovery-title" :href="item.link">{{ item.title }}</a><p>{{ item.location }}</p><p>{{ item.author }}</p>
        </article>
    </div>
</section>

<section x-if="page === 'guide' && guide" class="guide-page">
    <article class="guide-content">
        <header class="guide-hero" :style="{ backgroundImage: 'linear-gradient(transparent 25%, #121212), url('+guide.cover+')' }">
            <div class="guide-toolbar"><a href="/inspiration" aria-label="Back to Inspiration">‹</a><div><button type="button" @click="toggleSave(guide.id)">{{ saved(guide.id) ? '♥ Saved' : '♡ Save' }}</button><button type="button" @click="planGuide(guide)" :disabled="!online()">＋ Plan a trip</button></div></div>
            <div class="guide-heading"><h1>{{ guide.title }}</h1><p>{{ guide.author }} · {{ guide.count }} places in the original guide</p><p>{{ guide.location }}</p><button class="home-primary" type="button" @click="planGuide(guide)" :disabled="!online()">Plan a trip</button></div>
        </header>
        <div class="guide-body">
            <nav class="workspace-tabs" aria-label="Guide views"><button type="button" :class="{current: guideTab === 'overview'}" @click="showOverview">Overview</button><button type="button" :class="{current: guideTab === 'places'}" @click="showPlaces">Places</button></nav>
            <div x-if="guideTab === 'overview'"><p>Explore {{ guide.location }} with this guide by {{ guide.author }}.</p><a :href="guide.source" target="_blank" rel="noopener">Read the full guide on Mindtrip ↗</a></div>
            <div x-if="guideTab === 'places'"><h2>Places and experiences</h2><button class="guide-place" x-for="place in guidePlaces()" :key="place.title" type="button" @click="selectPlace(place)">{{ place.title }}</button><a :href="guide.source" target="_blank" rel="noopener">See all {{ guide.count }} places on Mindtrip ↗</a></div>
        </div>
    </article>
    <discovery-map :places="guidePlaces()" :center="guideCenter()" :selected="selectedPlace"></discovery-map>
</section>
`;
