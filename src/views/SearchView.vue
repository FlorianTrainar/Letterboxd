<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import axios from 'axios'

import { useRoute } from 'vue-router'
const route = useRoute()

import { useLoading } from '@/assets/JS/useLoading'
const { isLoading: showLoadingMessage, startLoading, stopLoading } = useLoading()

const query = ref(route.query.q || '')
const results = ref([])

const apiKey = import.meta.env.VITE_TMDB_API_KEY

const filter = ref('all')

const filteredResults = computed(() => {
  if (filter.value === 'all') return results.value
  if (filter.value === 'films') return results.value.filter((item) => item.type === 'movie')
  if (filter.value === 'persons') return results.value.filter((item) => item.type === 'person')
  return results.value
})

async function fetchResults() {
  startLoading()
  if (!query.value) return

  try {
    // 1. 🔍 Recherche de films
    const movieRes = await axios.get('https://api.themoviedb.org/3/search/movie', {
      params: {
        api_key: apiKey,
        query: query.value,
        page: 1,
      },
    })

    const movieResultsRaw = movieRes.data.results
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10)

    // 💡 Enrichir les films avec leur réalisateur
    const enrichedMovieResults = await Promise.all(
      movieResultsRaw.map(async (movie) => {
        const director = await fetchDirector(movie.id)
        return {
          ...movie,
          type: 'movie',
          director,
        }
      }),
    )

    // 2. 🔍 Recherche de personnes
    const personRes = await axios.get('https://api.themoviedb.org/3/search/person', {
      params: {
        api_key: apiKey,
        query: query.value,
        page: 1,
      },
    })

    const roleTranslation = {
      Acting: 'Acteur / Actrice',
      Directing: 'Réalisateur / Réalisatrice',
      Writing: 'Scénariste',
      Production: 'Producteur / Productrice',
      Sound: 'Compositeur / Compositrice',
    }

    const rawPersonResults = personRes.data.results.filter(
      (person) => person.known_for_department !== 'Camera',
    )

    // Supprimer les doublons de personnes par ID
    const uniquePersonsMap = new Map()

    for (const person of rawPersonResults) {
      if (!uniquePersonsMap.has(person.id)) {
        uniquePersonsMap.set(person.id, {
          ...person,
          type: 'person',
          mainRole: roleTranslation[person.known_for_department] || person.known_for_department,
        })
      }
    }

    const personResults = Array.from(uniquePersonsMap.values())
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 4)

    // 3. ✅ Fusion des résultats
    results.value = [...enrichedMovieResults, ...personResults]
  } catch (e) {
    console.error(e)
    results.value = []
  } finally {
    stopLoading()
  }
}

async function fetchDirector(movieId) {
  try {
    const { data } = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
      params: {
        api_key: apiKey,
        language: 'fr-FR',
      },
    })
    const director = data.crew.find((person) => person.job === 'Director')
    return director ? { name: director.name, id: director.id } : { name: 'Unknown', id: null }
  } catch (e) {
    console.error('Erreur fetchDirector', e)
    return { name: 'Unknown', id: null }
  }
}

onMounted(fetchResults)

// Gérer le cas où la recherche change sans recharger la page
watch(
  () => route.query.q,
  (newQuery) => {
    query.value = newQuery
    fetchResults()
  },
)
</script>
<template>
  <main>
    <div class="headerBackground"></div>
    <div class="wrapper">
      <div v-if="showLoadingMessage" class="pageLoader">
        <font-awesome-icon icon="spinner" spin />
      </div>

      <section class="resultSec">
        <div class="sectionTitle">
          <h3>SHOWING MATCHES FOR "{{ query.toUpperCase() }}" in :</h3>
          <button @click="filter = 'films'" :class="{ active: filter === 'films' }">FILMS</button>
          <button @click="filter = 'persons'" :class="{ active: filter === 'persons' }">
            PERSON
          </button>
          <button @click="filter = 'all'" :class="{ active: filter === 'all' }">ALL</button>
        </div>

        <div class="pageLoader" v-if="!results.length">Aucun résultat trouvé...</div>

        <div class="mainZone" v-else>
          <div class="movieBlock" v-for="item in filteredResults" :key="item.id + '-' + item.type">
            <!-- 🎬 Si c’est un film -->
            <template v-if="item.type === 'movie'">
              <RouterLink :to="{ name: 'movie', params: { id: item.id } }">
                <div class="card">
                  <img :src="`https://image.tmdb.org/t/p/w500${item.poster_path}`" />
                </div>
              </RouterLink>
              <div class="info">
                <RouterLink :to="{ name: 'movie', params: { id: item.id } }">
                  <h2 class="tiempoTitle">
                    {{ item.title }}
                    <span class="tiempoTitleSpan">
                      {{ item.release_date ? item.release_date.slice(0, 4) : 'N/A' }}
                    </span>
                  </h2>
                </RouterLink>
                <p class="tiempo">{{ item.overview }}</p>
                <p>
                  Directed by
                  <RouterLink
                    v-if="item.director && item.director.id"
                    :to="{ name: 'person', params: { id: item.director.id } }"
                    class="dirLink"
                  >
                    {{ item.director.name }}
                  </RouterLink>
                  <span v-else>{{ item.director?.name || 'Unknown' }}</span>
                </p>
              </div>
            </template>

            <!-- 👤 Si c’est une personne -->
            <template v-else-if="item.type === 'person'">
              <RouterLink :to="{ name: 'person', params: { id: item.id } }">
                <div class="card">
                  <img :src="`https://image.tmdb.org/t/p/w500${item.profile_path}`" />
                </div>
              </RouterLink>
              <div class="info">
                <RouterLink :to="{ name: 'person', params: { id: item.id } }">
                  <h2>{{ item.name }}</h2>
                </RouterLink>
                <p>{{ item.mainRole }}</p>
              </div>
            </template>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
<style scoped>
.resultSec {
  margin-top: 40px;
}
.sectionTitle {
  margin-bottom: 0;
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}
.sectionTitle > button {
  background: none;
  color: var(--font-color2-);
}
.sectionTitle > button:hover {
  color: var(--green-);
}
.sectionTitle > button.active {
  color: var(--font-color1-);
}
.mainZone {
  /* border: solid 2px blue; */
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.movieBlock {
  width: 48%;
  flex-shrink: 0;
  display: flex;
  gap: 14px;

  padding: 25px 0 40px;
  border-bottom: 1px solid var(--font-color3-);
  /* border: solid 1px red; */
}
.movieBlock > .info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.movieBlock a {
  text-decoration: none;
}

.dirLink {
  color: var(--font-color1-);
}
.dirLink:hover {
  color: var(--blue-);
}

.movieBlock h2 {
  font-size: 26px;
  color: var(--font-color1-);
}
.movieBlock h2:hover {
  color: var(--blue-);
}
.info > p {
  font-size: 15px;
  line-height: 17px;
}
</style>
