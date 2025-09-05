<script setup>
import { RouterLink } from 'vue-router'
</script>
<template>
  <header>
    <div class="wrapper">
      <RouterLink :to="{ name: 'home' }">
        <img src="@/assets/imgs/letterboxd-vector-logo-cutout.png" />
      </RouterLink>
      <div>
        <p>SIGN IN</p>
        <p>CREATE ACCOUNT</p>
      </div>
      <div>
        <p>FILMS</p>
        <p>LISTS</p>
        <p>MEMBERS</p>
        <p>JOURNAL</p>
        <form>(loupe)</form>
      </div>
    </div>
  </header>
</template>
<style scoped>
header {
  color: #f2f4f6;

  height: 75px;
  width: 100vw;
  position: absolute;
  z-index: 10;
}
.wrapper {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.wrapper > div {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 10px;
  /* border: 1px blue solid; */
}

img {
  height: 100px;
}
</style>
