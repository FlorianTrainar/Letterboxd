<script setup>
import { useAuth } from '@/assets/JS/useAuth'

const { user, loggedIn } = useAuth()
</script>
<template>
  <main>
    <div class="headerBackground"></div>
    <div class="wrapper">
      <div class="profileHeader">
        <div>
          <font-awesome-icon :icon="['fas', 'user']" />

          <p>{{ user.username }}</p>
          <button>EDIT PROFILE</button>
        </div>
        <div></div>
      </div>
      <!-- <h1>COucou !</h1> -->
    </div>
  </main>
</template>
<style scoped></style>
