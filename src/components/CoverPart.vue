<script setup></script>
<template>
  <div class="cover">
    <img src="../assets/imgs/weapons-anatomy1-gmzt-videoSixteenByNine3000.webp" alt="" />
    <div class="greeting logOut">
      <h1>Track films you've watched.</h1>
      <h1>Save those you want to see</h1>
      <h1>Tell your friends what's good</h1>
      <button>Get started - it's free!</button>
      <p>The social netwok for film lovers. Also available on ...</p>
    </div>
    <div class="greeting logIn">
      <h1>Welcome back <span>FloLeGosseBeau.</span></h1>
      <h2>Here's what we've been watching...</h2>
    </div>
  </div>
</template>
<style scoped>
.cover {
  height: 720px;
}

.logOut {
  visibility: hidden;
}
.logIn {
}

.greeting {
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
.greeting > button {
  background-color: var(--green-);
  color: var(--font-color1-);
  font-size: 20px;
  font-weight: bold;
  padding: 10px 24px;
  border-radius: 6px;
  border: none;
  margin: 25px 0;
}

/* ---- */
</style>
