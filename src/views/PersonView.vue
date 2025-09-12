<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const route = useRoute()
const personId = route.params.id

const apiKey = import.meta.env.VITE_TMDB_API_KEY
const person = ref(null)
const credits = ref([])
const loading = ref(true)
const error = ref(null)

const roleSelected = ref('ACTOR')
const number = ref(null)

function setRole(role) {
  roleSelected.value = role
  fetchCreditsForRole(role)
}

async function fetchArtistData() {
  loading.value = true
  try {
    const [personRes, creditsRes] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/person/${personId}`, {
        params: {
          api_key: apiKey,
          language: 'fr', // Tu peux ajuster selon la langue de l'app
        },
      }),
      axios.get(`https://api.themoviedb.org/3/person/${personId}/combined_credits`, {
        params: {
          api_key: apiKey,
          language: 'fr',
        },
      }),
    ])

    person.value = personRes.data
    console.log(person.value)
    credits.value = creditsRes.data.cast.concat(creditsRes.data.crew)
  } catch (err) {
    console.error(err)
    error.value = 'Impossible de charger les données de l’artiste.'
  } finally {
    loading.value = false
  }
}

async function fetchCreditsForRole(role) {
  loading.value = true
  try {
    const res = await axios.get(
      `https://api.themoviedb.org/3/person/${personId}/combined_credits`,
      {
        params: {
          api_key: apiKey,
          language: 'fr',
        },
      },
    )

    let cast = res.data.cast || []
    let crew = res.data.crew || []

    let filtered = []

    if (role === 'ACTOR') {
      filtered = cast
    } else {
      filtered = crew.filter((credit) => credit.job?.toUpperCase() === role)
    }

    credits.value = filtered
      .filter((credit) => credit.poster_path)
      .sort((a, b) => b.vote_count - a.vote_count)
  } catch (err) {
    console.error(err)
    error.value = 'Impossible de charger les crédits.'
    credits.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchArtistData()
  await fetchCreditsForRole(roleSelected.value)
})
</script>

<template>
  <main>
    <div class="headerBackground"></div>
    <div class="wrapper">
      <div class="mainBlock">
        <div class="leftBlock">
          <div class="title">
            <h3>FILMS STARRING</h3>
            <h1>{{ person?.name }}</h1>
          </div>

          <div class="roleSelectWrapper">
            <div class="roleSelect">
              <h3>{{ roleSelected }} <FontAwesomeIcon :icon="['fas', 'chevron-down']" /></h3>
              <div class="roleSelectForm">
                <button @click="setRole('ACTOR')">
                  Actor <span>{{ number }}</span>
                </button>
                <button @click="setRole('DIRECTOR')">
                  Director <span>{{ number }}</span>
                </button>
                <button @click="setRole('WRITER')">
                  Writer <span>{{ number }}</span>
                </button>
                <button @click="setRole('COMPOSER')">
                  Composer <span>{{ number }}</span>
                </button>
                <button @click="setRole('PRODUCER')">
                  Producer <span>{{ number }}</span>
                </button>
              </div>
            </div>
          </div>
          <div class="movieList">
            <div v-if="loading">Chargement…</div>
            <div v-else-if="credits.length === 0">Aucun résultat trouvé pour ce rôle.</div>
            <div
              class="card"
              v-for="credit in credits"
              :key="`${credit.id}-${credit.job || credit.character || ''}`"
            >
              <RouterLink :to="{ name: 'movie', params: { id: credit.id } }">
                <img
                  :src="
                    credit.poster_path
                      ? `https://image.tmdb.org/t/p/w200${credit.poster_path}`
                      : '/placeholder.png'
                  "
                  :alt="credit.title || credit.name"
                />
              </RouterLink>
            </div>
          </div>
        </div>
        <div class="rightBlock">
          <img v-if="person" v-bind:src="`https://image.tmdb.org/t/p/w500${person.profile_path}`" />
          <p>{{ person?.biography }}</p>
        </div>
      </div>
    </div>
  </main>
</template>
<style scoped>
.mainBlock {
  margin: 40px 0;
  display: flex;
  justify-content: space-between;
  gap: 60px;
  /* border: solid 1px blue; */
}

.leftBlock {
  /* border: solid 1px red; */
  width: 720px;
}
.title {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}
.roleSelectWrapper {
  border-top: solid 1px var(--font-color3-);
  border-bottom: solid 1px var(--font-color3-);
  padding: 6px 0;
  width: 100%;
  height: 30px;
  display: flex;
  gap: 10px;

  position: relative;
}
.roleSelector:hover {
  background-color: var(--font-color3-);
}

.roleSelect {
  position: absolute;
  padding: 10px;
  top: -5px;
  left: -10px;
  border-radius: 4px 4px 0 0;
  z-index: 10;
}
.roleSelect:hover {
  background-color: var(--font-color3-);
}
.roleSelect h3 {
  color: var(--font-color3-);
}
.roleSelect:hover h3 {
  color: var(--font-color1-);
}
.roleSelectForm {
  display: none;
  padding-top: 14px;

  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}
.roleSelect:hover .roleSelectForm {
  display: flex;
}
.roleSelectForm button {
  padding: none;
  background: none;
  font-size: 16px;
  color: var(--background-color1-);
}
.roleSelectForm button:hover {
  color: var(--font-color1-);
}
.movieList {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.card {
  width: 134px;
  height: 196px;
}

/*  */

.rightBlock {
  width: 230px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.rightBlock > img {
  width: 230px;
  height: 345px;
  border-radius: 2%;
  border: solid 2px var(--background-color2-);
}
</style>
