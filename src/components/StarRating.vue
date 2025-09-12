<!-- components/StarRating.vue -->
<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
})

const emit = defineEmits(['update:model-value'])

const isSelected = computed(() => !isHovering.value && props.modelValue > 0)

// État local
const hoverValue = ref(0)
const isHovering = ref(false)

// Valeur affichée : survol ou note actuelle
const displayValue = computed(() => (isHovering.value ? hoverValue.value : props.modelValue))

// Icône dynamique selon la position
const starIcon = (index) => {
  const value = index + 1

  if (displayValue.value >= value) return ['fas', 'star'] // Pleine
  if (displayValue.value >= value - 0.5) return ['fas', 'star-half-stroke'] // Demi
  return ['far', 'star'] // Vide
}

// / Gestion clic / survol
const handleMouseMove = (event, index) => {
  const { left, width } = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - left
  const percent = x / width
  hoverValue.value = index + (percent < 0.5 ? 0.5 : 1)
  isHovering.value = true
}
const handleClick = () => {
  emit('update:model-value', hoverValue.value)
  isHovering.value = false
}

const handleLeave = () => {
  isHovering.value = false
}
</script>

<template>
  <h3>Rate</h3>
  <div class="stars" @mouseleave="handleLeave">
    <div
      v-for="(star, index) in 5"
      :key="index"
      class="starWrapper"
      @mousemove="(e) => handleMouseMove(e, index)"
      @click="handleClick"
    >
      <font-awesome-icon
        :icon="starIcon(index)"
        class="starIcon"
        :class="{ selected: isSelected }"
      />
    </div>
  </div>
</template>

<style scoped>
.stars {
  display: flex;
  gap: 4px;
  cursor: pointer;
  margin-bottom: 6px;
}
.starIcon {
  font-size: 32px;
  color: var(--blue-);
  transition:
    transform 0.2s ease,
    color 0.3s ease;
}
.starWrapper:hover .starIcon {
  transform: scale(1.2);
}
.starIcon.selected {
  color: var(--green-); /* Couleur après clic */
}
</style>
