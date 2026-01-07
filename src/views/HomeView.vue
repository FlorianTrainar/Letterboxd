<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import CoverPart from '@/components/CoverPart.vue'
import toolsSection from '@/components/toolsSection.vue'
import SignupPart from '@/components/SignupPart.vue'
import { fakeReviews } from '@/assets/JS/reviewSample'
import { starIcon } from '@/assets/JS/starIcon'

import { useLoading } from '@/assets/JS/useLoading'
const { isLoading: showLoadingMessage, startLoading, stopLoading } = useLoading()

import { useAuth } from '@/assets/JS/useAuth'
const { loggedIn, user } = useAuth()

const showSignupForm = ref(false)

const movieList = ref([])

const apiKey = import.meta.env.VITE_TMDB_API_KEY
const randomPage = Math.floor(Math.random() * 25) + 1

onMounted(async () => {
  startLoading()
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
    movieList.value = shuffled.slice(0, 20)
    console.log(movieList.value)
  } catch (error) {
    console.log('catch >>>', error)
  } finally {
    stopLoading()
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
          Welcome <span>{{ user.username }} </span> !
        </h1>
        <h2>Here's what we've been watching...</h2>
      </div>

      <div v-if="showLoadingMessage" class="pageLoader">
        <font-awesome-icon icon="spinner" spin />
      </div>

      <section class="bigCardsSection">
        <div class="sectionTitle" v-if="loggedIn">
          <h3>NEW ON LETTERBOXD</h3>
        </div>
        <div class="cards">
          <RouterLink
            :to="{ name: 'movie', params: { id: movies.id } }"
            v-for="movies in movieList.slice(0, 6)"
            :key="movies"
          >
            <div class="card">
              <img
                v-bind:src="`https://image.tmdb.org/t/p/w500${movies.poster_path}`"
                :alt="movies.name"
              />
              <div class="tooltip">{{ movies.title }}</div>
            </div>
          </RouterLink>
        </div>
      </section>

      <section v-if="loggedIn && movieList.length">
        <h3 class="sectionTitle">POPULAR REVIEWS THIS WEEK</h3>
        <div class="popularReviewsWrapper">
          <div
            class="popularReviews"
            v-for="(review, index) in fakeReviews.slice(0, 5)"
            :key="review"
          >
            <div class="upperPart">
              <RouterLink
                :to="{ name: 'movie', params: { id: movieList[index + 12].id } }"
                class="card smallCard"
              >
                <img
                  v-bind:src="`https://image.tmdb.org/t/p/w500${movieList[index + 12].poster_path}`"
                />
              </RouterLink>
              <div class="rightBlock">
                <h3>{{ review.nameSample }}</h3>
                <RouterLink
                  :to="{ name: 'movie', params: { id: movieList[index + 12].id } }"
                  class="tiempoBold"
                >
                  {{ movieList[index + 12].title }}
                  <span class="tiempoTitleSpan">
                    {{ movieList[index + 12].release_date.slice(0, 4) }}</span
                  >
                </RouterLink>
                <div>
                  <div class="icons">
                    <div>
                      <font-awesome-icon
                        v-for="i in 5"
                        :key="i"
                        :icon="starIcon(i, fakeReviews[index].rateSample)"
                        class="starIcon"
                      />
                    </div>
                    <font-awesome-icon
                      v-if="fakeReviews[index].likedSample"
                      :icon="['fas', 'heart']"
                      class="heartIcon"
                    />
                  </div>
                </div>
              </div>
            </div>
            <p>{{ fakeReviews[index].reviewSample }}</p>
          </div>
        </div>
      </section>

      <section v-if="loggedIn" class="bigCardsSection">
        <div class="sectionTitle" v-if="loggedIn">
          <h3>POPULAR WITH FRIENDS</h3>
        </div>
        <div class="cards">
          <RouterLink
            :to="{ name: 'movie', params: { id: movies.id } }"
            v-for="movies in movieList.slice(6, 12)"
            :key="movies"
          >
            <div class="card">
              <img
                v-bind:src="`https://image.tmdb.org/t/p/w500${movies.poster_path}`"
                :alt="movies.name"
              />
              <div class="tooltip">{{ movies.title }}</div>
            </div>
          </RouterLink>
        </div>
      </section>

      <!-- loggedOut -->

      <toolsSection v-if="!loggedIn" />

      <section v-if="!loggedIn" class="smallCardsSection">
        <div class="sectionTitle">
          <h3>JUST REVIEWD...</h3>
          <h3>2,000,000 films watched</h3>
        </div>
        <div class="cards">
          <RouterLink
            :to="{ name: 'movie', params: { id: movies.id } }"
            class="card"
            v-for="movies in movieList.slice(7, 19)"
            :key="movies"
          >
            <img
              v-bind:src="`https://image.tmdb.org/t/p/w500${movies.poster_path}`"
              :alt="movies.title"
            />
            <div class="tooltip">{{ movies.title }}</div>
          </RouterLink>
        </div>
      </section>
      <section v-if="!loggedIn" id="shareSection">
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
.greetings h1 {
  color: var(--font-color2-);
}
.greetings span {
  color: var(--font-color1-);
  border-bottom: solid 1px var(--font-color2-);
}
.greetings span:hover {
  border-bottom: solid 1px var(--font-color1-);
  cursor: pointer;
}
.sectionTitle {
  display: flex;
  justify-content: space-between;
}
/* --- */
.popularReviewsWrapper {
  /* border: solid 1px red; */
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;
}
.popularReviews {
  /* border: solid 1px gray; */
  width: 48%;
  padding-bottom: 20px;
  border-bottom: solid 1px var(--background-color2-);
  margin-bottom: 30px;
}
.popularReviews > .upperPart {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
}

.upperPart > .rightBlock {
  flex: 1;
  align-self: self-end;
  /* border: solid 1px yellow; */
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.upperPart > .rightBlock a {
  margin: 6px 0;
  font-size: 23px;
}

.upperPart > .rightBlock .icons {
  display: flex;
  align-items: flex-end;
  gap: 6px;
}
.upperPart > .rightBlock svg {
  font-size: 12px;
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

/* ---- */
/* Media QUerries */
/* ---- */

@media (max-width: 1020px) {
  .smallCardsSection > .cards {
    flex-wrap: wrap;
    gap: 6px;
    justify-content: center;
    padding: 0 10px;
  }
  .smallCardsSection .card {
    width: 80px;
    height: 115px;
  }
}
</style>
