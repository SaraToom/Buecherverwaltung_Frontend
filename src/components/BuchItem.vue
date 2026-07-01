<script setup>
// Props für die Buchinformationen
defineProps(['id', 'titel', 'autor', 'genre', 'releaseYear', 'stars', 'review', 'isFavorite', 'bookList'])
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