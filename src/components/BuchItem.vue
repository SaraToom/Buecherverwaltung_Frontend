<script setup lang="ts">
import StarRating from './StarRating.vue'

defineProps<{
  id: number
  titel: string
  autor: string
  genre: string
  releaseYear: number
  stars: number
  review: string
  isFavorite: boolean
  bookList: { id: number; name: string } | null
}>()
defineEmits(['delete-buch', 'toggle-favorite'])
</script>

<template>
  <div class="buch-karte">
    <div class="header">
      <h3>{{ titel }}</h3>
      <span v-if="isFavorite" class="fav-icon">★</span>
    </div>
    <p><strong>Autor:</strong> {{ autor }}</p>
    <p><strong>Genre:</strong> {{ genre }} ({{ releaseYear }})</p>
    <p v-if="bookList"><strong>Regal:</strong> <span class="list-badge">{{ bookList.name }}</span></p>
    <div class="stars-row">
      <StarRating :modelValue="stars ?? 0" :readonly="true" :size="20" class="stars-on-card" />
      <span class="stars-label">{{ stars && stars > 0 ? `${stars}/5` : 'Keine Bewertung' }}</span>
    </div>
    <p v-if="review"><em>"{{ review }}"</em></p>

    <div class="actions">
      <button @click="$emit('toggle-favorite')" class="btn-fav">
        {{ isFavorite ? 'Unfavorit' : 'Zu Favoriten' }}
      </button>
      <button @click="$emit('delete-buch')" class="btn-delete">Löschen 🗑️</button>
    </div>
  </div>
</template>

<style scoped>
.buch-karte {
  border: 2px solid white;
  padding: 15px;
  margin: 10px 0;
  border-radius: 10px;
  background-color: var(--primary-color);
  color: white;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
h3 {
  margin: 0;
  font-size: 1.1rem;
}
p {
  margin: 6px 0;
  font-size: 0.9rem;
}
.fav-icon {
  font-size: 1.5rem;
  color: gold;
}
.stars-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
}
.stars-label {
  font-size: 0.85rem;
  opacity: 0.85;
}
.actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}
.actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}
.btn-delete {
  background-color: var(--danger-color);
  color: white;
}
.btn-delete:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
.btn-fav {
  background-color: white;
  color: var(--primary-color);
  font-weight: bold;
}
.btn-fav:hover {
  background-color: #F0F0F0;
}
.list-badge {
  background-color: rgba(255, 255, 255, 0.25);
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: bold;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  display: inline-block;
  margin-left: 5px;
}
</style>
