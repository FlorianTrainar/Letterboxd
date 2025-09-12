<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import CoverPart from '@/components/CoverPart.vue'
import toolsSection from '@/components/toolsSection.vue'
import SignupPart from '@/components/SignupPart.vue'

import { useAuth } from '@/assets/JS/useAuth'

const { loggedIn, user } = useAuth()

const showSignupForm = ref(false)

const movieList = ref([])

const apiKey = import.meta.env.VITE_TMDB_API_KEY
const randomPage = Math.floor(Math.random() * 25) + 1

onMounted(async () => {
  try {
    const { data } = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
      params: {
        api_key: apiKey,
        language: 'fr-FR',
        sort_by: 'vote_average.desc',
        'vote_count.gte': 5000,
        include_adult: false,
        page: randomPage,
      },
    })

    // Mélange des films
    const shuffled = data.results.sort(() => 0.5 - Math.random())
    movieList.value = shuffled.slice(0, 6)

    // console.log('Data >>>', data)

    movieList.value = data.results.slice(0, 24)
    // console.log(movieList.value)
  } catch (error) {
    console.log('catch >>>', error)
  }
})
</script>
<template>
  <main>
    <div v-if="loggedIn" class="headerBackground"></div>

    <CoverPart v-if="!loggedIn" @open-signup="showSignupForm = true" />

    <div v-if="showSignupForm" class="formOverlay"></div>
    <div class="formWrapper">
      <transition name="fade">
        <SignupPart v-if="showSignupForm" @close="showSignupForm = false" />
      </transition>
    </div>

    <div class="wrapper">
      <div v-if="loggedIn" class="greetings">
        <h1>
          Welcome back <span>{{ user.username }} !</span>
        </h1>
        <h2>Here's what we've been watching...</h2>
      </div>
      <section class="bigCardsSection">
        <div class="sectionTitle" v-if="loggedIn">
          <p>NEW ON LETTERBOXD</p>
          <span>
            <font-awesome-icon :icon="['fas', 'bolt']" />
            YOUR ACTIVITY</span
          >
        </div>
        <div class="cards">
          <RouterLink
            :to="{ name: 'movie', params: { id: movies.id } }"
            v-for="(movies, index) in movieList.slice(0, 6)"
            :key="movies"
          >
            <div class="card">
              <img
                v-bind:src="`https://image.tmdb.org/t/p/w500${movies.poster_path}`"
                :alt="movies.name"
              />
            </div>
          </RouterLink>
        </div>
      </section>

      <toolsSection v-if="!loggedIn" />

      <section class="smallCardsSection">
        <div class="sectionTitle">
          <p>JUST REVIEWD...</p>
          <p>2,000,000 films watched</p>
        </div>
        <div class="cards">
          <div class="card" v-for="movies in movieList.slice(7, 19)" :key="movies">
            <img
              v-bind:src="`https://image.tmdb.org/t/p/w500${movies.poster_path}`"
              :alt="movies.name"
            />
          </div>
        </div>
      </section>
      <section id="shareSection">
        <div>
          <h2>Write and share reviews. Compile your own lists. Share your life in film.</h2>
          <p>
            Below are some popular reviews and lists from this week. Sign up to create your own.
          </p>
        </div>
        <div>
          <div></div>
          <div></div>
        </div>
      </section>
    </div>
  </main>
</template>
<style scoped>
/* COVER */

.formOverlay {
  position: fixed;
  z-index: 1;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8); /* Fond sombre */
}
.formWrapper {
  position: fixed;
  top: 60px;
  left: 50%;
  z-index: 2;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    transform 0.5s ease,
    opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

/* --- */

.greetings {
  /* border: solid blue 1px; */
  margin-top: 150px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

/* --- */
.smallCardsSection > .cards {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.smallCardsSection .card {
  width: 80px;
  height: 115px;
}

/* --- */
</style>
