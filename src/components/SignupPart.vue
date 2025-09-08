<script setup>
import { ref } from 'vue'

import { useSignup } from '@/assets/JS/useSignup'

const emit = defineEmits(['close'])

const username = ref('')
const email = ref('')
const password = ref('')

const { signup, isSubmitting, errorMessage } = useSignup()

const handleSubmit = async () => {
  const success = await signup({
    username: username.value,
    email: email.value,
    password: password.value,
  })
  if (success) {
    emit('close')
  }
}
</script>
<template>
  <main>
    <form @submit.prevent="handleSubmit">
      <div class="title">
        <h3>JOIN LETTERBOXD</h3>
        <button type="button" @click="emit('close')">X</button>
      </div>
      <div class="textInput">
        <label for="email">Email address</label>
        <input type="text" id="email" v-model="email" />
      </div>
      <div class="textInput">
        <label for="username">Username</label>
        <input type="text" v-model="username" id="username" />
      </div>
      <div class="textInput">
        <label for="password">Password</label>
        <input type="text" v-model="password" id="password" />
      </div>
      <div class="checkbox">
        <input type="checkbox" id="termsOfUse" v-model="termOfUse" />
        <label for="termsOfUse">
          I'm at least 16 years old and accept <span>the Terms of Use.</span></label
        >
      </div>
      <div class="checkbox">
        <input type="checkbox" id="privacyPolicy" v-model="privacyPolicy" />
        <label for="privacyPolicy"
          >I accept the <span>Privacy Policy</span> and consent to the processing of my personal
          information in accordance with it.</label
        >
      </div>
      <button>SIGN UP</button>
    </form>
  </main>
</template>
<style scoped>
main {
  background: none;
  position: relative;
  z-index: 2;
  margin: 20px auto;
}

form {
  background-color: var(--background-color2-);
  display: flex;
  flex-direction: column;
  padding: 22px 36px 26px 38px;
  border-radius: 4px;
  gap: 20px;
  width: 420px;
  height: 500px;
  position: fixed;
}
form div {
  display: flex;
}
form label,
form span {
  color: var(--font-color1-);
}
form input {
  background-color: var(--font-color2-);
  border: none;
  outline: none;
  border-radius: 4px;
}
form input[type='text']:focus {
  background-color: var(--font-color1-);
}

.title {
  justify-content: space-between;
  font-size: 18px;
  margin-bottom: 4px;
}
.title button {
  background: none;
  color: var(--font-color2-);
  font-size: 20px;
}
.textInput {
  flex-direction: column;
  gap: 8px;
}
.textInput > input {
  height: 30px;
}
.checkbox {
  align-items: flex-start;
  gap: 8px;
}
.checkbox > label {
  width: 100%;
}
.checkbox input[type='checkbox'] {
  appearance: none;
  width: 22px;
  height: 22px;
  cursor: pointer;
  position: relative;
}
.checkbox input[type='checkbox']:checked {
  background-color: var(--font-color1-);
}
.checkbox input[type='checkbox']:checked::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 6px;
  width: 6px;
  height: 12px;
  border: solid var(--background-color2-);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  background: transparent;
}
.checkbox > label {
  color: var(--font-color2-);
}
form > button {
  background-color: var(--green-);
  color: var(--font-color1-);
  width: fit-content;
  padding: 6px 12px;
  margin-top: 20px;
}
</style>
