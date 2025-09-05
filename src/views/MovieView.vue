<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'

const apiKey = import.meta.env.VITE_TMDB_API_KEY
const movieInfos = ref({})
const movieDirector = ref({})
const topActors = ref([])
const releaseYear = ref({})

const activeTab = ref('CAST')
const tabs = ['CAST', 'CREW', 'DETAILS', 'GENRES', 'RELEASES']

const props = defineProps({
  id: { required: true },
})

onMounted(async () => {
  console.log(activeTab.value)
  try {
    const { data: movieData } = await axios.get(`https://api.themoviedb.org/3/movie/${props.id}`, {
      params: { api_key: apiKey, language: 'fr-FR' },
    })

    console.log('movieData >>>', movieData)
    movieInfos.value = movieData
    releaseYear.value = movieData.release_date.slice(0, 4)
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
    const director = creditsData.crew.find((person) => person.job === 'Director')

    console.log('Director:', director)
    console.log('Actors:', cast)

    movieDirector.value = director
    topActors.value = cast
  } catch (error) {
    console.error('Erreur crédits >>>', error)
  }
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
      <div id="posterZone">
        <img
          v-if="movieInfos && movieInfos.poster_path"
          v-bind:src="`https://image.tmdb.org/t/p/w500${movieInfos.poster_path}`"
          :alt="movieInfos.title"
        />
      </div>

      <div>
        <section id="titleSec">
          <h1>{{ movieInfos.title }}</h1>
          <p>
            <span>{{ releaseYear }}</span> Directed by <span>{{ movieDirector.name }}</span>
          </p>
        </section>

        <div class="centerBlock">
          <section id="infoSec">
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
                <button v-for="actors in topActors" :key="actors.name">{{ actors.name }}</button>
              </div>
              <div v-if="activeTab === 'CREW'">
                <p>DIRECTOR</p>
                <button>{{ movieDirector.name }}</button>
              </div>
            </div>
          </section>
          <section id="rateSec">
            <div>
              <button>Sign in to log, rate, or review</button>
              <button>Share</button>
            </div>
            <div>
              <p>RATINGS</p>
              <p>FANS</p>
            </div>
            <div>
              <p>SCHEMA ://::// ETOILES</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  </main>
</template>
<style scoped>
.cover {
  height: 450px;
  z-index: 0;
}
span {
  text-decoration: underline;
  color: var(--font-color1-);
}

.wrapper {
  display: flex;
  gap: 40px;
  z-index: 1;
}
#posterZone > img {
  width: 230px;
  height: 345px;
  border-radius: 10px;
  box-shadow: 0 0 2px black;
}

/* MAIN ZONE */

#titleSec {
  display: flex;
  gap: 10px;
  align-items: end;
  height: 50px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  /* border: solid green 1px; */
}
#titleSec > p {
  margin-bottom: 4px;
}

/*  */

/* Zone centrale */
.centerBlock {
  display: flex;
  /* border: solid 1px blue; */
  gap: 50px;
}
.centerBlock > section {
  /* border: solid yellow 2px; */
}

#infoSec {
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
.tabContent {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tabContent button {
  background-color: var(--background-color2-);
  color: var(--font-color2-);
  font-size: 14px;
  width: fit-content;
  padding: 6px;
}
.tabContent button:hover {
  color: var(--font-color1-);
}

/* --- */

#rateSec {
  /* border: solid 1px green; */
  flex: 5;
}
#rateSec > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-bottom: 25px;
}
#rateSec > div:nth-child(2) {
  display: flex;
  justify-content: space-between;
  padding-bottom: 4px;
  border-bottom: var(--font-color3-) 1px solid;
  margin-bottom: 25px;
}

#rateSec button {
  background-color: var(--background-color2-);
  color: var(--font-color2-);
  padding: 12px 15px;
}
#rateSec button:first-of-type {
  border-radius: 4px 4px 0 0;
}
#rateSec button:last-of-type {
  border-radius: 0 0 4px 4px;
}
</style>
