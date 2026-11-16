import { createRouter } from 'tinybubble'
import Workspace from './components/App.tiny.js'
import Dashboard from './components/Dashboard.tiny.js'

/** Browser history is the source of truth for the active trip. */
export const router = createRouter({
    mode: 'history',
    base: '/',
    routes: [
        { path: '/', component: Dashboard },
        { path: '/home', component: Dashboard },
        { path: '/trips', component: Dashboard },
        { path: '/bookings', component: Dashboard },
        { path: '/calendar', component: Dashboard },
        { path: '/explore', component: Dashboard },
        { path: '/inspiration', component: Dashboard },
        { path: '/inspiration/:slug/:guideId', component: Dashboard },
        { path: '/saved', component: Dashboard },
        { path: '/trips/:id', component: Workspace },
    ],
})
