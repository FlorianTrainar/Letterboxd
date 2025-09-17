<script setup>
import { onMounted, ref, computed, watch } from 'vue'

import { RouterLink, useRoute } from 'vue-router'
const route = useRoute()

import axios from 'axios'

import { useAuth } from '@/assets/JS/useAuth'
const { user, token } = useAuth()

import { starIcon } from '@/assets/JS/starIcon'

import { useLoading } from '@/assets/JS/useLoading'
const { showLoadingMessage, showStrapiLoadingMessage, startLoading, stopLoading } = useLoading()

const activeTab = ref('profile')
const syncActiveTabFromRoute = () => {
  const tabParam = route.query.tab
  if (['profile', 'films', 'watchlist', 'reviews'].includes(tabParam)) {
    activeTab.value = tabParam
  } else {
    activeTab.value = 'profile'
  }
}

const likedMovies = ref([])
const likedMoviesInfo = ref([])

const watchlistMovies = ref([])
const watchlistMoviesInfo = ref([])

const watchedMovies = ref([])
const watchedMoviesInfo = ref([])

const reviewedMovies = ref([])
const reviewsWithMovieInfo = ref([])

const ratedMoviesDistribution = ref({
  0.5: 0,
  1: 0,
  1.5: 0,
  2: 0,
  2.5: 0,
  3: 0,
  3.5: 0,
  4: 0,
  4.5: 0,
  5: 0,
})
const sortedNotes = computed(() => {
  return Object.keys(ratedMoviesDistribution.value)
    .map(Number) // convertir en nombres
    .sort((a, b) => a - b) // tri numérique croissant
    .map(String) // remettre en string si besoin pour indexer l'objet
})

const apiKey = import.meta.env.VITE_TMDB_API_KEY

async function fetchRecentInteractions() {
  const allInteractions = []
  const pageSize = 25
  const totalPagesToFetch = 3

  // Récupère les métadonnées pour connaître le nombre total de pages
  const metadataRes = await axios.get(
    'https://tranquil-confidence-b13331c5ed.strapiapp.com/api/interactions',
    {
      params: {
        filters: {
          userID: { $eq: user.value.id },
          $or: [
            { liked: { $eq: true } },
            { watchlist: { $eq: true } },
            { watched: { $eq: true } },
            { review: { $null: false } },
          ],
        },
        pagination: { page: 1, pageSize },
      },
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    },
  )

  const totalPages = metadataRes.data.meta.pagination.pageCount

  const pagesToFetch = Array.from(
    { length: Math.min(totalPagesToFetch, totalPages) },
    (_, i) => totalPages - i,
  )

  const responses = await Promise.all(
    pagesToFetch.map((page) =>
      axios.get('https://tranquil-confidence-b13331c5ed.strapiapp.com/api/interactions', {
        params: {
          filters: {
            userID: { $eq: user.value.id },
            $or: [
              { liked: { $eq: true } },
              { watchlist: { $eq: true } },
              { watched: { $eq: true } },
              { review: { $null: false } },
            ],
          },
          pagination: { page, pageSize },
        },
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      }),
    ),
  )

  responses.forEach((res) => {
    allInteractions.push(...res.data.data)
  })

  return allInteractions
}

async function fetchFirstPageRatedInteractions() {
  const pageSize = 25
  const response = await axios.get(
    'https://tranquil-confidence-b13331c5ed.strapiapp.com/api/interactions',
    {
      params: {
        filters: {
          userID: { $eq: user.value.id },
          rate: { $notNull: true },
        },
        pagination: { page: 1, pageSize },
      },
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    },
  )
  return response.data.data
}

async function fetchMoviesInfo(movieIds) {
  const responses = await Promise.allSettled(
    movieIds.map((id) =>
      axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
        params: {
          api_key: apiKey,
          language: 'fr-FR',
        },
      }),
    ),
  )

  return responses.filter((r) => r.status === 'fulfilled').map((r) => r.value.data)
}

onMounted(async () => {
  startLoading()

  syncActiveTabFromRoute()
  watch(() => route.query.tab, syncActiveTabFromRoute)

  console.log(activeTab.value)

  if (!user.value || !token.value) return

  try {
    const interactions = await fetchRecentInteractions()

    // LIKED
    likedMovies.value = interactions
      .filter((i) => i.attributes.liked === true)
      .sort((a, b) => new Date(b.attributes.updatedAt) - new Date(a.attributes.updatedAt))
      .map((i) => i.attributes.filmID)
      .filter((id) => Number.isInteger(id) && id > 1)

    // WATCHLIST
    watchlistMovies.value = interactions
      .filter((i) => i.attributes.watchlist === true)
      .sort((a, b) => new Date(b.attributes.updatedAt) - new Date(a.attributes.updatedAt))
      .map((i) => i.attributes.filmID)
      .filter((id) => Number.isInteger(id) && id > 1)

    // WATCHED
    const watchedInteractions = interactions
      .filter((i) => i.attributes.watched === true)
      .sort((a, b) => new Date(b.attributes.updatedAt) - new Date(a.attributes.updatedAt))
      .filter((i) => Number.isInteger(i.attributes.filmID) && i.attributes.filmID > 1)

    watchedMovies.value = watchedInteractions.map((i) => i.attributes.filmID)

    const watchedTMDBInfos = await fetchMoviesInfo(watchedMovies.value)

    // REVIEWS
    reviewedMovies.value = interactions
      .filter((i) => i.attributes.review && i.attributes.filmID > 1)
      .sort((a, b) => new Date(b.attributes.updatedAt) - new Date(a.attributes.updatedAt))
      .map((i) => ({
        filmID: i.attributes.filmID,
        review: i.attributes.review,
        rate: i.attributes.rate,
        liked: i.attributes.liked,
      }))

    // TMDB Info
    likedMoviesInfo.value = await fetchMoviesInfo(likedMovies.value)
    watchlistMoviesInfo.value = await fetchMoviesInfo(watchlistMovies.value)

    watchedMoviesInfo.value = watchedTMDBInfos.map((movie) => {
      const interaction = watchedInteractions.find((i) => i.attributes.filmID === movie.id)
      return {
        ...movie,
        updatedAt: interaction?.attributes.updatedAt || null,
      }
    })

    const reviewFilmIDs = reviewedMovies.value.map((r) => r.filmID)
    const reviewMovies = await fetchMoviesInfo(reviewFilmIDs)

    reviewsWithMovieInfo.value = reviewedMovies.value.map((reviewObj) => {
      const movie = reviewMovies.find((m) => m.id === reviewObj.filmID)
      return {
        filmID: reviewObj.filmID,
        review: reviewObj.review,
        rate: reviewObj.rate,
        liked: reviewObj.liked,
        movie,
      }
    })

    // --- Récupération de la 1ère page des notes
    const ratedInteractions = await fetchFirstPageRatedInteractions()

    // Réinitialisation de la distribution
    Object.keys(ratedMoviesDistribution.value).forEach((key) => {
      ratedMoviesDistribution.value[key] = 0
    })

    // Comptage des notes
    ratedInteractions.forEach((interaction) => {
      const rate = interaction.attributes.rate
      if (rate && ratedMoviesDistribution.value[rate] !== undefined) {
        ratedMoviesDistribution.value[rate]++
      }
    })

    // DEBUG
    console.log('Distribution des notes (1ère page) :', ratedMoviesDistribution.value)
  } catch (err) {
    console.error('Erreur lors de la récupération des interactions :', err)
  }

  stopLoading()
})
</script>

<template>
  <main>
    <div class="headerBackground">
      <div v-if="showStrapiLoadingMessage" class="loadingBanner">
        <font-awesome-icon icon="spinner" spin />
        <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />

        <div>
          <p>Le serveur est en cours de chargement</p>
          <p>Merci de patienter quelques instants</p>
        </div>
      </div>
    </div>

    <div class="wrapper">
      <section class="profileHeader">
        <div class="avatarZone">
          <div class="avatar">
            <font-awesome-icon :icon="['fas', 'user']" />
          </div>
          <h2>{{ user.username }}</h2>
          <button>EDIT PROFILE</button>
        </div>
        <div class="infoZone tiempoBold">
          <div class="infoCount">
            <h2>{{ watchedMovies.length }}</h2>
            <p>Films</p>
          </div>
          <div class="separation"></div>
          <div class="infoCount">
            <h2>{{ likedMovies.length }}</h2>
            <p>Liked</p>
          </div>
          <div class="separation"></div>
          <div class="infoCount">
            <h2>{{ reviewedMovies.length }}</h2>
            <p>Reviews</p>
          </div>
        </div>
      </section>
      <section class="tabSelector">
        <button @click="activeTab = 'profile'" :class="{ active: activeTab === 'profile' }">
          Profile
        </button>
        <button @click="activeTab = 'films'" :class="{ active: activeTab === 'films' }">
          Films
        </button>
        <button @click="activeTab = 'reviews'" :class="{ active: activeTab === 'reviews' }">
          Reviews
        </button>
        <button @click="activeTab = 'watchlist'" :class="{ active: activeTab === 'watchlist' }">
          Watchlist
        </button>
        <button @click="activeTab = 'likes'" :class="{ active: activeTab === 'likes' }">
          Likes
        </button>
      </section>

      <div v-if="showLoadingMessage" class="pageLoader">
        <font-awesome-icon icon="spinner" spin />
      </div>
      <div v-else class="mainZone">
        <div v-if="activeTab === 'profile'" class="tabContent profileTab">
          <section class="profileWatchlist">
            <h3 class="sectionTitle">WATCHLIST</h3>
            <div class="bigCardsSection">
              <RouterLink
                :to="{ name: 'movie', params: { id: movie.id } }"
                class="card"
                v-for="movie in watchlistMoviesInfo.slice(0, 4)"
                :key="movie.id"
              >
                <img
                  v-bind:src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
                  :alt="movie.title"
                />
                <div class="tooltip">{{ movie.title }}</div>
              </RouterLink>
            </div>
            <div></div>
          </section>

          <section class="profileReviewSection">
            <h3 class="sectionTitle">RECENT REVIEWS</h3>
            <div
              class="profileReview"
              v-for="movie in reviewsWithMovieInfo.slice(0, 3)"
              :key="movie.movie.id"
            >
              <RouterLink
                :to="{ name: 'movie', params: { id: movie.movie.id } }"
                class="card smallCard"
              >
                <img
                  v-if="reviewsWithMovieInfo.length"
                  v-bind:src="`https://image.tmdb.org/t/p/w500${movie.movie.poster_path}`"
                  :alt="movie.movie.name"
                />
              </RouterLink>
              <div class="rightBlock">
                <RouterLink
                  :to="{ name: 'movie', params: { id: movie.movie.id } }"
                  class="tiempoTitle"
                >
                  {{ movie.movie.title }}
                  <span class="tiempoTitleSpan"> {{ movie.movie.release_date.slice(0, 4) }}</span>
                </RouterLink>
                <div>
                  <div v-if="movie.rate">
                    <font-awesome-icon
                      v-for="i in 5"
                      :key="i"
                      :icon="starIcon(i, movie.rate)"
                      class="starIcon"
                    />
                  </div>
                  <font-awesome-icon
                    v-if="movie.liked"
                    :icon="['fas', 'heart']"
                    class="heartIcon"
                  />
                </div>

                <p class="tiempo">{{ movie.review }}</p>
              </div>
            </div>
          </section>

          <section class="profileLikes">
            <h3 class="sectionTitle">RECENT LIKES</h3>
            <div class="bigCardsSection">
              <RouterLink
                :to="{ name: 'movie', params: { id: movie.id } }"
                class="card"
                v-for="movie in likedMoviesInfo.slice(0, 4)"
                :key="movie.id"
              >
                <img
                  v-bind:src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
                  :alt="movie.title"
                />
                <div class="tooltip">{{ movie.title }}</div>
              </RouterLink>
            </div>
            <div></div>
          </section>
        </div>

        <div v-if="activeTab === 'films'" class="tabContent filmTab">
          <section>
            <h3 class="sectionTitle">
              <span class="tiempo">{{ watchedMovies.length }}</span>
              FILMS WATCHED
            </h3>
            <div class="smallCardsSection">
              <div class="card smallCard" v-for="movie in watchedMoviesInfo" :key="movie.id">
                <RouterLink :to="{ name: 'movie', params: { id: movie.id } }">
                  <img
                    v-bind:src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
                    :alt="movie.title"
                  />
                  <div class="tooltip">{{ movie.title }}</div>
                </RouterLink>
              </div>
            </div>
          </section>
        </div>

        <div v-if="activeTab === 'reviews'" class="tabContent reviewsTab">
          <section>
            <h3 class="sectionTitle">YOUR REVIEWS</h3>
            <div
              class="profileReview"
              v-for="movie in reviewsWithMovieInfo.slice(0, 10)"
              :key="movie.movie.id"
            >
              <RouterLink
                :to="{ name: 'movie', params: { id: movie.movie.id } }"
                class="card smallCard"
              >
                <img
                  v-if="reviewsWithMovieInfo.length"
                  v-bind:src="`https://image.tmdb.org/t/p/w500${movie.movie.poster_path}`"
                  :alt="movie.movie.name"
                />
              </RouterLink>
              <div class="rightBlock">
                <RouterLink
                  :to="{ name: 'movie', params: { id: movie.movie.id } }"
                  class="tiempoTitle"
                >
                  {{ movie.movie.title }}
                  <span class="tiempoTitleSpan"> {{ movie.movie.release_date.slice(0, 4) }}</span>
                </RouterLink>
                <div>
                  <div v-if="movie.rate">
                    <font-awesome-icon
                      v-for="i in 5"
                      :key="i"
                      :icon="starIcon(i, movie.rate)"
                      class="starIcon"
                    />
                  </div>
                  <font-awesome-icon
                    v-if="movie.liked"
                    :icon="['fas', 'heart']"
                    class="heartIcon"
                  />
                </div>

                <p class="tiempo">{{ movie.review }}</p>
              </div>
            </div>
          </section>
        </div>

        <div v-if="activeTab === 'watchlist'" class="tabContent watchlistTab">
          <section>
            <h3 class="sectionTitle">
              <span class="tiempo">{{ watchlistMovies.length }}</span> FILMS IN YOUR WATCHLIST
            </h3>
            <div class="smallCardsSection">
              <div class="card smallCard" v-for="movie in watchlistMoviesInfo" :key="movie.id">
                <RouterLink :to="{ name: 'movie', params: { id: movie.id } }">
                  <img
                    v-bind:src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
                    :alt="movie.name"
                  />
                  <div class="tooltip">{{ movie.title }}</div>
                </RouterLink>
              </div>
            </div>
          </section>
        </div>

        <div v-if="activeTab === 'likes'" class="tabContent likesTab">
          <section>
            <h3 class="sectionTitle">
              <span>{{ likedMovies.length }}</span> FILMS YOU LIKED
            </h3>
            <div class="smallCardsSection">
              <div class="card smallCard" v-for="movie in likedMoviesInfo" :key="movie.id">
                <RouterLink :to="{ name: 'movie', params: { id: movie.id } }">
                  <img
                    v-bind:src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
                    :alt="movie.name"
                  />
                  <div class="tooltip">{{ movie.title }}</div>
                </RouterLink>
              </div>
            </div>
          </section>
        </div>

        <div class="rightColumn">
          <section class="diary">
            <h3 class="sectionTitle">DIARY</h3>
            <div class="diaryContent" v-if="watchedMoviesInfo.length">
              <div>
                <font-awesome-icon :icon="['fas', 'calendar']" />
              </div>
              <div>
                <div
                  class="diaryMovies"
                  v-for="movie in watchedMoviesInfo.slice(0, 5)"
                  :key="movie.title"
                >
                  <h3>
                    {{ movie.title }}
                  </h3>
                  <p>
                    {{
                      new Date(movie.updatedAt).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    }}
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section class="rating">
            <h3 class="sectionTitle">RATINGS</h3>
            <div class="ratingContent">
              <div>
                <font-awesome-icon :icon="['fas', 'star']" />
              </div>
              <div class="barWrapper">
                <div
                  v-for="note in sortedNotes"
                  :key="note"
                  class="bar"
                  :style="{ height: ratedMoviesDistribution[note] * 5 + 5 + 'px' }"
                ></div>
              </div>
              <div>
                <font-awesome-icon :icon="['fas', 'star']" />
                <font-awesome-icon :icon="['fas', 'star']" />
                <font-awesome-icon :icon="['fas', 'star']" />
                <font-awesome-icon :icon="['fas', 'star']" />
                <font-awesome-icon :icon="['fas', 'star']" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </main>
</template>
<style scoped>
.profileHeader {
  display: flex;
  justify-content: space-between;
  height: 80px;

  margin-top: 30px;
  margin-bottom: 40px;
}
.profileHeader > div {
  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 50px;
}

.avatar {
  border: solid 1px var(--background-color4-);
  background-color: var(--background-color2-);
  border-radius: 50%;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar > svg {
  font-size: 70px;
}
.avatarZone > h2 {
  color: var(--font-color1-);
}
.avatarZone > button {
  color: var(--font-color2-);
  background-color: var(--background-color2-);
  padding: 8px 12px;
}
.infoZone {
  padding: 20px 0;
}
.infoCount {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.infoCount > h2 {
  color: var(--font-color1-);
}
.infoCount > p {
  color: var(--font-color3-);
}
.infoZone > .separation {
  border-left: solid 1px var(--font-color3-);
  height: 100%;
}

/*  */

.tabSelector {
  border: solid 1px var(--background-color3-);
  display: flex;
  justify-content: center;
  gap: 10px;
  height: 50px;
}
.tabSelector > button {
  background: none;
  color: var(--font-color2-);
  font-size: 16px;
}
.tabSelector > button:hover {
  color: var(--blue-);
}
.tabSelector > button.active {
  color: var(--font-color1-);
}
/*  */
.mainZone {
  display: flex;
  justify-content: space-between;
  gap: 50px;
}
.tabContent {
  width: 67%;
}
/* profile */
.profileReview {
  display: flex;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--font-color3-);
  margin-bottom: 30px;
}
.profileReview:last-of-type {
  padding-bottom: 0;
  border: none;
}
.profileReview > .rightBlock {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.profileReview > .rightBlock > h2 {
  color: var(--font-color1-);
}

.profileReview > .rightBlock > div {
  display: flex;
  gap: 15px;
}

.bigCardsSection {
  display: flex;
  gap: 12px;
}
.sectionTitle > span {
  color: var(--font-color1-);
}
.bigCardsSection > .card {
  flex-shrink: 0;
}

.smallCardsSection {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.rightColumn {
  width: 25%;
}
/* film */

/*  */

.diaryContent {
  display: flex;
  gap: 25px;
}
.diaryContent svg {
  font-size: 25px;
}
.diaryContent > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.diaryMovies > p {
  color: var(--font-color3-);
  font-size: 14px;
  margin-top: 4px;
}

/*  */

.ratingContent {
  display: flex;
  align-items: flex-end;
  gap: 7px;
  /* height: 120px; */
  max-width: 100%;
  overflow-x: auto;
}
.ratingContent > div:last-child {
  /* border: solid 1px blue; */
  display: flex;
}
.ratingContent svg {
  color: var(--green-);
  font-size: 8px;
}

.barWrapper {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  /* height: 120px; */
  max-width: 100%;
  overflow-x: auto;
  /* border: solid 1px blue; */
}

.bar {
  width: 20px;
  background-color: var(--font-color3-);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  position: relative;
  border-radius: 2px 2px 0 0;
  transition: background-color 0.3s;
  cursor: default;
}

.bar:hover {
  background-color: var(--font-color2-);
  cursor: pointer;
}
</style>
