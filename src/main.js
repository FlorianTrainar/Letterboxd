import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

import { useAuth } from './assets/JS/useAuth'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faStar as faStarSolid,
  faStarHalfStroke,
  faSearch,
  faEye as fasEye,
  faHeart as fasHeart,
  faAlignLeft,
  faCalendar,
  faFilm,
  faUser,
  faBolt,
  faChevronDown,
  faClock as fasClock,
} from '@fortawesome/free-solid-svg-icons'
import {
  faStar as faStarRegular,
  faClock as farClock,
  faEye as farEye,
  faHeart as farHeart,
} from '@fortawesome/free-regular-svg-icons'
import {} from '@fortawesome/free-brands-svg-icons'
library.add(
  faStarSolid,
  faStarRegular,
  faStarHalfStroke,
  faSearch,
  fasEye,
  farEye,
  fasHeart,
  farHeart,
  faAlignLeft,
  faCalendar,
  faFilm,
  faUser,
  faBolt,
  faChevronDown,
  fasClock,
  farClock,
)

const app = createApp(App).component('font-awesome-icon', FontAwesomeIcon)

const { checkAuth } = useAuth()
checkAuth()

const pinia = createPinia()
app.use(pinia)
app.use(router)

app.mount('#app')
