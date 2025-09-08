<script setup>
import { RouterView } from 'vue-router'
import HeaderPart from './components/HeaderPart.vue'

import SignupPart from './components/SignupPart.vue'
import { useModalStore } from './assets/JS/modalStore'

const modalStore = useModalStore()
</script>

<template>
  <HeaderPart />
  <RouterView />

  <!-- SignupPart toujours dispo, mais visible uniquement si activé -->
  <div>
    <div v-if="modalStore.showSignupForm" class="formOverlay"></div>
    <div class="formWrapper">
      <transition name="fade">
        <SignupPart v-if="modalStore.showSignupForm" @close="modalStore.closeSignup" />
      </transition>
    </div>
  </div>
</template>

<style scoped>
.formWrapper {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.formOverlay {
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8); /* Fond sombre */
}

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
</style>
