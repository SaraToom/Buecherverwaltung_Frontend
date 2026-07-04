<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const fehler = ref('')
const erfolg = ref('')
const laedt = ref(false)

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

async function register() {
  if (!username.value.trim() || !password.value.trim()) {
    fehler.value = 'Bitte Benutzername und Passwort eingeben.'
    return
  }
  laedt.value = true
  fehler.value = ''
  erfolg.value = ''
  try {
    const response = await fetch(`${backendUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value,
      }),
    })
    if (response.ok) {
      erfolg.value = 'Registrierung erfolgreich! Du wirst weitergeleitet...'
      setTimeout(() => router.push('/login'), 1500)
    } else {
      const data = await response.json()
      fehler.value = data.error || 'Registrierung fehlgeschlagen.'
    }
  } catch {
    fehler.value = 'Verbindung zum Server nicht möglich.'
  } finally {
    laedt.value = false
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>Meine Bücherverwaltung</h1>
      <h2>Konto erstellen</h2>

      <form @submit.prevent="register" class="auth-form">
        <input
          v-model="username"
          type="text"
          placeholder="Benutzername *"
          autocomplete="username"
        />
        <input
          v-model="email"
          type="email"
          placeholder="E-Mail (optional)"
          autocomplete="email"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Passwort *"
          autocomplete="new-password"
        />
        <p v-if="fehler" class="fehler">{{ fehler }}</p>
        <p v-if="erfolg" class="erfolg">{{ erfolg }}</p>
        <button type="submit" :disabled="laedt">
          {{ laedt ? 'Registrieren...' : 'Registrieren' }}
        </button>
      </form>

      <p class="auth-link">
        Bereits ein Konto?
        <router-link to="/login">Anmelden</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg-secondary);
}
.auth-card {
  background: var(--bg-primary);
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 380px;
}
h1 {
  color: var(--primary-color);
  font-size: 1.3rem;
  margin: 0 0 8px 0;
  text-align: center;
}
h2 {
  text-align: center;
  color: var(--text-primary);
  font-size: 1.1rem;
  margin: 0 0 24px 0;
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.auth-form input {
  padding: 10px 12px;
  border: 1px solid var(--border-normal);
  border-radius: 6px;
  font-size: 0.95rem;
  background: var(--bg-primary);
  color: var(--text-primary);
}
.auth-form input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(213, 136, 147, 0.1);
}
.auth-form button {
  padding: 11px;
  background-color: var(--primary-color);
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 4px;
  transition: background-color 0.2s ease;
}
.auth-form button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.auth-form button:hover:not(:disabled) {
  background-color: var(--primary-dark);
}
.fehler {
  color: var(--danger-color);
  font-size: 0.88rem;
  margin: 0;
  padding: 8px;
  background-color: rgba(99, 32, 36, 0.1);
  border-left: 3px solid var(--danger-color);
  border-radius: 4px;
}
.erfolg {
  color: #2e7d32;
  font-size: 0.88rem;
  margin: 0;
  padding: 8px;
  background-color: rgba(46, 125, 50, 0.1);
  border-left: 3px solid #2e7d32;
  border-radius: 4px;
}
.auth-link {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.auth-link a {
  color: var(--primary-color);
  font-weight: bold;
  text-decoration: none;
  transition: color 0.2s ease;
}
.auth-link a:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}
</style>
