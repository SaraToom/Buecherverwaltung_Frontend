<script setup>
import { ref, onMounted } from 'vue'
import BuchItem from './components/BuchItem.vue';

const buecherListe = ref([])

// Holt URL von Render 
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

const ladeBuecherVonBackend = async () => {
  try {
    // Ruft Spring Boot Controller auf und lädt Bücherliste
    const response = await fetch(`${backendUrl}/books`)
    if (!response.ok) {
      throw new Error('Netzwerk-Antwort war nicht ok')
    }
    buecherListe.value = await response.json()
  } catch (error) {
    console.error('Fehler beim Laden der Bücher aus dem Backend:', error)
  }
}

onMounted(() => {
  ladeBuecherVonBackend()
})
</script>

<template>
  <div class="container">
    <header>
      <h1>Meine Bücherverwaltung</h1>
    </header>

    <main>
      <p v-if="buecherListe.length === 0" style="text-align: center;">
        Lade Bücher aus dem Cloud-Backend... (Falls das Backend schläft, kann das kurz dauern)
      </p>

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