import { createComponent } from 'tinybubble'
import './style.css'
import IndiaInspiration from './components/IndiaInspiration.tiny.js'
import Travemore from './components/Travemore.tiny.js'
import { indiaGuides } from './indiaGuides.js'

const path = location.pathname.replace(/\/$/, '')
if (path === '/inspiration' && !new URLSearchParams(location.search).has('plan')) {
    document.title = 'Travemore · MakeMyTrip'
    createComponent(Travemore).appendTo(document.getElementById('app'))
} else if (path !== '/inspiration' && !indiaGuides.some(guide => guide.link === path)) {
    location.replace('/inspiration')
} else {
    createComponent(IndiaInspiration).appendTo(document.getElementById('app'))
}
