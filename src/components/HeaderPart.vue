<script setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import SignupPart from '@/components/SignupPart.vue'

const showModal = ref(false)
const closeModal = () => {
  showModal.value = false
}
</script>
<template>
  <header>
    <div class="wrapper">
      <RouterLink :to="{ name: 'home' }">
        <img src="@/assets/imgs/letterboxd-vector-logo-cutout.png" />
      </RouterLink>
      <div>
        <button>SIGN IN</button>
        <button @click="showModal = true">CREATE ACCOUNT</button>
      </div>
      <div>
        <p>FILMS</p>
        <p>LISTS</p>
        <p>MEMBERS</p>
        <p>JOURNAL</p>
        <form>
          <input type="text" name="" id="" />
          <button>
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
          </button>
        </form>
      </div>
    </div>
    <SignupPart v-if="showModal" @close="closeModal" />
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
p {
  font-size: 15px;
}
button {
  background: none;
  color: var(--font-color1-);
}
img {
  height: 100px;
}
form {
  display: flex;
  padding: 8px 2px;
  border-radius: 20px;
  background-color: var(--background-color2-);
}

form input {
  background: none;
  border: none;
  outline: none;
}
form svg {
  color: var(--font-color2-);
}
</style>
