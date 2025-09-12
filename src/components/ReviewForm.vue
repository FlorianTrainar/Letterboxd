<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useAuth } from '@/assets/JS/useAuth'

const props = defineProps({
  movie: {
    type: Object,
    required: true,
  },
})
const emit = defineEmits(['closeReviewForm', 'reviewSaved'])

const { loggedIn, user, token } = useAuth()
const review = ref('')
const interactionId = ref(null)
const currentInteraction = ref({})

const getUserInteraction = async () => {
  if (!loggedIn.value) return

  try {
    const res = await axios.get(
      'https://tranquil-confidence-b13331c5ed.strapiapp.com/api/interactions',
      {
        params: {
          filters: {
            filmID: parseInt(props.movie.id),
            userID: user.value.id,
          },
        },
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      },
    )

    const data = res.data.data
    if (data.length) {
      interactionId.value = data[0].id
      currentInteraction.value = data[0].attributes
      review.value = currentInteraction.value.review || ''
    }
  } catch (err) {
    console.error('Erreur getUserInteraction:', err)
  }
}
const saveInteractionField = async (field, value) => {
  if (!loggedIn.value) return

  const payload = {
    data: {
      filmID: parseInt(props.movie.id),
      userID: user.value.id,
      [field]: value,
    },
  }

  try {
    if (interactionId.value) {
      // PUT (update)
      await axios.put(
        `https://tranquil-confidence-b13331c5ed.strapiapp.com/api/interactions/${interactionId.value}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        },
      )
    } else {
      // POST (create)
      const res = await axios.post(
        `https://tranquil-confidence-b13331c5ed.strapiapp.com/api/interactions`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        },
      )
      interactionId.value = res.data.data.id
    }

    currentInteraction.value[field] = value
  } catch (err) {
    console.error(`Erreur saveInteractionField (${field}):`, err)
  }
}

const submitReview = () => {
  if (!review.value.trim()) {
    alert('Veuillez écrire une critique avant de sauvegarder.')
    return
  }
  saveInteractionField('review', review.value).then(() => {
    emit('reviewSaved')
    emit('closeReviewForm')
  })
}
const deleteReview = () => {
  review.value = '' // Vide le contenu localement

  saveInteractionField('review', '').then(() => {
    emit('reviewSaved')
    emit('closeReviewForm')
  })
}

onMounted(() => {
  getUserInteraction()
})
</script>
<template>
  <div class="form">
    <div class="header">
      <h3>I watched...</h3>
      <button @click="emit('closeReviewForm')">X</button>
    </div>
    <div class="main">
      <div class="poster">
        <img
          :src="`https://image.tmdb.org/t/p/w500${props.movie.poster_path}`"
          :alt="props.movie.title"
        />
      </div>
      <div class="rightBlock">
        <h2>
          {{ props.movie.title }}
          <span v-if="movie.release_date">{{ props.movie.release_date?.slice(0, 4) }}</span>
        </h2>
        <textarea rows="15" col="10" placeholder="add a review" v-model="review" />
        <div>
          <button @click="deleteReview">delete</button>
          <button @click="submitReview">save</button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.form {
  width: 800px;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color2-);
}
.form > div {
  display: flex;
  padding: 20px;

  /* border: yellow solid 1px; */
}
.header {
  justify-content: space-between;
  align-items: center;
  height: 56px;
  border-bottom: 1px solid var(--background-color3-);
}
.header h3 {
  color: var(--font-color1-);
  font-size: 22px;
}
.header button {
  background: none;
  color: var(--font-color2-);
  font-size: 20px;
}

/* MAIN */
.main {
  border-bottom: 1px solid var(--background-color3-);
}
.main > div {
}
.poster {
  flex: 1;
}
.poster img {
  width: 156px;
}
.rightBlock {
  flex: 3;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.rightBlock > h2 {
  color: var(--font-color1-);
}
.rightBlock span {
  font-size: 20px;
  color: var(--font-color2-);
}

.rightBlock button {
  align-self: flex-end;
  margin-right: 10px;
  background-color: var(--green-);
  color: var(--font-color1-);
  padding: 6px 12px;
  font-size: 16px;
}

.main textarea {
  width: 100%;
  height: 60%;
  font-size: 16px;
  border-radius: 4px;
  outline: none;
  background-color: var(--background-color4-);
}

.main textarea:focus {
  background-color: var(--font-color1-);
}

/*  */
</style>
