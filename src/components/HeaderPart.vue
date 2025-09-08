<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { ref } from 'vue'
import { useModalStore } from '@/assets/JS/modalStore'

import { useAuth } from '@/assets/JS/useAuth'
import axios from 'axios'

const router = useRouter()
const modalStore = useModalStore()

const { loggedIn, login, logout, user } = useAuth()

const username = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  console.log('submit', {
    username: username.value,
    password: password.value,
  })
  isSubmitting.value = true
  if (username.value && password.value) {
    try {
      const response = await axios.post('http://localhost:1337/api/auth/local', {
        identifier: username.value,
        password: password.value,
      })
      console.log(response)

      // Récupère le token dans la réponse (ici supposé dans response.data.jwt)
      const token = response.data.jwt
      const user = response.data.user

      if ((token, user)) {
        login(token, user) // <-- enregistre le cookie + met à jour loggedIn
      } else {
        console.warn('Pas de token dans la réponse signup')
      }

      router.push({ name: 'home' })
      modalStore.closeLogin()
    } catch (error) {
      console.log(error.response.data.error)
      errorMessage.value = 'Une erreur est survenue'
    }
  } else {
    errorMessage.value = 'Veuillez remplir tous les champs'
  }

  isSubmitting.value = false
}
</script>
<template>
  <header>
    <div class="wrapper">
      <RouterLink :to="{ name: 'home' }">
        <img src="@/assets/imgs/letterboxd-vector-logo-cutout.png" />
      </RouterLink>

      <div class="headerMenu" v-if="!modalStore.showLoginForm">
        <button v-if="!loggedIn" @click="modalStore.openLogin">SIGN IN</button>
        <button v-if="!loggedIn" @click="modalStore.openSignup">CREATE ACCOUNT</button>

        <div v-if="loggedIn">
          <div class="userInfo">
            <div class="userIcon">
              <font-awesome-icon :icon="['fas', 'user']" />
            </div>
            <p v-if="user.username">{{ user.username.toUpperCase() }}</p>
            <font-awesome-icon :icon="['fas', 'chevron-down']" />
            <div class="toolBar">
              <button>Home</button>
              <button>Profile</button>
              <button>Film</button>
              <button>Reviews</button>

              <button @click="logout()">Sign Out</button>
            </div>
          </div>
          <font-awesome-icon :icon="['fas', 'bolt']" />
        </div>

        <p>FILMS</p>
        <p>LISTS</p>
        <p>MEMBERS</p>
        <p>JOURNAL</p>
        <form class="searchInput">
          <input type="text" name="" id="" />
          <button>
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
          </button>
        </form>
      </div>

      <form class="loginForm" v-if="modalStore.showLoginForm" @submit.prevent="handleSubmit">
        <button type="button" @click="modalStore.closeLogin">x</button>
        <div>
          <label for="username">Username</label>
          <input type="text" id="username" v-model="username" />
        </div>
        <div>
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" />
        </div>
        <button type="submit">SIGN IN</button>
      </form>
    </div>
  </header>
</template>
<style scoped>
header {
  color: #f2f4f6;

  height: 75px;
  width: 100%;
  position: absolute;
  z-index: 10;
}
.wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
img {
  height: 100px;
  max-width: 100%;
  object-fit: contain;
}
/* header menu */

.headerMenu {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--font-color2-);
}

.headerMenu p {
  font-size: 15px;
}
.headerMenu button {
  background: none;
  color: var(--font-color1-);
}
.searchInput {
  display: flex;
  padding: 8px 2px;
  border-radius: 20px;
  background-color: var(--background-color2-);
}

.searchInput input {
  background: none;
  border: none;
  outline: none;
  width: 100px;
}
.searchInput svg {
  color: var(--font-color2-);
}

/* User */

.headerMenu > div {
  display: flex;
  align-items: center;
  gap: 10px;
}
.userInfo {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-radius: 4px 4px 0 0;
  position: relative;
}
.userIcon {
  border: 1px solid var(--background-color2-);
  background-color: var(--background-color3-);
  border-radius: 50%;
  padding: 5px;
}
.userIcon svg {
  font-size: 16px;
}
.toolBar {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: var(--background-color4-);
  padding: 8px;
  border-radius: 0 0 4px 4px;
  display: none;
  white-space: nowrap;
  flex-direction: column;
  align-items: flex-start;
}
.toolBar > button {
  color: var(--background-color1-);
  width: 100%;
  text-align: left;
  padding: 4px 10px;
}
.toolBar > button:hover {
  background-color: var(--background-color2-);
  color: var(--font-color1-);
}
.userInfo:hover {
  cursor: pointer;
  background-color: var(--background-color4-);
  color: var(--font-color1-);
}
.userInfo:hover .toolBar {
  display: flex;
  cursor: pointer;
}
/* Login Menu */

.loginForm {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}
.loginForm label {
  color: var(--font-color3-);
}
.loginForm > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.loginForm input {
  background-color: var(--background-color2-);
  width: 180px;
  height: 32px;
  border-radius: 4px;
}
.loginForm > button {
  padding: 8px 14px;
}
.loginForm > button:first-of-type {
  background: none;
  color: var(--font-color3-);
  font-size: 20px;
}
.loginForm > button:last-of-type {
  background-color: var(--green-);
  color: var(--font-color1-);
  font-weight: bold;
}

/* Sign Up Menu */
</style>
