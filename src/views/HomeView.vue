<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'

const movieList = ref([])

onMounted(async () => {
  try {
    const { data } = await axios.get(`http://localhost:1337/api/movies?populate=*`)

    console.log('Data >>>', data)

    movieList.value = data.data
    console.log(movieList.value)
  } catch (error) {
    console.log('catch >>>', error)
  }
})
</script>
<template>
  <main>
    <div class="cover">
      <img src="../assets/imgs/weapons-anatomy1-gmzt-videoSixteenByNine3000.webp" alt="" />
      <div>
        <h1>Track films you've watched.</h1>
        <h1>Save those you want to see</h1>
        <h1>Tell your friends what's good</h1>
        <button>Get started - it's free!</button>
        <p>The social netwok for film lovers. Also available on ...</p>
      </div>
    </div>
    <div class="wrapper">
      <div>
        <section id="toWatch">
          <div class="card" v-for="(movies, index) in movieList.slice(0, 6)" :key="id">
            <img v-bind:src="movies.poster.url" :alt="movies.poster.name" />

            <!-- <p>{{ movie.poster.name }}</p> -->
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
<style scoped>
/* cover */
.cover {
  position: relative;

  width: 1200px;
  height: 700px;
}
.cover > img {
  object-fit: contain;
  width: 100%;
  height: 550px;

  -webkit-mask-image:
    linear-gradient(
      to right,
      rgba(0, 0, 0, 0) 15%,
      rgba(0, 0, 0, 0.2) 20%,
      rgba(0, 0, 0, 1) 40%,
      rgba(0, 0, 0, 0.2) 80%,
      rgba(0, 0, 0, 0) 85%
    ),
    linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 2%,
      rgba(0, 0, 0, 1) 30%,
      rgba(0, 0, 0, 1) 70%,
      rgba(0, 0, 0, 0) 98%
    );

  -webkit-mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-composite: intersect;

  mask-image:
    linear-gradient(
      to right,
      rgba(0, 0, 0, 0) 15%,
      rgba(0, 0, 0, 0.2) 20%,
      rgba(0, 0, 0, 1) 40%,
      rgba(0, 0, 0, 0.2) 80%,
      rgba(0, 0, 0, 0) 85%
    ),
    linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 2%,
      rgba(0, 0, 0, 1) 30%,
      rgba(0, 0, 0, 1) 70%,
      rgba(0, 0, 0, 0) 98%
    );

  mask-size: 100% 100%;
  mask-repeat: no-repeat;
  mask-composite: intersect;
}
.cover > div {
  position: absolute;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 50px;
}
.cover > div > button {
  margin: 25px 0;
}

/* ---- */

#toWatch {
  display: flex;
  justify-content: center;
  gap: 10px;
  width: 100%;

  border: green 1px solid;
  padding: 30px;
}
.wrapper > div {
}
</style>
