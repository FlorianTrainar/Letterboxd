<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const query = ref(route.query.q || '')
const results = ref([])
const loading = ref(false)
const apiKey = import.meta.env.VITE_TMDB_API_KEY

async function fetchResults() {
  if (!query.value) return

  loading.value = true
  try {
    const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
      params: {
        api_key: apiKey,
        query: query.value,
        page: 1,
      },
    })
    console.log('Réponse TMDB :', response.data) // ← Vérifie la structure

    results.value = response.data.results.sort((a, b) => b.popularity - a.popularity).slice(0, 20)
  } catch (e) {
    console.error(e)
    results.value = []
  } finally {
    loading.value = false
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
      <section class="resultSec">
        <div class="sectionTitle">SHOWING MATCHES FOR "{{ query.toUpperCase() }}"</div>

        <div v-if="loading">Chargement...</div>
        <div v-else-if="results.length === 0">Aucun résultat trouvé...</div>

        <div class="mainZone" v-else>
          <div class="movieBlock" v-for="movie in results" :key="movie.id">
            <RouterLink :to="{ name: 'movie', params: { id: movie.id } }">
              <div class="card">
                <img v-bind:src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`" />
              </div>
            </RouterLink>
            <div class="info">
              <RouterLink :to="{ name: 'movie', params: { id: movie.id } }">
                <h2>
                  {{ movie.title }}
                  <span> {{ movie.release_date ? movie.release_date.slice(0, 4) : 'N/A' }}</span>
                </h2>
              </RouterLink>
              <p>{{ movie.overview }}</p>
              <p>Directed by DIRECTOR</p>
            </div>
            <!-- {{ movie }} -->
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

.movieBlock h2 {
  font-size: 26px;
  color: var(--font-color1-);
}
.movieBlock h2:hover {
  color: var(--blue-);
}
.movieBlock span {
  font-size: 22px;
  color: var(--font-color3-);
}
</style>
