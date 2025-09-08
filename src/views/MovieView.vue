<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'

import { useModalStore } from '@/assets/JS/modalStore'
const modalStore = useModalStore()

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

    movieInfos.value = movieData
    releaseYear.value = movieData.release_date.slice(0, 4)
    movieRate.value = movieData.vote_average / 2
    console.log('movieData >>>', movieRate.value)
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

    console.log(movieInfos)

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
      <div id="posterZone">
        <img
          v-if="movieInfos && movieInfos.poster_path"
          v-bind:src="`https://image.tmdb.org/t/p/w500${movieInfos.poster_path}`"
          :alt="movieInfos.title"
        />
      </div>

      <div class="mainZone">
        <section id="titleSec">
          <h1>{{ movieInfos.title }}</h1>
          <p>
            <span>{{ releaseYear }}</span> Directed by
            <span v-for="directors in movieCrew.directors" :key="directors.id">{{
              directors.name
            }}</span>
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
          </section>
          <section id="rateSec">
            <div>
              <button button @click="modalStore.openLogin">Sign in to log, rate, or review</button>
              <button>Share</button>
            </div>
            <div>
              <p>RATINGS</p>
              <span>{{ movieInfos.vote_count }} VOTES</span>
            </div>
            <div>
              <div class="stars">
                <font-awesome-icon v-for="i in 5" :key="i" :icon="starIcon(i)" />
              </div>
              <p>{{ Math.floor(movieRate * 10) / 10 }}</p>
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

.mainSection {
  border: solid yellow 2px;
  margin-bottom: 30px;
}

#titleSec {
  display: flex;
  gap: 10px;
  align-items: end;

  flex-wrap: wrap;
}

#titleSec span {
  text-decoration: underline;
  color: var(--font-color1-);
}
#titleSec > p {
  margin-bottom: 4px;
}

/*  */

/* Zone centrale */
.centerBlock {
  display: flex;
  gap: 50px;
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
  background-color: var(--background-color3-);
  color: var(--font-color2-);
  font-size: 14px;
  width: fit-content;

  padding: 6px;
  margin: 2px;
}
.tabContent button:hover {
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
#crewTab > div:first-of-type {
  /* border: solid 1px blue; */
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
#rateSec > div:nth-child(2) > span {
  color: var(--font-color3-);
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
#rateSec > div:last-of-type {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
#rateSec > div:last-of-type > p {
  font-size: 24px;
}
#rateSec .stars {
  display: flex;
  gap: 2px;
  color: var(--green-);
}
#rateSec .stars > svg {
  font-size: 22px;
}
</style>
