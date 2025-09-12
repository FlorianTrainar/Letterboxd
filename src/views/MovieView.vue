<script setup>
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'

import InteractionForm from '@/components/InteractionForm.vue'
import ReviewForm from '@/components/ReviewForm.vue'

import { useAuth } from '@/assets/JS/useAuth'
import { useModalStore } from '@/assets/JS/modalStore'
const auth = useAuth()
const modalStore = useModalStore()

const loggedIn = computed(() => auth.loggedIn.value)

const apiKey = import.meta.env.VITE_TMDB_API_KEY
const movieInfos = ref({})
const topActors = ref([])
const releaseYear = ref({})
const movieCrew = ref({
  directors: [],
  writers: [],
  composers: [],
  producers: [],
})
const movieRate = ref(0)
const reviewSavedFlag = ref(false)

const onReviewSaved = () => {
  reviewSavedFlag.value = false
  setTimeout(() => {
    reviewSavedFlag.value = true
  }, 10) // un petit délai plus fiable
}

const activeTab = ref('CAST')
const tabs = ['CAST', 'CREW', 'DETAILS', 'GENRES', 'RELEASES']

const props = defineProps({
  id: { required: true },
})

const showReviewForm = ref(false)
const handleReviewForm = () => {
  showReviewForm.value = true
}
// console.log('loggedIn initial:', auth.loggedIn)

onMounted(async () => {
  // console.log(activeTab.value)
  try {
    const { data: movieData } = await axios.get(`https://api.themoviedb.org/3/movie/${props.id}`, {
      params: { api_key: apiKey, language: 'fr-FR' },
    })

    movieInfos.value = movieData
    releaseYear.value = movieData.release_date.slice(0, 4)
    movieRate.value = movieData.vote_average / 2
    // console.log('movieData >>>', movieRate.value)
  } catch (error) {
    console.log('catch>>', error)
  }

  try {
    const { data: creditsData } = await axios.get(
      `https://api.themoviedb.org/3/movie/${props.id}/credits`,
      {
        params: { api_key: apiKey, language: 'fr-FR' },
      },
    )

    const cast = creditsData.cast.slice(0, 6)

    movieCrew.value.directors = creditsData.crew.filter((person) => person.job === 'Director')

    movieCrew.value.writers = creditsData.crew.filter((person) =>
      ['Writer', 'Screenplay', 'Story', 'Author'].includes(person.job),
    )
    movieCrew.value.producers = creditsData.crew.filter((person) => person.job === 'Producer')

    movieCrew.value.composers = creditsData.crew.filter((person) =>
      ['Original Music Composer', 'Music', 'Composer', 'Score Composer'].includes(person.job),
    )

    // console.log(movieInfos)

    topActors.value = cast
  } catch (error) {
    console.error('Erreur crédits >>>', error)
  }
})

const starIcon = (i) => {
  if (movieRate.value >= i) {
    return ['fas', 'star'] // pleine
  } else if (movieRate.value >= i - 0.5) {
    return ['fas', 'star-half-stroke'] // demi-étoile
  } else {
    return ['far', 'star'] // vide
  }
}
</script>
<template>
  <main>
    <div class="cover">
      <img
        v-if="movieInfos && movieInfos.backdrop_path"
        v-bind:src="`https://image.tmdb.org/t/p/w500${movieInfos.backdrop_path}`"
        :alt="movieInfos.title"
      />
    </div>
    <div class="wrapper">
      <div class="posterZone">
        <img
          v-if="movieInfos && movieInfos.poster_path"
          v-bind:src="`https://image.tmdb.org/t/p/w500${movieInfos.poster_path}`"
          :alt="movieInfos.title"
        />
      </div>

      <div class="mainZone">
        <section class="movieTitle">
          <h1>{{ movieInfos.title }}</h1>
          <p>
            <span>{{ releaseYear }}</span> Directed by
            <span v-for="directors in movieCrew.directors" :key="directors.id">{{
              directors.name
            }}</span>
          </p>
        </section>

        <div class="mainBlock">
          <div class="leftColumn">
            <p>{{ movieInfos.tagline }}</p>
            <p>{{ movieInfos.overview }}</p>
            <div class="tabSelector">
              <button
                v-for="tab in tabs"
                :key="tab"
                :class="{ activeTab: activeTab === tab }"
                @click="activeTab = tab"
              >
                {{ tab }}
              </button>
            </div>

            <div class="tabContent">
              <div v-if="activeTab === 'CAST'">
                <div class="artistLink" v-for="actor in topActors" :key="actor.name">
                  <RouterLink :to="{ name: 'person', params: { id: actor.id } }">
                    {{ actor.name }}
                  </RouterLink>
                </div>
              </div>
              <div id="crewTab" v-if="activeTab === 'CREW'">
                <div>
                  <p>DIRECTOR</p>
                  <div class="dots"></div>
                  <div class="names" v-if="movieCrew.directors">
                    <button v-for="directors in movieCrew.directors" :key="directors.id">
                      {{ directors.name }}
                    </button>
                  </div>
                </div>
                <div v-if="movieCrew.writers">
                  <p>WRITERS</p>
                  <div class="dots"></div>
                  <div class="names">
                    <button v-for="writers in movieCrew.writers" :key="writers.id">
                      {{ writers.name }}
                    </button>
                  </div>
                </div>
                <div>
                  <p>PRODUCERS</p>
                  <div class="dots"></div>
                  <div class="names" v-if="movieCrew.producers">
                    <button v-for="producers in movieCrew.producers" :key="producers.id">
                      {{ producers.name }}
                    </button>
                  </div>
                </div>
                <div>
                  <p>COMPOSERS</p>
                  <div class="dots"></div>
                  <div class="names" v-if="movieCrew.composers">
                    <button v-for="composers in movieCrew.composers" :key="composers.id">
                      {{ composers.name }}
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="activeTab === 'DETAILS'">
                <p>En construction...</p>
              </div>
              <div v-if="activeTab === 'GENRES'">
                <p>En construction...</p>
              </div>
              <div v-if="activeTab === 'RELEASES'">
                <p>En construction...</p>
              </div>
            </div>
          </div>
          <section class="rightColumn">
            <div>
              <div class="globalBlock loggedOutBlock" v-if="!loggedIn">
                <button button @click="modalStore.openLogin">
                  Sign in to log, rate, or review
                </button>
                <button>Share</button>
              </div>

              <InteractionForm
                :filmID="props.id"
                :reviewSaved="reviewSavedFlag"
                @showReviewForm="handleReviewForm"
                v-else
              />
            </div>
            <div class="globalRating">
              <p>RATINGS</p>
              <span>{{ movieInfos.vote_count }} VOTES</span>
            </div>
            <div class="globalStars">
              <div>
                <font-awesome-icon v-for="i in 5" :key="i" :icon="starIcon(i)" />
              </div>
              <p>{{ Math.floor(movieRate * 10) / 10 }}</p>
            </div>
          </section>
        </div>
      </div>
    </div>

    <div v-if="showReviewForm" class="formOverlay"></div>
    <transition name="fade">
      <div class="reviewFormWrapper" v-if="showReviewForm">
        <ReviewForm
          :movie="movieInfos"
          @closeReviewForm="showReviewForm = false"
          @reviewSaved="onReviewSaved"
        />
      </div>
    </transition>
  </main>
</template>
<style scoped>
.wrapper {
  display: flex;
  gap: 40px;
  z-index: 1;
}

/* LEFT ZONE */

.posterZone > img {
  width: 230px;
  height: 345px;
  border-radius: 10px;
  box-shadow: 0 0 2px black;
}

/* MAIN ZONE */

.movieTitle {
  display: flex;
  gap: 10px;
  align-items: end;
  flex-wrap: wrap;
}
.movieTitle span {
  text-decoration: underline;
  color: var(--font-color1-);
}
.movieTitle > p {
  margin-bottom: 4px;
}

/* MAIN*/

.mainBlock {
  display: flex;
  gap: 50px;
  margin-bottom: 60px;
}

/* Left Column*/

.leftColumn {
  flex: 10;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.tabSelector {
  display: flex;
  gap: 10px;
  border-bottom: var(--font-color3-) 1px solid;
}
.tabSelector > button {
  background: none;
  color: var(--green-);
  font-size: 14px;
  padding-bottom: 4px;
  position: relative;
}
.tabSelector > button::after {
  content: '';
  position: absolute;
  bottom: -1px; /* Superpose la bordure grise */
  left: 0;
  width: 100%;
  height: 1px;
  background-color: var(--green-);
  opacity: 0;
  transition: opacity 0.2s ease;
}
.tabSelector > button:hover::after {
  opacity: 1;
}
.tabSelector > button.activeTab {
  color: white;
}
.tabContent > div {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.artistLink {
  background-color: var(--background-color3-);
  width: fit-content;
  padding: 4px 6px;
  border-radius: 4px;
}
.artistLink > a {
  color: var(--font-color2-);
  text-decoration: none;
  font-size: 14px;

  padding: 6px;
  margin: 2px;
}
.tabContent a:hover {
  color: var(--font-color1-);
}

#crewTab {
  width: 100%;
  /* border: solid 1px red; */
}
#crewTab p {
  padding-top: 6px;
}
#crewTab > div {
  /* border: solid 1px blue; */
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 10px;
}
#crewTab .dots {
  flex: 1;
  border-bottom: 1px dotted var(--font-color3-);
  height: 22px;
}
#crewTab .names {
  width: 60%;
  display: flex;
  flex-wrap: wrap;
}

/* Right Column*/

.rightColumn {
  /* border: solid 1px green; */
  flex: 5;
}
.rightColumn .globalBlock {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-bottom: 25px;
  border-radius: 20px;
}

.loggedOutBlock button {
  background-color: var(--background-color2-);
  color: var(--font-color2-);
  padding: 12px 15px;
}
.loggedOutBlock button:first-of-type {
  border-radius: 4px 4px 0 0;
}
.loggedOutBlock button:last-of-type {
  border-radius: 0 0 4px 4px;
}

/*  */
.globalRating {
  display: flex;
  justify-content: space-between;
  padding-bottom: 4px;
  border-bottom: var(--font-color3-) 1px solid;
  margin-bottom: 25px;
}
.globalRating > span {
  color: var(--font-color3-);
}
.globalStars {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.globalStars > p {
  font-size: 24px;
}
.globalStars > div {
  display: flex;
  gap: 2px;
  color: var(--green-);
}
.globalStars svg {
  font-size: 22px;
}

.formOverlay {
  position: fixed;
  z-index: 1;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8); /* Fond sombre */
}
.reviewFormWrapper {
  position: fixed;

  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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
  transform: scale(0.5) translate(-50%, -50%);
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1) translate(-50%, -50%);
}
</style>
