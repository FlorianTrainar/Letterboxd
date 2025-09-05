<script setup></script>
<template>
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
</template>
<style scoped>
/* cover */
/* cover */
.cover {
  position: relative;

  width: 1200px;
  height: 720px;
  margin-bottom: 20px;
  /* border: solid 1px blue; */
}
.cover > img {
  object-fit: contain;
  width: 100%;
  height: 600px;

  -webkit-mask-image:
    linear-gradient(
      to right,
      rgba(0, 0, 0, 0) 2%,
      rgba(0, 0, 0, 0.2) 20%,
      rgba(0, 0, 0, 1) 40%,
      rgba(0, 0, 0, 0.2) 80%,
      rgba(0, 0, 0, 0) 98%
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
      rgba(0, 0, 0, 0) 2%,
      rgba(0, 0, 0, 0.2) 20%,
      rgba(0, 0, 0, 1) 40%,
      rgba(0, 0, 0, 0.2) 80%,
      rgba(0, 0, 0, 0) 98%
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
