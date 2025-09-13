<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useAuth } from '@/assets/JS/useAuth'

const { user, token } = useAuth()

const likedMovies = ref([])
const likedMoviesInfo = ref([])

const watchlistMovies = ref([])
const watchlistMoviesInfo = ref([])

const watchedMovies = ref([])
const watchedMoviesInfo = ref([])

const reviewedMovies = ref([]) // tableau d'objets { filmID, review }
const reviewsWithMovieInfo = ref([])

const apiKey = import.meta.env.VITE_TMDB_API_KEY

onMounted(async () => {
  if (!user.value || !token.value) return

  try {
    // ✅ Une seule requête pour toutes les interactions
    const { data } = await axios.get(
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
        },
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      },
    )

    const interactions = data.data

    // LIKED (trié par date DESC)
    likedMovies.value = interactions
      .filter((i) => i.attributes.liked === true)
      .sort((a, b) => new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt))
      .map((i) => i.attributes.filmID)
      .filter((id) => Number.isInteger(id) && id > 1)

    // WATCHLIST (trié par date DESC)
    watchlistMovies.value = interactions
      .filter((i) => i.attributes.watchlist === true)
      .sort((a, b) => new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt))
      .map((i) => i.attributes.filmID)
      .filter((id) => Number.isInteger(id) && id > 1)

    // WATCHED (trié par date DESC)
    watchedMovies.value = interactions
      .filter((i) => i.attributes.watched === true)
      .sort((a, b) => new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt))
      .map((i) => i.attributes.filmID)
      .filter((id) => Number.isInteger(id) && id > 1)

    // REVIEWS (trié par date DESC)
    reviewedMovies.value = interactions
      .filter((i) => i.attributes.review && i.attributes.filmID > 1)
      .sort((a, b) => new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt))
      .map((i) => ({
        filmID: i.attributes.filmID,
        review: i.attributes.review,
      }))

    // Fonction pour interroger TMDB
    async function fetchMoviesInfo(movieIds) {
      const responses = await Promise.allSettled(
        movieIds.map((id) =>
          axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
            params: { api_key: apiKey, language: 'fr-FR' },
          }),
        ),
      )
      return responses.filter((r) => r.status === 'fulfilled').map((r) => r.value.data)
    }

    // Récupération des films depuis TMDB
    likedMoviesInfo.value = await fetchMoviesInfo(likedMovies.value)
    watchlistMoviesInfo.value = await fetchMoviesInfo(watchlistMovies.value)
    watchedMoviesInfo.value = await fetchMoviesInfo(watchedMovies.value)

    // Reviews + Movie Info
    const reviewFilmIDs = reviewedMovies.value.map((r) => r.filmID)
    const reviewMovies = await fetchMoviesInfo(reviewFilmIDs)

    reviewsWithMovieInfo.value = reviewedMovies.value.map((reviewObj) => {
      const movie = reviewMovies.find((m) => m.id === reviewObj.filmID)
      return {
        filmID: reviewObj.filmID,
        review: reviewObj.review,
        movie,
      }
    })

    // Logs utiles
    console.log('liked:', likedMoviesInfo.value)
    console.log('watchlist:', watchlistMoviesInfo.value)
    console.log('watched:', watchedMoviesInfo.value)
    console.log('reviewsWithMovieInfo:', reviewsWithMovieInfo.value)
  } catch (err) {
    console.error('Erreur lors de la récupération des interactions :', err)
  }
})
</script>

<template>
  <main>
    <div class="headerBackground"></div>

    <div class="wrapper">
      <section class="profileHeader">
        <div class="avatarZone">
          <div class="avatar">
            <font-awesome-icon :icon="['fas', 'user']" />
          </div>
          <h2>{{ user.username }}</h2>
          <button>EDIT PROFILE</button>
        </div>
        <div class="infoZone">
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
        <button>Profile</button>
        <button>Films</button>
        <button>Reviews</button>
        <button>Watchlist</button>
        <button>Likes</button>
      </section>
      <div class="mainZone">
        <div class="leftColumn">
          <div class="profileTab">
            <section class="profileWatchlist">
              <h3 class="sectionTitle">WATCHLIST</h3>
              <div class="bigCardsSection">
                <div class="card" v-for="movie in watchlistMoviesInfo.slice(0, 4)" :key="movie.id">
                  <img
                    v-bind:src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
                    :alt="movie.name"
                  />
                </div>
              </div>
              <div></div>
            </section>

            <section class="profileReviewSection">
              <h3 class="sectionTitle">RECENT REVIEWS</h3>
              <div
                class="profileReview"
                v-for="movie in reviewsWithMovieInfo.slice(0, 3)"
                :key="movie.id"
              >
                <div class="card smallCard">
                  <img
                    v-if="reviewsWithMovieInfo.length"
                    v-bind:src="`https://image.tmdb.org/t/p/w500${movie.movie.poster_path}`"
                    :alt="movie.movie.name"
                  />
                </div>
                <div>
                  <h3>{{ movie.movie.title }} {{ movie.movie.release_date.slice(0, 4) }}</h3>
                  <p>ETOILES COEUR</p>
                  <p>{{ movie.review }}</p>
                </div>
              </div>
            </section>

            <section class="profileLikes">
              <h3 class="sectionTitle">RECENT LIKES</h3>
              <div class="bigCardsSection">
                <div class="card" v-for="movie in likedMoviesInfo.slice(0, 4)" :key="movie.id">
                  <img
                    v-bind:src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
                    :alt="movie.name"
                  />
                </div>
              </div>
              <div></div>
            </section>
          </div>
        </div>
        <div class="rightColumn">
          <section>
            <h3 class="sectionTitle">DIARY</h3>
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
/*  */
.mainZone {
  display: flex;
  justify-content: space-between;
  gap: 50px;
}
.leftColumn {
  width: 67%;
}

.profileReview {
  display: flex;
}

.bigCardsSection {
  display: flex;
  justify-content: space-between;
}
.bigCardsSection > .card {
  flex-shrink: 0;
}

.rightColumn {
  width: 25%;
}
</style>
