import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useAuth } from './assets/JS/useAuth'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faStar as faStarSolid,
  faStarHalfStroke,
  faSearch,
  faEye,
  faHeart,
  faAlignLeft,
  faCalendar,
  faFilm,
  faUser,
  faBolt,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons'
import {} from '@fortawesome/free-brands-svg-icons'
library.add(
  faStarSolid,
  faStarRegular,
  faStarHalfStroke,
  faSearch,
  faEye,
  faHeart,
  faAlignLeft,
  faCalendar,
  faFilm,
  faUser,
  faBolt,
  faChevronDown,
)

const app = createApp(App).component('font-awesome-icon', FontAwesomeIcon)

const { checkAuth } = useAuth()
checkAuth()

app.use(router)

app.mount('#app')
