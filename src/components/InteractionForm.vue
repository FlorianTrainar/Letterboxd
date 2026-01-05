<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

import StarRating from './StarRating.vue'

import { useAuth } from '@/assets/JS/useAuth'
const { loggedIn, user, token } = useAuth()

import { useLoading } from '@/assets/JS/useLoading'
const { showStrapiLoadingMessage, startLoading, stopLoading } = useLoading()

const props = defineProps({
  filmID: {
    type: [Number, String],
    required: true,
  },
  reviewSaved: {
    type: Boolean,
    default: () => {
      ref(false)
    },
  },
})
const emit = defineEmits(['showReviewForm'])
const showReviewForm = () => {
  emit('showReviewForm')
}

watch(
  () => props.reviewSaved,
  (newVal) => {
    if (newVal) {
      getUserInteraction()
    }
  },
)

const interactionId = ref(null)
const currentInteraction = ref({})

const hasReview = ref(false)
const rating = ref(0)
const manuallySetWatchedFalse = ref(false)

// Obtenir l'interaction existante
const getUserInteraction = async () => {
  if (!loggedIn.value) return

  startLoading()

  try {
    const res = await axios.get(
      'https://tranquil-confidence-b13331c5ed.strapiapp.com/api/interactions',
      {
        params: {
          filters: {
            filmID: parseInt(props.filmID),
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
      const attrs = data[0].attributes
      interactionId.value = data[0].id
      currentInteraction.value = attrs
      rating.value = attrs.rate || 0

      // ✅ ici : mise à jour correcte de hasReview
      hasReview.value = !!(attrs.review && attrs.review.trim().length > 0)
    } else {
      // ✅ Aucun enregistrement trouvé → reset
      interactionId.value = null
      currentInteraction.value = {}
      rating.value = 0
      hasReview.value = false
    }
  } catch (err) {
    console.error('Erreur getUserInteraction:', err)
  } finally {
    stopLoading()
  }
}

//  Sauvegarde de l'interaction (POST ou PUT)
const saveInteractionField = async (field, value, forceWatched = false) => {
  if (!loggedIn.value) return

  if (!interactionId.value) {
    try {
      const res = await axios.get(
        'https://tranquil-confidence-b13331c5ed.strapiapp.com/api/interactions',
        {
          params: {
            filters: {
              filmID: parseInt(props.filmID),
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
      }
    } catch (err) {
      console.error('Erreur de vérification interaction:', err)
    }
  }

  const payload = {
    data: {
      filmID: parseInt(props.filmID),
      userID: user.value.id,
      [field]: value,
    },
  }

  try {
    if (interactionId.value) {
      await axios.put(
        `https://tranquil-confidence-b13331c5ed.strapiapp.com/api/interactions/${interactionId.value}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token.value}` },
        },
      )
    } else {
      const res = await axios.post(
        `https://tranquil-confidence-b13331c5ed.strapiapp.com/api/interactions`,
        payload,
        {
          headers: { Authorization: `Bearer ${token.value}` },
        },
      )
      interactionId.value = res.data.data.id
    }

    currentInteraction.value[field] = value
    if (field === 'rate') rating.value = value
    if (field === 'review') hasReview.value = true

    // ✅ Si ce n’est pas une mise à jour de watched ou watchlist
    if (field !== 'watched' && field !== 'watchlist') {
      if (!currentInteraction.value.watched && !manuallySetWatchedFalse.value) {
        // 👉 L’utilisateur n’a pas bloqué watched, on le force à true
        setTimeout(() => {
          saveInteractionField('watched', true, true)
        }, 100)
      } else if (forceWatched) {
        // ✅ Si on avait bloqué watched mais que l'utilisateur a recliqué sur like/rate
        manuallySetWatchedFalse.value = false
      }
    }
  } catch (err) {
    console.error(`Erreur saveInteractionField (${field}):`, err.response?.data || err)
  }
}

// BOUTONS

const watched = async () => {
  const newValue = !currentInteraction.value.watched

  await saveInteractionField('watched', newValue)

  if (!newValue) {
    manuallySetWatchedFalse.value = true
    await Promise.all([saveInteractionField('liked', false), saveInteractionField('rate', null)])
  } else {
    manuallySetWatchedFalse.value = false
  }
}
const liked = () => {
  const newValue = !currentInteraction.value.liked
  manuallySetWatchedFalse.value = false
  saveInteractionField('liked', newValue)
}
const watchList = () => {
  const newValue = !currentInteraction.value.watchlist
  saveInteractionField('watchlist', newValue)
}
const saveRating = (newRating) => {
  manuallySetWatchedFalse.value = false
  saveInteractionField('rate', newRating)
}
onMounted(getUserInteraction)
</script>

<template>
  <div v-if="showStrapiLoadingMessage" class="loadingBanner">
    <font-awesome-icon icon="spinner" spin />
    <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />

    <div>
      <p>Le serveur est en cours de chargement</p>
      <p>Merci de patienter quelques instants</p>
    </div>
  </div>

  <div v-if="showStrapiLoadingMessage" class="interactionFormLoader">
    <font-awesome-icon icon="spinner" spin />
  </div>

  <div v-else class="interactionForm">
    <div class="interactZone">
      <div>
        <button @click="watched" class="watchBtn" :class="{ active: currentInteraction.watched }">
          <font-awesome-icon :icon="[currentInteraction.watched ? 'fas' : 'far', 'eye']" />
        </button>
        <p>{{ currentInteraction.watched ? 'Watched' : 'Watch' }}</p>
      </div>
      <div>
        <button @click="liked" class="likedBtn" :class="{ active: currentInteraction.liked }">
          <font-awesome-icon :icon="[currentInteraction.liked ? 'fas' : 'far', 'heart']" />
        </button>
        <p>{{ currentInteraction.liked ? 'Liked' : 'Like' }}</p>
      </div>
      <div>
        <button
          @click="watchList"
          class="watchlistBtn"
          :class="{ active: currentInteraction.watchlist }"
        >
          <font-awesome-icon :icon="[currentInteraction.watchlist ? 'fas' : 'far', 'clock']" />
        </button>
        <p>{{ currentInteraction.watchlist ? 'Remove' : 'Watchlist' }}</p>
      </div>
    </div>
    <div class="rateZone">
      <StarRating v-model="rating" @update:model-value="saveRating" />
    </div>
    <div>
      <button>Show your activity</button>
    </div>
    <div>
      <button @click="showReviewForm" :class="{ hasReview: hasReview }">
        {{ hasReview ? 'Edit or delete your review' : 'Review' }}
      </button>
    </div>
    <div>
      <button>Add to lists...</button>
    </div>
    <div>
      <button>Share</button>
    </div>
  </div>
</template>

<style scoped>
.interactionFormLoader {
  background-color: var(--background-color2-);
  color: var(--orange-);
  font-size: 20px;
  padding: 10px 12px;
  display: flex;
  justify-content: center;
  margin-bottom: 25px;
}
.interactionForm {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-bottom: 25px;
  border-radius: 20px;
  width: 250px;
  position: relative;
}
.interactionForm > div {
  background-color: var(--background-color2-);
  padding: 10px 12px;
  display: flex;
  justify-content: center;
}
.interactionForm button {
  background: none;
  color: var(--font-color2-);
}
.watchBtn.active {
  color: var(--green-);
}
.likedBtn.active {
  color: var(--orange-);
}
.watchlistBtn.active {
  color: var(--blue-);
}

.interactionForm button.hasReview {
  font-weight: bold;
  color: var(--green-);
}

.interactionForm p {
  font-size: 16px;
}
.interactionForm > div:first-of-type {
  border-radius: 4px 4px 0 0;
}
.interactionForm > div:last-of-type {
  border-radius: 0 0 4px 4px;
}

.interactionForm > .interactZone {
  display: flex;
}
.interactionForm > .interactZone > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  width: 33%;
}
.interactionForm > .interactZone svg {
  font-size: 28px;
}
.interactionForm > .rateZone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.interactionForm > .rateZone > div {
  display: flex;
  gap: 4px;
}
.interactionForm > .rateZone svg {
  font-size: 26px;
}

.loadingBanner {
  top: 75px;
  left: 0vw;
}
</style>
