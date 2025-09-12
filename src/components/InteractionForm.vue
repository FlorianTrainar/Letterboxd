<!-- components/UserInteractionForm.vue -->
<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuth } from '@/assets/JS/useAuth'
import axios from 'axios'

import StarRating from './StarRating.vue'

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

const hasReview = ref(false)

watch(
  () => props.reviewSaved,
  (newVal) => {
    if (newVal) {
      getUserInteraction()
    }
  },
)

const emit = defineEmits(['showReviewForm'])

const showReviewForm = () => {
  emit('showReviewForm')
}

const { loggedIn, user, token } = useAuth()

const rating = ref(0)
const interactionId = ref(null)

const currentInteraction = ref({})

// ✅ Obtenir l'interaction existante à l'initialisation
const getUserInteraction = async () => {
  if (!loggedIn.value) return

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
  }
}

// ✅ Fonction centrale de sauvegarde (POST ou PUT)
const saveInteractionField = async (field, value) => {
  if (!loggedIn.value) return

  // Vérifier existence interaction si non déjà fait
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
      // PUT
      await axios.put(
        `https://tranquil-confidence-b13331c5ed.strapiapp.com/api/interactions/${interactionId.value}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token.value}` },
        },
      )
    } else {
      // POST
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

    // ✅ Watched devient true automatiquement
    if (field !== 'watched' && !currentInteraction.value.watched) {
      // ⚠️ Attendre avant d’appeler pour éviter les conflits
      setTimeout(() => {
        saveInteractionField('watched', true)
      }, 100)
    }
  } catch (err) {
    console.error(`Erreur saveInteractionField (${field}):`, err.response?.data || err)
  }
}

// ✅ Gestion du rating
const saveRating = (newRating) => {
  saveInteractionField('rate', newRating)
}

// ✅ Gestion des boutons
const watched = () => {
  const newValue = !currentInteraction.value.watched
  saveInteractionField('watched', newValue)
}
const setWatchedTrue = () => {
  if (!currentInteraction.value.watched) {
    saveInteractionField('watched', true)
  }
}
const liked = () => {
  const newValue = !currentInteraction.value.liked
  saveInteractionField('liked', newValue)
}
const watchList = () => {
  const newValue = !currentInteraction.value.watchlist
  saveInteractionField('watchlist', newValue)
}
onMounted(getUserInteraction)
</script>

<template>
  <div class="interactionForm">
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
.interactionForm {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-bottom: 25px;
  border-radius: 20px;
  width: 250px;
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
</style>
