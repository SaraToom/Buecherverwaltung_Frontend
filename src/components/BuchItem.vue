<script setup>
// Props für die Buchinformationen
defineProps(['titel', 'autor', 'genre', 'isRead'])
</script>

<template>
  <div class="buch-karte">
    <h3>{{ titel }}</h3>
    <p><strong>Autor:</strong> {{ autor }}</p>
    <p><strong>Genre:</strong> {{ genre }}</p>
    <p><strong>Gelesen:</strong> {{ isRead ? 'Ja' : 'Nein' }}</p>
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
</style>