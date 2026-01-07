<script setup>
import { ref, watch } from 'vue'

import { useSignup } from '@/assets/JS/useSignup'

const emit = defineEmits(['close'])

const username = ref('')
const email = ref('')
const password = ref('')
const termOfUse = ref(false)
const privacyPolicy = ref(false)

const usernameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const termOfUseError = ref('')
const privacyPolicyError = ref('')

watch(username, (newVal) => {
  if (newVal) usernameError.value = ''
})
watch(email, (newVal) => {
  if (newVal) emailError.value = ''
})
watch(password, (newVal) => {
  if (newVal) passwordError.value = ''
})
watch(termOfUse, (newVal) => {
  if (newVal) termOfUseError.value = ''
})

watch(privacyPolicy, (newVal) => {
  if (newVal) privacyPolicyError.value = ''
})

const { signup, isSubmitting, errorMessage } = useSignup()

const handleSubmit = async () => {
  usernameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  termOfUseError.value = ''
  privacyPolicyError.value = ''

  let hasError = false

  if (!username.value) {
    usernameError.value = 'Username is required.'
    hasError = true
  }
  if (!email.value) {
    emailError.value = 'Email is required.'
    hasError = true
  }
  if (!password.value) {
    passwordError.value = 'Password is required.'
    hasError = true
  }
  if (!termOfUse.value) {
    termOfUseError.value = 'Please, accept the terms of use'
    hasError = true
  }
  if (!privacyPolicy.value) {
    privacyPolicyError.value = 'Please, accept the privacy policy'
    hasError = true
  }

  if (hasError) {
    return
  }

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
      {{ errorMessage }}
      <div class="title">
        <h3>JOIN LETTERBOXD</h3>
        <button type="button" @click="emit('close')">X</button>
      </div>
      <div class="textInput field">
        <label for="email">Email address</label>
        <input type="text" id="email" v-model="email" />
        <p class="errorMessage">{{ emailError }}</p>
      </div>
      <div class="textInput field">
        <label for="username">Username</label>
        <input type="text" v-model="username" id="username" />
        <p class="errorMessage">{{ usernameError }}</p>
      </div>
      <div class="textInput field">
        <label for="password">Password</label>
        <input type="text" v-model="password" id="password" />
        <p class="errorMessage">{{ passwordError }}</p>
      </div>
      <div class="checkbox field">
        <input type="checkbox" id="termsOfUse" v-model="termOfUse" />
        <label for="termsOfUse">
          I'm at least 16 years old and accept <span>the Terms of Use.</span></label
        >
        <p class="errorMessage">{{ termOfUseError }}</p>
      </div>
      <div class="checkbox field">
        <input type="checkbox" id="privacyPolicy" v-model="privacyPolicy" />
        <label for="privacyPolicy"
          >I accept the <span>Privacy Policy</span> and consent to the processing of my personal
          information in accordance with it.</label
        >
        <p class="errorMessage">{{ privacyPolicyError }}</p>
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
  /* height: 500px; */
  position: fixed;
}
form div {
  display: flex;
}
.field {
  position: relative;
  margin-bottom: 10px;
}
.errorMessage {
  color: var(--orange-);
  position: absolute;
  font-size: 14px;
  font-weight: bold;
  bottom: -25px;
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

/* ---- */
/* Media QUerries */
/* ---- */

@media (max-width: 600px) {
}
</style>
