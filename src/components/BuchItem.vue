<script setup>
// Props für die Buchinformationen
defineProps(['id', 'titel', 'autor', 'genre', 'releaseYear', 'stars', 'review', 'isFavorite', 'status'])
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
    <p><strong>Status:</strong> {{ status }}</p>
    <p><strong>Bewertung:</strong> {{ stars }} ⭐</p>
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
  background-color: #D5B895;
  color: white;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.fav-icon {
  font-size: 1.5rem;
  color: gold;
}
.actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}
.actions button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-delete {
  background-color: #ff4d4d;
  color: white;
}
.btn-fav {
  background-color: white;
  color: #D5B895;
}
</style>