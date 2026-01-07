<script setup></script>
<template>
  <footer>
    <div class="wrapper">
      <h3>Made by <span>Florian Trainar</span> with :</h3>
      <div>
        <a href="https://vuejs.org/" target="_blank">VUE.JS</a>
        <a href="https://strapi.io/" target="_blank">STRAPI</a>
        <a href="https://supabase.com/" target="_blank">SUPABASE</a>
        <a href="https://www.netlify.com/" target="_blank">NETLIFY</a>
        <a href="https://developer.themoviedb.org/" target="_blank">TMDB</a>
      </div>
    </div>
  </footer>
</template>
<style scoped>
footer {
  height: 100px;
  background-color: var(--background-color2-);
  color: var(--font-color2-);
}
.wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
.wrapper > div {
  display: flex;
  gap: 10px;
}
a {
  background: none;
  font-family: var(--graphik-);
  color: var(--font-color1-);
  font-size: 17px;
  font-weight: bold;
}
a:hover {
  color: var(--blue-);
}
h3 {
  font-weight: bold;
  font-size: 20px;
}
span {
  color: var(--font-color1-);
}
span:hover {
  cursor: pointer;
  color: var(--blue-);
}

@media (max-width: 600px) {
  h3 {
    font-size: 16px;
  }
  a {
    font-size: 10px;
  }
}
</style>
