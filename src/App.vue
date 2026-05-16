<script setup>
import { ref } from 'vue'
import BuchItem from './components/BuchItem.vue';

// Simuliert das Backend
const buecherListe = ref([
  { id: 1, titel: 'Harry Potter und der Stein der Weisen', autor: 'J.K. Rowling', genre: 'Fantasy', isRead: true
   },
  { id: 2, titel: '11 Minuten', autor: 'Paulo Coelho', genre: 'Roman', isRead: false },
  { id: 3, titel: 'Stolz und Vorurteil', autor: 'Jane Austen', genre: 'Klassiker', isRead: false },
  { id: 4, titel: 'The Housemaid', autor: 'Freida McFadden', genre: 'Thriller', isRead: true }
])

</script>

<template>
  <div class="container">
    <header>
      <h1>Meine Bücherverwaltung</h1>
    </header>

    <main>
      <BuchItem 
        v-for="buch in buecherListe" 
        :key="buch.id" 
        :titel="buch.titel" 
        :autor="buch.autor"
        :genre="buch.genre"
        :isRead="buch.isRead"
      />
    </main>
  </div>
</template>

<style>
.container {
  max-width: 600px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  padding: 20px;
}
header {
  text-align: center;
  margin-bottom: 30px;
}
h1 {
  color: #D5B895;
   -webkit-text-stroke: 0.9px white;
}
#app {
  background-color: #EBDDCC;
}
</style>