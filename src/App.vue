<script setup>
import { ref, onMounted } from 'vue'
import BuchItem from './components/BuchItem.vue';

const buecherListe = ref([])

// Eingabefelder im Formular
const neuerTitel = ref('')
const neuerAutor = ref('')
const neuesGenre = ref('')
const neuesReleaseYear = ref(new Date().getFullYear())
const neueStars = ref(5)
const neuesReview = ref('')
const neuerStatus = ref('Ungelesen')
const neuesIsFavorite = ref(false)

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

// Bücher vom Backend laden
const ladeBuecherVonBackend = async () => {
  try {
    const response = await fetch(`${backendUrl}/books`)
    if (!response.ok) {
      throw new Error('Netzwerk-Antwort war nicht ok')
    }
    buecherListe.value = await response.json()
    console.log("Erfolgreich geladene Bücher:", buecherListe.value)
  } catch (error) {
    console.error('Fehler beim Laden der Bücher aus dem Backend:', error)
  }
}

// Neues Buch hinzufügen
const speichereBuchInBackend = async () => {
  if (!neuerTitel.value.trim() || !neuerAutor.value.trim()) {
    alert('Bitte mindestens Buchtitel und Autor ausfüllen!')
    return
  }

  const neuesBuch = {
    title: neuerTitel.value,
    author: neuerAutor.value,
    genre: neuesGenre.value,
    releaseYear: neuesReleaseYear.value,
    stars: neueStars.value,
    review: neuesReview.value,
    status: neuerStatus.value,
    isFavorite: neuesIsFavorite.value
  }

console.log('Sende neues Buch an Backend:', neuesBuch)

  try {
    const response = await fetch(`${backendUrl}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(neuesBuch)
    })

    console.log('Antwort vom Backend:', response.status)

    if (response.ok) {
      console.log('Buch erfolgreich gespeichert:', response.status)
      // Formularfelder leeren
      neuerTitel.value = ''
      neuerAutor.value = ''
      neuesGenre.value = ''
      neuesReleaseYear.value = new Date().getFullYear()
      neueStars.value = 5
      neuesReview.value = ''
      neuerStatus.value = 'Ungelesen'
      neuesIsFavorite.value = false
      // Liste neu laden
      await ladeBuecherVonBackend()
    } else {
      console.error('Das Backend hat den Speicherbefehl abgelehnt. Status:', response.status)
    }
  } catch (error) {
    console.error('Netzwerkfehler beim Absenden an das Backend:', error)
  }
}

// Buch löschen
const deleteBuchVonBackend = async (id) => {
  if (!confirm('Möchtest du dieses Buch wirklich löschen?')) return

  try {
    const response = await fetch(`${backendUrl}/books/${id}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      await ladeBuecherVonBackend()
    } else {
      console.error('Fehler beim Löschen des Buches:', response.status)
    }
  } catch (error) {
    console.error('Netzwerkfehler beim Löschen:', error)
  }
}

// Favoriten-Status umschalten
const toggleFavoritInBackend = async (buch) => {
  const updatedBuch = { 
    ...buch, 
    isFavorite: !buch.isFavorite 
  }

  try {
    const response = await fetch(`${backendUrl}/books/${buch.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedBuch)
    })
    if (response.ok) {
      await ladeBuecherVonBackend()
    } else {
      console.error('Fehler beim Aktualisieren des Favoriten-Status:', response.status)
    }
  } catch (error) {
    console.error('Netzwerkfehler beim Aktualisieren:', error)
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
      <section class="form-section">
        <h2>Neues Buch hinzufügen</h2>
        <div class="form-group">
          <input v-model="neuerTitel" type="text" placeholder="Buchtitel" />
          <input v-model="neuerAutor" type="text" placeholder="Autor" />
          <div class="row">
            <input v-model="neuesGenre" type="text" placeholder="Genre" style="flex: 2" />
            <input v-model.number="neuesReleaseYear" type="number" placeholder="Jahr" style="flex: 1" />
          </div>
          <div class="row">
            <select v-model="neuerStatus">
              <option>Ungelesen</option>
              <option>Wird gelesen</option>
              <option>Abgebrochen</option>
              <option>Gelesen</option>
            </select>
            <select v-model.number="neueStars">
              <option v-for="n in 5" :key="n" :value="n">{{ n }} Sterne</option>
            </select>
          </div>
          <textarea v-model="neuesReview" placeholder="Deine Rezension..."></textarea>
          <label class="checkbox-label">
            <input type="checkbox" v-model="neuesIsFavorite" /> Favorit?
          </label>
          <button @click="speichereBuchInBackend">Buch speichern 💾</button>
        </div>
      </section>

      <hr />

      <h2>Deine Bücher</h2>
      <p v-if="buecherListe.length === 0" style="text-align: center;">
        Keine Bücher in der Cloud-Datenbank vorhanden. Füge oben eins hinzu!
      </p>

      <BuchItem 
        v-for="buch in buecherListe" 
        :key="buch.id" 
        :id="buch.id"
        :titel="buch.title"   
        :autor="buch.author"  
        :genre="buch.genre"
        :releaseYear="buch.releaseYear"
        :stars="buch.stars"
        :review="buch.review"
        :isFavorite="buch.isFavorite"
        :status="buch.status"
        @delete-buch="deleteBuchVonBackend(buch.id)"
        @toggle-favorite="toggleFavoritInBackend(buch)"
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
.form-section {
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.row {
  display: flex;
  gap: 10px;
}
.form-group input, .form-group select, .form-group textarea {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.form-group textarea {
  height: 60px;
  resize: vertical;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
}
.form-group button {
  padding: 10px;
  background-color: #D5B895;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.form-group button:hover {
  background-color: #c9a782;
}
hr {
  margin: 20px 0;
  border: 0;
  border-top: 1px solid #ccc;
}
</style>