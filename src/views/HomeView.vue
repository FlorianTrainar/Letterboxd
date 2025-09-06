<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import CoverPart from '@/components/CoverPart.vue'

const movieList = ref([])

const apiKey = import.meta.env.VITE_TMDB_API_KEY
const randomPage = Math.floor(Math.random() * 25) + 1

onMounted(async () => {
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
    movieList.value = shuffled.slice(0, 6)

    console.log('Data >>>', data)

    movieList.value = data.results.slice(0, 24)
    console.log(movieList.value)
  } catch (error) {
    console.log('catch >>>', error)
  }
})
</script>
<template>
  <main>
    <CoverPart />
    <div class="wrapper">
      <section id="cardSection">
        <RouterLink
          :to="{ name: 'movie', params: { id: movies.id } }"
          v-for="(movies, index) in movieList.slice(0, 6)"
          :key="movies"
        >
          <div class="card">
            <img
              v-bind:src="`https://image.tmdb.org/t/p/w500${movies.poster_path}`"
              :alt="movies.name"
            />
            <!-- <p>{{ movies.vote_average.toFixed(1) }}</p> -->
            <!-- <p>{{ movies.vote_count }}</p> -->
            <!-- <p>{{ movies.id }}</p> -->
          </div>
        </RouterLink>
      </section>
      <section id="toolsSection">
        <p>LETTERBOXD LETS YOU...</p>
        <div>
          <div>
            <p>logo</p>
            <p>
              Keep track of every film you've ever watched (or just start from the day you join)
            </p>
          </div>
          <div>
            <p>logo</p>
            <p>Show some love for your favorite films, lists and reviews with a "like"</p>
          </div>
          <div>
            <p>logo</p>
            <p>Write and share reviews, and follow friends and other members to read theirs</p>
          </div>
          <div>
            <p>logo</p>
            <p>
              rate each film on a five-star scale (with halves) to record and share your reaction
            </p>
          </div>
          <div>
            <p>logo</p>
            <p>Keep a diary of your film watching (and upgrade to Pro for comprehensive stats)</p>
          </div>
          <div>
            <p>logo</p>
            <p>
              Compile and share lists of films on any topic and keep a watchlists of films to see
            </p>
          </div>
        </div>
      </section>
      <section id="reviewedSection">
        <div>
          <p>JUST REVIEWD...</p>
          <p>2,000,000 films watched</p>
        </div>
        <div>
          <div
            class="card"
            id="reviewedCard"
            v-for="(movies, index) in movieList.slice(7, 19)"
            :key="movies"
          >
            <img
              v-bind:src="`https://image.tmdb.org/t/p/w500${movies.poster_path}`"
              :alt="movies.name"
            />
          </div>
        </div>
      </section>
      <section id="shareSection">
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
#cardSection {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

#toolsSection > div {
  display: flex;
  gap: 12px 0;
  flex-wrap: wrap;
  justify-content: space-between;
}
#toolsSection > div > div {
  background-color: var(--background-color2-);
  display: flex;
  gap: 10px;
  border-radius: 4px;
  width: 32.7%;
  flex-shrink: 0;
  padding: 20px;
}

#reviewedSection > div:first-child {
  display: flex;
  justify-content: space-between;
  border-bottom: var(--font-color3-) 1px solid;
  margin-bottom: 20px;
}
#reviewedSection > div:nth-child(2) {
  display: flex;
  justify-content: space-between;
}
#reviewedCard > img {
  width: 81px;
  height: 116px;
}

/* --- */
</style>
