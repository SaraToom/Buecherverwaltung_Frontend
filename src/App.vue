<script setup>
import { ref, onMounted, computed } from 'vue'
import BuchItem from './components/BuchItem.vue';

const buecherListe = ref([])
const listen = ref([])

// Eingabefelder im Formular
const neuerTitel = ref('')
const neuerAutor = ref('')
const neuesGenre = ref('')
const neuesReleaseYear = ref(new Date().getFullYear())
const neueStars = ref(5)
const neuesReview = ref('')
const neuerStatus = ref('Ungelesen')
const neuesIsFavorite = ref(false)
const ausgewaehltesListId = ref('') // Für das Zuweisen beim Erstellen

// Listenauswahl in der Sidebar für die Filterung
const ausgewaehlteListeId = ref(null) // null = Alle Bücher
const neueListeName = ref('')

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

// Listen vom Backend laden
const ladeListenVonBackend = async () => {
  try {
    const response = await fetch(`${backendUrl}/lists`)
    if (!response.ok) {
      throw new Error('Netzwerk-Antwort war nicht ok')
    }
    listen.value = await response.json()
    console.log("Erfolgreich geladene Listen:", listen.value)
  } catch (error) {
    console.error('Fehler beim Laden der Listen aus dem Backend:', error)
  }
}

// Neue Liste hinzufügen
const speichereListeInBackend = async () => {
  if (!neueListeName.value.trim()) return

  const neueListe = {
    name: neueListeName.value.trim()
  }

  try {
    const response = await fetch(`${backendUrl}/lists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(neueListe)
    })

    if (response.ok) {
      neueListeName.value = ''
      await ladeListenVonBackend()
    } else {
      const errorText = await response.text()
      alert('Fehler beim Erstellen der Liste: ' + errorText)
    }
  } catch (error) {
    console.error('Fehler beim Erstellen der Liste:', error)
  }
}

// Liste löschen
const deleteListeVonBackend = async (id) => {
  if (!confirm('Möchtest du diese Liste wirklich löschen? Die zugeordneten Bücher bleiben erhalten.')) return

  try {
    const response = await fetch(`${backendUrl}/lists/${id}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      if (ausgewaehlteListeId.value === id) {
        ausgewaehlteListeId.value = null
      }
      await ladeListenVonBackend()
      await ladeBuecherVonBackend() // Bücher neu laden, da sich deren Liste-ID geändert hat (wurde null gesetzt)
    } else {
      console.error('Fehler beim Löschen der Liste:', response.status)
    }
  } catch (error) {
    console.error('Netzwerkfehler beim Löschen der Liste:', error)
  }
}

// Buch count ermitteln
const getBookCountForList = (listId) => {
  return buecherListe.value.filter(b => b.bookList && b.bookList.id === listId).length
}

// Bücher filtern basierend auf ausgewählter Liste
const gefilterteBuecher = computed(() => {
  if (ausgewaehlteListeId.value === null) {
    return buecherListe.value
  }
  return buecherListe.value.filter(b => b.bookList && b.bookList.id === ausgewaehlteListeId.value)
})

// Neues Buch hinzufügen
const speichereBuchInBackend = async () => {
  if (!neuerTitel.value.trim() || !neuerAutor.value.trim()) {
    alert('Bitte mindestens Buchtitel und Autor ausfüllen!')
    return
  }

  const listObject = ausgewaehltesListId.value ? { id: Number(ausgewaehltesListId.value) } : null

  const neuesBuch = {
    title: neuerTitel.value,
    author: neuerAutor.value,
    genre: neuesGenre.value,
    releaseYear: neuesReleaseYear.value,
    stars: neueStars.value,
    review: neuesReview.value,
    status: neuerStatus.value,
    isFavorite: neuesIsFavorite.value,
    bookList: listObject
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
      ausgewaehltesListId.value = ''
      // Liste neu laden
      await ladeBuecherVonBackend()
    } else {
      const errorText = await response.text()
      console.error('Das Backend hat den Speicherbefehl abgelehnt. Status:', response.status, 'Nachricht:',errorText)
      alert('Fehler beim Speichern des Buches: ' + errorText)
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
  ladeListenVonBackend()
})
</script>

<template>
  <div class="container">
    <header>
      <h1>Meine Bücherverwaltung</h1>
    </header>

    <div class="app-layout">
      <!-- Sidebar / List Manager -->
      <aside class="sidebar">
        <h2>Bücherregale</h2>
        <div class="list-group">
          <div 
            class="list-item" 
            :class="{ active: ausgewaehlteListeId === null }"
            @click="ausgewaehlteListeId = null"
          >
            <span>Alle Bücher</span>
            <span class="count-badge">{{ buecherListe.length }}</span>
          </div>
          
          <div 
            v-for="list in listen" 
            :key="list.id"
            class="list-item"
            :class="{ active: ausgewaehlteListeId === list.id }"
            @click="ausgewaehlteListeId = list.id"
          >
            <span class="list-name">{{ list.name }}</span>
            <div class="list-item-right">
              <span class="count-badge">{{ getBookCountForList(list.id) }}</span>
              <button @click.stop="deleteListeVonBackend(list.id)" class="btn-delete-list" title="Liste löschen">×</button>
            </div>
          </div>
        </div>

        <div class="new-list-form">
          <input 
            v-model="neueListeName" 
            type="text" 
            placeholder="Neues Regal..." 
            @keyup.enter="speichereListeInBackend" 
          />
          <button @click="speichereListeInBackend" title="Regal hinzufügen">＋</button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
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
            <div class="row">
              <select v-model="ausgewaehltesListId" class="select-list">
                <option value="">(Keinem Regal zugeordnet)</option>
                <option v-for="list in listen" :key="list.id" :value="list.id">
                  Regal: {{ list.name }}
                </option>
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

        <h2>
          {{ ausgewaehlteListeId === null ? 'Deine Bücher' : 'Bücher in Liste: ' + listen.find(l => l.id === ausgewaehlteListeId)?.name }}
        </h2>
        
        <p v-if="gefilterteBuecher.length === 0" style="text-align: center; color: #666; margin-top: 20px;">
          Keine Bücher in dieser Liste vorhanden.
        </p>

        <BuchItem 
          v-for="buch in gefilterteBuecher" 
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
          :bookList="buch.bookList"
          @delete-buch="deleteBuchVonBackend(buch.id)"
          @toggle-favorite="toggleFavoritInBackend(buch)"
        />
      </main>
    </div>
  </div>
</template>

<style>
.container {
  max-width: 950px;
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
  min-height: 100vh;
}
.app-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
}
@media (max-width: 768px) {
  .app-layout {
    grid-template-columns: 1fr;
  }
}
.sidebar {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  align-self: start;
}
.sidebar h2 {
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 15px;
  color: #555;
  border-bottom: 2px solid #EBDDCC;
  padding-bottom: 8px;
}
.list-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
  user-select: none;
  font-size: 0.95rem;
  font-weight: 500;
  color: #495057;
}
.list-item:hover {
  background-color: #e9ecef;
  transform: translateX(3px);
}
.list-item.active {
  background-color: #D5B895;
  color: white;
}
.list-item-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.count-badge {
  background-color: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: bold;
}
.list-item.active .count-badge {
  background-color: rgba(255, 255, 255, 0.3);
  color: white;
}
.btn-delete-list {
  background: none;
  border: none;
  color: #ced4da;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
  transition: color 0.15s ease;
}
.btn-delete-list:hover {
  color: #ff4d4d;
}
.list-item.active .btn-delete-list {
  color: rgba(255, 255, 255, 0.6);
}
.list-item.active .btn-delete-list:hover {
  color: white;
}
.new-list-form {
  display: flex;
  gap: 5px;
  margin-top: 15px;
}
.new-list-form input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
}
.new-list-form button {
  padding: 8px;
  background-color: #D5B895;
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  box-sizing: border-box;
}
.new-list-form button:hover {
  background-color: #c9a782;
}
.form-section {
  background: white;
  padding: 20px;
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
.select-list {
  width: 100%;
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
  margin: 25px 0;
  border: 0;
  border-top: 1px solid #ccc;
}
</style>