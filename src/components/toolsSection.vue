<script setup></script>
<template>
  <section>
    <p>LETTERBOXD LETS YOU...</p>
    <div>
      <div class="toolCard greenCard">
        <font-awesome-icon :icon="['fas', 'eye']" />
        <p>Keep track of every film you've ever watched (or just start from the day you join)</p>
      </div>
      <div class="toolCard orangeCard">
        <font-awesome-icon :icon="['fas', 'heart']" />
        <p>Show some love for your favorite films, lists and reviews with a "like"</p>
      </div>
      <div class="toolCard blueCard">
        <font-awesome-icon :icon="['fas', 'align-left']" />
        <p>Write and share reviews, and follow friends and other members to read theirs</p>
      </div>
      <div class="toolCard greenCard">
        <font-awesome-icon :icon="['fas', 'star']" />
        <p>rate each film on a five-star scale (with halves) to record and share your reaction</p>
      </div>
      <div class="toolCard orangeCard">
        <font-awesome-icon :icon="['fas', 'calendar']" />
        <p>Keep a diary of your film watching (and upgrade to Pro for comprehensive stats)</p>
      </div>
      <div class="toolCard blueCard">
        <font-awesome-icon :icon="['fas', 'film']" />
        <p>Compile and share lists of films on any topic and keep a watchlists of films to see</p>
      </div>
    </div>
  </section>
</template>
<style scoped>
section > div {
  display: flex;
  gap: 12px 0;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 14px;
}
.toolCard {
  background-color: var(--background-color2-);
  display: flex;
  gap: 20px;
  border-radius: 4px;
  width: 32.7%;
  flex-shrink: 0;
  padding: 20px;
}
.toolCard:hover {
  color: var(--font-color1-);
  cursor: pointer;
}
.greenCard:hover {
  background-color: var(--green-);
}
.orangeCard:hover {
  background-color: var(--orange-);
}
.blueCard:hover {
  background-color: var(--blue-);
}
.toolCard svg {
  font-size: 30px;
}
</style>
