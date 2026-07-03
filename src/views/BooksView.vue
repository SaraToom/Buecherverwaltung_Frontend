<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import BuchItem from '../components/BuchItem.vue'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { username, getAuthHeaders, clearAuth } = useAuth()

interface BookList {
  id: number
  name: string
}

interface Buch {
  id: number
  title: string
  author: string
  genre: string
  releaseYear: number
  stars: number
  review: string
  isFavorite: boolean
  bookList: BookList | null
}

const buecherListe = ref<Buch[]>([])
const listen = ref<BookList[]>([])

const neuerTitel = ref('')
const neuerAutor = ref('')
const neuesGenre = ref('')
const neuesReleaseYear = ref(new Date().getFullYear())
const neueStars = ref(5)
const neuesReview = ref('')
const neuesIsFavorite = ref(false)
const ausgewaehltesListId = ref('')

const ausgewaehlteListeId = ref<number | null>(null)
const neueListeName = ref('')

const suchbegriff = ref('')
const zeigeFilterMenu = ref(false)
const suchFilter = ref({ titel: true, autor: true, genre: true })

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

function logout() {
  clearAuth()
  router.push('/login')
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers as Record<string, string> ?? {}),
    },
  })
  if (response.status === 401) {
    clearAuth()
    router.push('/login')
    throw new Error('Sitzung abgelaufen.')
  }
  return response
}

const ladeBuecherVonBackend = async () => {
  try {
    const response = await authFetch(`${backendUrl}/books`)
    if (!response.ok) throw new Error('Netzwerk-Antwort war nicht ok')
    buecherListe.value = await response.json()
  } catch (error) {
    console.error('Fehler beim Laden der Bücher aus dem Backend:', error)
  }
}

const ladeListenVonBackend = async () => {
  try {
    const response = await authFetch(`${backendUrl}/lists`)
    if (!response.ok) throw new Error('Netzwerk-Antwort war nicht ok')
    listen.value = await response.json()
  } catch (error) {
    console.error('Fehler beim Laden der Listen aus dem Backend:', error)
  }
}

const speichereListeInBackend = async () => {
  if (!neueListeName.value.trim()) return
  try {
    const response = await authFetch(`${backendUrl}/lists`, {
      method: 'POST',
      body: JSON.stringify({ name: neueListeName.value.trim() }),
    })
    if (response.ok) {
      neueListeName.value = ''
      await ladeListenVonBackend()
    } else {
      alert('Fehler beim Erstellen der Liste: ' + await response.text())
    }
  } catch (error) {
    console.error('Fehler beim Erstellen der Liste:', error)
  }
}

const deleteListeVonBackend = async (id: number) => {
  if (!confirm('Möchtest du diese Liste wirklich löschen? Die zugeordneten Bücher bleiben erhalten.')) return
  try {
    const response = await authFetch(`${backendUrl}/lists/${id}`, { method: 'DELETE' })
    if (response.ok) {
      if (ausgewaehlteListeId.value === id) ausgewaehlteListeId.value = null
      await ladeListenVonBackend()
      await ladeBuecherVonBackend()
    }
  } catch (error) {
    console.error('Netzwerkfehler beim Löschen der Liste:', error)
  }
}

const getBookCountForList = (listId: number) => {
  return buecherListe.value.filter(b => b.bookList && b.bookList.id === listId).length
}

const gefilterteBuecher = computed(() => {
  let result = buecherListe.value
  if (ausgewaehlteListeId.value !== null) {
    result = result.filter(b => b.bookList && b.bookList.id === ausgewaehlteListeId.value)
  }
  const q = suchbegriff.value.trim().toLowerCase()
  if (q) {
    result = result.filter(b => {
      const inTitel = suchFilter.value.titel && b.title?.toLowerCase().includes(q)
      const inAutor = suchFilter.value.autor && b.author?.toLowerCase().includes(q)
      const inGenre = suchFilter.value.genre && b.genre?.toLowerCase().includes(q)
      return inTitel || inAutor || inGenre
    })
  }
  return result
})

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
    isFavorite: neuesIsFavorite.value,
    bookList: ausgewaehltesListId.value ? { id: Number(ausgewaehltesListId.value) } : null,
  }
  try {
    const response = await authFetch(`${backendUrl}/books`, {
      method: 'POST',
      body: JSON.stringify(neuesBuch),
    })
    if (response.ok) {
      neuerTitel.value = ''
      neuerAutor.value = ''
      neuesGenre.value = ''
      neuesReleaseYear.value = new Date().getFullYear()
      neueStars.value = 5
      neuesReview.value = ''
      neuesIsFavorite.value = false
      ausgewaehltesListId.value = ''
      await ladeBuecherVonBackend()
    } else {
      alert('Fehler beim Speichern des Buches: ' + await response.text())
    }
  } catch (error) {
    console.error('Netzwerkfehler beim Absenden an das Backend:', error)
  }
}

const deleteBuchVonBackend = async (id: number) => {
  if (!confirm('Möchtest du dieses Buch wirklich löschen?')) return
  try {
    const response = await authFetch(`${backendUrl}/books/${id}`, { method: 'DELETE' })
    if (response.ok) await ladeBuecherVonBackend()
  } catch (error) {
    console.error('Netzwerkfehler beim Löschen:', error)
  }
}

const toggleFavoritInBackend = async (buch: Buch) => {
  try {
    const response = await authFetch(`${backendUrl}/books/${buch.id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...buch, isFavorite: !buch.isFavorite }),
    })
    if (response.ok) await ladeBuecherVonBackend()
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

      <div class="search-bar-wrapper">
        <div class="search-input-row">
          <div class="search-icon-btn" @click="zeigeFilterMenu = !zeigeFilterMenu" title="Suchfilter">
            🔍
          </div>
          <input
            v-model="suchbegriff"
            type="text"
            class="search-input"
            placeholder="Buch suchen..."
            @keyup.escape="suchbegriff = ''"
          />
          <button v-if="suchbegriff" class="search-clear" @click="suchbegriff = ''" title="Suche löschen">✕</button>
        </div>

        <transition name="fade">
          <div v-if="zeigeFilterMenu" class="filter-popup">
            <p class="filter-title">Suchen in:</p>
            <label class="filter-option">
              <input type="checkbox" v-model="suchFilter.titel" /> Buchtitel
            </label>
            <label class="filter-option">
              <input type="checkbox" v-model="suchFilter.autor" /> Autor
            </label>
            <label class="filter-option">
              <input type="checkbox" v-model="suchFilter.genre" /> Genre
            </label>
          </div>
        </transition>
      </div>

      <div class="user-area">
        <span class="username">👤 {{ username }}</span>
        <button class="btn-logout" @click="logout">Abmelden</button>
      </div>
    </header>

    <div class="app-layout">
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
              <select v-model.number="neueStars">
                <option v-for="n in 5" :key="n" :value="n">{{ n }} Sterne</option>
              </select>
            </div>
            <div class="row">
              <select v-model="ausgewaehltesListId" class="select-list">
                <option value="">(Keinem Regal zugeordnet)</option>
                <option v-for="list in listen" :key="list.id" :value="list.id">
                  {{ list.name }}
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
          {{ ausgewaehlteListeId === null ? 'Deine Bücher' : 'Bücher im Regal: ' + listen.find(l => l.id === ausgewaehlteListeId)?.name }}
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  gap: 16px;
}
h1 {
  color: #D5B895;
  -webkit-text-stroke: 0.9px white;
  white-space: nowrap;
  margin: 0;
}
#app {
  background-color: #EBDDCC;
  min-height: 100vh;
}
.user-area {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.username {
  font-size: 0.9rem;
  color: #555;
  white-space: nowrap;
}
.btn-logout {
  padding: 6px 14px;
  background: white;
  border: 1px solid #D5B895;
  border-radius: 6px;
  color: #D5B895;
  font-weight: bold;
  cursor: pointer;
  font-size: 0.85rem;
  white-space: nowrap;
}
.btn-logout:hover {
  background: #D5B895;
  color: white;
}
.app-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
}
@media (max-width: 768px) {
  .app-layout { grid-template-columns: 1fr; }
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
.list-item:hover { background-color: #e9ecef; transform: translateX(3px); }
.list-item.active { background-color: #D5B895; color: white; }
.list-item-right { display: flex; align-items: center; gap: 8px; }
.count-badge {
  background-color: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: bold;
}
.list-item.active .count-badge { background-color: rgba(255,255,255,0.3); color: white; }
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
.btn-delete-list:hover { color: #ff4d4d; }
.list-item.active .btn-delete-list { color: rgba(255,255,255,0.6); }
.list-item.active .btn-delete-list:hover { color: white; }
.new-list-form { display: flex; gap: 5px; margin-top: 15px; }
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
.new-list-form button:hover { background-color: #c9a782; }
.form-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.form-group { display: flex; flex-direction: column; gap: 10px; }
.row { display: flex; gap: 10px; }
.select-list { width: 100%; }
.form-group input, .form-group select, .form-group textarea {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.form-group textarea { height: 60px; resize: vertical; }
.checkbox-label { display: flex; align-items: center; gap: 5px; font-size: 0.9rem; }
.form-group button {
  padding: 10px;
  background-color: #D5B895;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.form-group button:hover { background-color: #c9a782; }
hr { margin: 25px 0; border: 0; border-top: 1px solid #ccc; }
.search-bar-wrapper { position: relative; width: 280px; flex-shrink: 0; }
.search-input-row {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.07);
  overflow: visible;
}
.search-icon-btn {
  padding: 0 12px;
  font-size: 1.1rem;
  cursor: pointer;
  user-select: none;
  transition: transform 0.15s ease;
  line-height: 1;
}
.search-icon-btn:hover { transform: scale(1.15); }
.search-input {
  flex: 1;
  border: none !important;
  outline: none !important;
  padding: 10px 4px;
  font-size: 0.95rem;
  background: transparent;
}
.search-clear {
  background: none;
  border: none;
  padding: 0 12px;
  font-size: 1rem;
  color: #aaa;
  cursor: pointer;
  line-height: 1;
}
.search-clear:hover { color: #ff4d4d; }
.filter-popup {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  z-index: 100;
  min-width: 160px;
}
.filter-title {
  margin: 0 0 8px 0;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #999;
  font-weight: bold;
}
.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  font-size: 0.9rem;
  cursor: pointer;
  color: #333;
}
.filter-option input[type="checkbox"] { accent-color: #D5B895; width: 15px; height: 15px; cursor: pointer; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
