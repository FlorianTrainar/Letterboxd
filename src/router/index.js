import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MovieView from '@/views/MovieView.vue'
import ProfileView from '@/views/ProfileView.vue'
import SearchView from '@/views/SearchView.vue'
import PersonView from '@/views/PersonView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/movie/:id',
      name: 'movie',
      component: MovieView,
      props: true,
    },
    {
      path: '/profile/:id',
      name: 'profile',
      component: ProfileView,
      props: true,
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView,
      props: true,
    },

    {
      path: '/person/:id',
      name: 'person',
      component: PersonView,
      props: true,
    },
  ],
})

export default router
