<script setup></script>
<template>
  <header>
    <div class="wrapper">
      <img src="../assets/imgs/letterboxd-vector-logo-cutout.png" />

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
  background-color: var(--background-color1-);
  color: #f2f4f6;

  height: 75px;
  width: 100vw;
  position: absolute;
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
