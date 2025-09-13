<script setup>
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'

import InteractionForm from '@/components/InteractionForm.vue'
import ReviewForm from '@/components/ReviewForm.vue'

import { fakeReviews, fakeReviews2 } from '@/assets/JS/reviewSample'

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
const tabs = ['CAST', 'CREW', 'DETAILS', 'GENRES', 'BOX OFFICE']

const props = defineProps({
  id: { required: true },
})

const showReviewForm = ref(false)
const handleReviewForm = () => {
  showReviewForm.value = true
}

// Random sample reviews
function getRandomItems(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
const randomReviews = computed(() => getRandomItems(fakeReviews, 4))
const randomReviews2 = computed(() => getRandomItems(fakeReviews2, 4))

onMounted(async () => {
  // console.log(activeTab.value)
  try {
    const { data: movieData } = await axios.get(`https://api.themoviedb.org/3/movie/${props.id}`, {
      params: { api_key: apiKey, language: 'fr-FR' },
    })

    movieInfos.value = movieData
    console.log(movieInfos.value)
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

    const cast = creditsData.cast.slice(0, 20)

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

const starIcon = (i, rate) => {
  if (rate >= i) {
    return ['fas', 'star'] // pleine
  } else if (rate >= i - 0.5) {
    return ['fas', 'star-half-stroke'] // demi-étoile
  } else {
    return ['far', 'star'] // vide
  }
}

const finalDate = computed(() => {
  if (!movieInfos.value?.release_date) return ''
  const date = new Date(movieInfos.value.release_date)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const finalBudget = computed(() => {
  if (!movieInfos.value?.budget) return 'Non renseigné'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(movieInfos.value.budget)
})

const finalRevenue = computed(() => {
  if (!movieInfos.value?.revenue) return 'Non renseigné'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(movieInfos.value.revenue)
})
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
        <section class="whereToWatchSection">
          <div>
            <p>WHERE TO WATCH</p>
          </div>
          <div>
            <div>
              <p>Amazon US</p>
              <button>RENT</button>
              <button>BUY</button>
            </div>
            <div>
              <p>Apple TV FR</p>
              <button>RENT</button>
              <button>BUY</button>
            </div>
            <div>
              <p>Netflix</p>
              <button>RENT</button>
              <button>BUY</button>
            </div>
            <div>
              <p>Youtube FR</p>
              <button>RENT</button>
              <button>BUY</button>
            </div>
            <div>
              <p>Disney +</p>
              <button>RENT</button>
              <button>BUY</button>
            </div>
          </div>
        </section>
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

        <!-- MAIN BLOCK -->
        <div class="mainBlock">
          <!-- MAIN LEFT -->
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
                <div class="value" v-for="actor in topActors" :key="actor.name">
                  <RouterLink :to="{ name: 'person', params: { id: actor.id } }">
                    {{ actor.name }}
                  </RouterLink>
                </div>
              </div>

              <div class="displayedTab" v-if="activeTab === 'CREW'">
                <div v-if="movieCrew.directors">
                  <div class="key">
                    <span>DIRECTOR</span>
                    <div class="dots"></div>
                  </div>
                  <div class="valueWrapper">
                    <div class="value" v-for="person in movieCrew.directors" :key="person.id">
                      <RouterLink :to="{ name: 'person', params: { id: person.id } }">
                        {{ person.name }}
                      </RouterLink>
                    </div>
                  </div>
                </div>
                <div v-if="movieCrew.writers">
                  <div class="key">
                    <span>WRITER</span>
                    <div class="dots"></div>
                  </div>
                  <div class="valueWrapper">
                    <div class="value" v-for="person in movieCrew.writers" :key="person.id">
                      <RouterLink :to="{ name: 'person', params: { id: person.id } }">
                        {{ person.name }}
                      </RouterLink>
                    </div>
                  </div>
                </div>
                <div v-if="movieCrew.producers">
                  <div class="key">
                    <span>PRODUCERS</span>
                    <div class="dots"></div>
                  </div>
                  <div class="valueWrapper">
                    <div class="value" v-for="person in movieCrew.producers" :key="person.id">
                      <RouterLink :to="{ name: 'person', params: { id: person.id } }">
                        {{ person.name }}
                      </RouterLink>
                    </div>
                  </div>
                </div>
                <div v-if="movieCrew.composers">
                  <div class="key">
                    <span>COMPOSERS</span>
                    <div class="dots"></div>
                  </div>
                  <div class="valueWrapper">
                    <div class="value" v-for="person in movieCrew.composers" :key="person.id">
                      <RouterLink :to="{ name: 'person', params: { id: person.id } }">
                        {{ person.name }}
                      </RouterLink>
                    </div>
                  </div>
                </div>
              </div>

              <div class="displayedTab" v-if="activeTab === 'DETAILS'">
                <div v-if="movieInfos.production_companies">
                  <div class="key">
                    <span>STUDIOS</span>
                    <div class="dots"></div>
                  </div>
                  <div class="valueWrapper">
                    <div
                      class="value"
                      v-for="studio in movieInfos.production_companies"
                      :key="studio.id"
                    >
                      <p>
                        {{ studio.name }}
                      </p>
                    </div>
                  </div>
                </div>
                <div v-if="movieInfos.production_countries">
                  <div class="key">
                    <span>COUNTRY</span>
                    <div class="dots"></div>
                  </div>
                  <div class="valueWrapper">
                    <div
                      class="value"
                      v-for="country in movieInfos.production_countries"
                      :key="country.id"
                    >
                      <p>
                        {{ country.name }}
                      </p>
                    </div>
                  </div>
                </div>
                <div v-if="movieInfos?.release_date">
                  <div class="key">
                    <span>RELEASE</span>
                    <div class="dots"></div>
                  </div>
                  <div class="valueWrapper">
                    <div class="value">
                      <p>
                        {{ finalDate }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="displayedTab" v-if="activeTab === 'GENRES'">
                <div v-if="movieInfos.genres">
                  <div class="key">
                    <span>GENRES</span>
                    <div class="dots"></div>
                  </div>
                  <div class="valueWrapper">
                    <div class="value" v-for="genre in movieInfos.genres" :key="genre.id">
                      <p>
                        {{ genre.name }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="displayedTab" v-if="activeTab === 'BOX OFFICE'">
                <div v-if="movieInfos?.budget">
                  <div class="key">
                    <span>BUDGET</span>
                    <div class="dots"></div>
                  </div>
                  <div class="valueWrapper">
                    <div class="value">
                      <p>
                        {{ finalBudget }}
                      </p>
                    </div>
                  </div>
                </div>
                <div v-if="movieInfos?.revenue">
                  <div class="key">
                    <span>REVENUE</span>
                    <div class="dots"></div>
                  </div>
                  <div class="valueWrapper">
                    <div class="value">
                      <p>
                        {{ finalRevenue }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- MAIN RIGHT -->
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
                <font-awesome-icon v-for="i in 5" :key="i" :icon="starIcon(i, movieRate)" />
              </div>
              <p>{{ Math.floor(movieRate * 10) / 10 }}</p>
            </div>
          </section>
        </div>

        <section class="reviewSection">
          <h3 class="sectionTitle">POPULAR REVIEWS</h3>
          <div class="reviewBlock" v-for="review in randomReviews" :key="review">
            <div class="profile">
              <font-awesome-icon :icon="['fas', 'user']" />
            </div>

            <div class="rightBlock">
              <div class="reviewTitle">
                <p><span>Review by</span> {{ review.nameSample }}</p>
                <div>
                  <font-awesome-icon
                    v-for="i in 5"
                    :key="i"
                    :icon="starIcon(i, review.rateSample)"
                    class="star"
                  />
                </div>
                <p v-if="review.likedSample">
                  <font-awesome-icon :icon="['fas', 'heart']" class="heart" />
                </p>
              </div>
              <div>
                <p>
                  {{ review.reviewSample }}
                </p>
              </div>
              <div>
                <p>{{ review.dateSample }}</p>
              </div>
            </div>
          </div>
        </section>
        <section class="reviewSection">
          <h3 class="sectionTitle">RECENT REVIEWS</h3>
          <div class="reviewBlock" v-for="review in randomReviews2" :key="review">
            <div class="profile">
              <font-awesome-icon :icon="['fas', 'user']" />
            </div>

            <div class="rightBlock">
              <div class="reviewTitle">
                <p><span>Review by</span> {{ review.nameSample }}</p>
                <div>
                  <font-awesome-icon
                    v-for="i in 5"
                    :key="i"
                    :icon="starIcon(i, review.rateSample)"
                    class="star"
                  />
                </div>
                <p v-if="review.likedSample">
                  <font-awesome-icon :icon="['fas', 'heart']" class="heart" />
                </p>
              </div>
              <div>
                <p>
                  {{ review.reviewSample }}
                </p>
              </div>
              <div>
                <p>{{ review.dateSample }}</p>
              </div>
            </div>
          </div>
        </section>
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

.posterZone {
  position: sticky;
  top: 30px;
  align-self: flex-start;
}
.posterZone > img {
  width: 230px;
  height: 345px;
  border-radius: 10px;
  box-shadow: 0 0 2px black;
  margin-bottom: 30px;
}

.whereToWatchSection {
  border: 1px solid var(--background-color2-);
  border-radius: 4px;
}
.whereToWatchSection > div:first-of-type {
  background-color: var(--background-color3-);
  padding: 10px;
}
.whereToWatchSection > div:last-of-type {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.whereToWatchSection > div:last-of-type > div {
  border-bottom: 1px solid var(--background-color2-);
  display: flex;
  gap: 5px;
  padding-bottom: 4px;
}
.whereToWatchSection > div:last-of-type > div:last-of-type {
  border-bottom: none;
}
.whereToWatchSection button {
  background-color: var(--background-color3-);
  color: var(--font-color3-);
  font-size: 10px;
}

/* MAIN ZONE */

.movieTitle {
  display: flex;
  gap: 10px;
  align-items: end;
  flex-wrap: wrap;
  margin-bottom: 25px;
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
  margin-bottom: 30px;
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

/*  */

.tabContent > div {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.tabContent a:hover {
  color: var(--font-color1-);
}

.displayedTab {
  width: 100%;
  /* border: solid 1px red; */
}
.displayedTab > div {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
  width: 100%;
}
.key {
  /* border: solid 1px yellow; */
  width: 40%;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 32px;
}
.key > span {
  line-height: 1; /* Évite un décalage vertical */
  white-space: nowrap;
}
.key > .dots {
  flex: 1;
  border-bottom: 1px dotted var(--font-color3-);
  height: 10px;
}
.valueWrapper {
  width: 60%;
  display: flex;

  flex-wrap: wrap;
  gap: 4px;
}
.value {
  background-color: var(--background-color3-);
  width: fit-content;
  padding: 6px 10px;
  border-radius: 4px;
}
.value > a,
.value > p {
  color: var(--font-color2-);
  text-decoration: none;
  font-size: 14px;
  margin: 2px;
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

/* REVIEW */

.reviewSection {
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
}

.reviewBlock {
  display: flex;
  gap: 20px;
  border-bottom: solid 1px var(--background-color2-);
  padding-bottom: 20px;
  margin-bottom: 20px;
}
.reviewBlock:last-of-type {
  border: none;
}

.reviewBlock > .profile {
  border: solid 1px var(--background-color2-);
  background-color: var(--background-color3-);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.reviewBlock > .profile > svg {
  font-size: 30px;
}

.reviewBlock > .rightBlock {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}
.reviewTitle {
  display: flex;
  gap: 10px;
}
.reviewTitle .heart {
  color: var(--orange-);
}
.reviewTitle .star {
  color: var(--green-);
}
</style>
