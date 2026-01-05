<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { ref } from 'vue'
import { useModalStore } from '@/assets/JS/modalStore'

import { useAuth } from '@/assets/JS/useAuth'
import axios from 'axios'

const router = useRouter()
const modalStore = useModalStore()

const { loggedIn, login, logout, user } = useAuth()

import { useLoading } from '@/assets/JS/useLoading'
const { showStrapiLoadingMessage, startLoading, stopLoading } = useLoading()

const showAlert = () => {
  alert("Cette fonctionnalité n'est pas encore disponible.")
}

const username = ref('Test')
const password = ref('Azerty1234')

const errorMessage = ref('')

const searchQuery = ref('')
const isSearchFocused = ref(false)

function submitSearch() {
  if (searchQuery.value.trim()) {
    router.push({ name: 'search', query: { q: searchQuery.value.trim() } })
  }
}

const handleSubmit = async () => {
  startLoading()
  console.log('submit', {
    username: username.value,
    password: password.value,
  })
  if (username.value && password.value) {
    try {
      const response = await axios.post(
        'https://tranquil-confidence-b13331c5ed.strapiapp.com/api/auth/local',
        {
          identifier: username.value,
          password: password.value,
        },
      )
      console.log(response)

      // Récupère le token dans la réponse (ici supposé dans response.data.jwt)
      const token = response.data.jwt
      const user = response.data.user

      if ((token, user)) {
        login(token, user) // <-- enregistre le cookie + met à jour loggedIn
      } else {
        console.warn('Pas de token dans la réponse signup')
      }

      modalStore.closeLogin()
    } catch (error) {
      console.log(error.response.data.error)
      errorMessage.value = 'Une erreur est survenue'
    }
  } else {
    errorMessage.value = 'Veuillez remplir tous les champs'
  }

  stopLoading()
}

const handleLogout = () => {
  router.push({ name: 'home' })
  logout()
}
</script>
<template>
  <header>
    <div v-if="showStrapiLoadingMessage" class="loadingBanner">
      <font-awesome-icon icon="spinner" spin />
      <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />

      <div>
        <p>Le serveur est en cours de chargement</p>
        <p>Merci de patienter quelques instants</p>
      </div>
    </div>

    <div class="wrapper">
      <RouterLink :to="{ name: 'home' }">
        <img src="@/assets/imgs/letterboxd-vector-logo-cutout.png" />
      </RouterLink>

      <div class="headerMenu" v-if="!modalStore.showLoginForm">
        <div v-if="loggedIn">
          <div class="userInfo">
            <div class="userIcon">
              <font-awesome-icon :icon="['fas', 'user']" />
            </div>
            <p v-if="user.username">{{ user.username.toUpperCase() }}</p>
            <font-awesome-icon :icon="['fas', 'chevron-down']" />
            <div class="toolBar">
              <RouterLink :to="{ name: 'home' }" class="btn"> Home </RouterLink>
              <RouterLink :to="{ name: 'profile', params: { id: user.id } }" class="btn">
                Profile
              </RouterLink>

              <RouterLink
                :to="{ name: 'profile', params: { id: user.id }, query: { tab: 'films' } }"
                class="btn"
              >
                Films
              </RouterLink>
              <RouterLink
                :to="{ name: 'profile', params: { id: user.id }, query: { tab: 'reviews' } }"
                class="btn"
              >
                Reviews
              </RouterLink>
              <RouterLink
                :to="{ name: 'profile', params: { id: user.id }, query: { tab: 'watchlist' } }"
                class="btn"
              >
                Watchlist
              </RouterLink>

              <button @click="handleLogout()" class="btn">Sign Out</button>
            </div>
          </div>
        </div>

        <button v-if="!loggedIn" @click="modalStore.openLogin">SIGN IN</button>
        <button v-if="!loggedIn" @click="modalStore.openSignup">CREATE ACCOUNT</button>

        <button class="workInProgress" @click="showAlert">FILMS</button>
        <button class="workInProgress" @click="showAlert">LISTS</button>
        <button class="workInProgress" @click="showAlert">MEMBERS</button>
        <button class="workInProgress" @click="showAlert">JOURNAL</button>
        <form
          class="searchInput"
          :class="{ focused: isSearchFocused }"
          @submit.prevent="submitSearch"
        >
          <input
            type="text"
            v-model="searchQuery"
            @focus="isSearchFocused = true"
            @blur="isSearchFocused = false"
            @keyup.enter="submitSearch"
          />
          <button>
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
          </button>
        </form>
      </div>

      <Transition name="fade">
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
      </Transition>
    </div>
  </header>
</template>
<style scoped>
header {
  color: #f2f4f6;

  height: var(--header-height-);
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
  gap: 2px;
}

.headerMenu button {
  font-size: 15px;
  color: var(--font-color2-);
  font-family: var(--graphik-);
  font-weight: bold;
  background: none;
}
.headerMenu > .workInProgress {
  color: var(--font-color3-);
}

/*  */
.searchInput {
  display: flex;
  padding: 8px 2px;
  border-radius: 20px;
  background-color: var(--background-color3-);
  transition: background-color 0.3s ease;
}
.searchInput input {
  background: none;
  border: none;
  outline: none;
  width: 100px;
  color: var(--font-color3-);
}
.searchInput svg {
  color: var(--font-color2-);
}

.searchInput.focused {
  background-color: var(--font-color1-);
}
.searchInput.focused input,
.searchInput.focused svg {
  color: var(--background-color1-);
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
  gap: 6px;
  padding: 4px 6px;
  border-radius: 4px 4px 0 0;
  position: relative;
  font-family: var(--graphik-);
  font-weight: bold;
  color: var(--font-color2-);
}
.userInfo > svg {
  align-self: center;
  margin-bottom: 3px;
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
  gap: 4px;
  align-items: flex-start;
}
.toolBar > .btn {
  color: var(--background-color1-);
  width: 100%;
  text-align: left;
  padding: 4px 10px;
  text-decoration: none;
  font-size: 15px;
  font-family: var(--graphik-);
}
.toolBar > .btn:hover {
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

.fade-enter-active,
.fade-leave-active {
  transition:
    transform 0.5s ease,
    opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

.loginForm {
  position: absolute;
  right: 210px;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  background-color: var(--background-color1-);
  padding: 10px 12px;
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
  color: var(--font-color2-);
  font-family: var(--tiempos-);
  width: 180px;
  height: 32px;
  border-radius: 4px;
  outline: none;
}
.loginForm input:focus {
  background-color: var(--font-color1-);
  color: var(--background-color1-);
}

.loginForm > button:first-of-type {
  background: none;
  color: var(--font-color3-);
  font-size: 26px;
  padding: 4px 4px;
}
.loginForm > button:last-of-type {
  background-color: var(--green-);
  color: var(--font-color1-);
  font-weight: bold;
  padding: 8px 14px;
}

button:hover {
  color: var(--font-color1-);
}
</style>
