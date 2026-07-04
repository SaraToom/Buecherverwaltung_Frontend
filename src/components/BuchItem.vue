<script setup lang="ts">
import StarRating from './StarRating.vue'

interface BookList {
  id: number
  name: string
}

defineProps<{
  id: number
  titel: string
  autor: string
  genre: string
  releaseYear: number
  stars: number
  review: string
  isFavorite: boolean
  bookList: BookList | null
  bookLists: BookList[]
}>()

defineEmits<{
  'delete-buch': []
  'toggle-favorite': []
  'update-book-list': [listId: number | null]
}>()
</script>

<template>
  <div class="buch-karte">
    <div class="header">
      <h3>{{ titel }}</h3>
      <span v-if="isFavorite" class="fav-icon">★</span>
    </div>
    <p><strong>Autor:</strong> {{ autor }}</p>
    <p><strong>Genre:</strong> {{ genre }} ({{ releaseYear }})</p>
    <div class="list-selector-row">
      <label for="list-select" class="list-label"><strong>Regal:</strong></label>
      <select
        :id="`list-select-${id}`"
        :value="bookList?.id ?? ''"
        @change="(e) => $emit('update-book-list', e.target.value ? Number(e.target.value) : null)"
        class="list-select"
      >
        <option value="">(Keinem Regal)</option>
        <option v-for="list in bookLists" :key="list.id" :value="list.id">
          {{ list.name }}
        </option>
      </select>
    </div>
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
.list-selector-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}
.list-label {
  margin: 0;
}
.list-select {
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.list-select:hover {
  background-color: rgba(255, 255, 255, 0.25);
}
.list-select:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.7);
}
.list-select option {
  background-color: var(--primary-color);
  color: white;
}
</style>
