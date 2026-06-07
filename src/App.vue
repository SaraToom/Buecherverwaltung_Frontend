<script setup>
import { ref, onMounted } from 'vue'
import BuchItem from './components/BuchItem.vue';

const buecherListe = ref([])

// Eingabefelder im Formular
const neuerTitel = ref('')
const neuerAutor = ref('')
const neuesGenre = ref('')

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

// GET-Route: Bücher vom Backend laden
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

// POST-Route: Neues Buch hinzufügen
const speichereBuchInBackend = async () => {
  console.log("Eingegebener Titel:", neuerTitel.value)
  console.log("Eingegebener Autor:", neuerAutor.value)

  if (!neuerTitel.value || !neuerAutor.value) {
    alert('Bitte mindestens Buchtitel und Autor ausfüllen!')
    return
  }

  const neuesBuch = {
    title: String(neuerTitel.value),  // Sicherstellen, dass es als Text/String gesendet wird
    author: String(neuerAutor.value), // Sicherstellen, dass es als Text/String gesendet wird
    genre: String(neuesGenre.value),
    read: false
  }

  console.log("Sende folgendes JSON ans Backend:", JSON.stringify(neuesBuch))

  try {
    const response = await fetch(`${backendUrl}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(neuesBuch)
    })

    if (response.ok) {
      console.log("Buch erfolgreich im Backend gespeichert!")
      // Formularfelder leeren
      neuerTitel.value = ''
      neuerAutor.value = ''
      neuesGenre.value = ''
      await ladeBuecherVonBackend()
    } else {
      console.error('Das Backend hat den Speicherbefehl abgelehnt. Status:', response.status)
    }
  } catch (error) {
    console.error('Netzwerkfehler beim Absenden an das Backend:', error)
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
          <input v-model="neuesGenre" type="text" placeholder="Genre" />
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
        :titel="buch.title"   
        :autor="buch.author"  
        :genre="buch.genre"
        :isRead="buch.read"   
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
/* Einfaches Styling für das neue Formular */
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
.form-group input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
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