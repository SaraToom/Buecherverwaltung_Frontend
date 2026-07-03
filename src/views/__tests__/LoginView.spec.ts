import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import LoginView from '../LoginView.vue'

const mockPush = vi.fn()
const mockSetAuth = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('../../composables/useAuth', () => ({
  useAuth: () => ({
    setAuth: mockSetAuth,
  }),
}))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  mockPush.mockClear()
  mockSetAuth.mockClear()
})

describe('LoginView', () => {
  it('rendert das Anmeldeformular', () => {
    const wrapper = mount(LoginView)
    expect(wrapper.find('input[placeholder="Benutzername"]').exists()).toBe(true)
    expect(wrapper.find('input[placeholder="Passwort"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('zeigt einen Fehler bei fehlendem Benutzernamen oder Passwort', async () => {
    const wrapper = mount(LoginView)

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Bitte Benutzername und Passwort eingeben.')
  })

  it('leitet nach erfolgreichem Login zur Startseite weiter', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'jwt-123', username: 'testuser' }),
      }),
    ) as unknown as typeof fetch

    const wrapper = mount(LoginView)
    await wrapper.find('input[placeholder="Benutzername"]').setValue('testuser')
    await wrapper.find('input[placeholder="Passwort"]').setValue('geheim')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(mockSetAuth).toHaveBeenCalledWith('jwt-123', 'testuser')
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('zeigt einen Fehler bei ungültigen Anmeldedaten', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Ungültige Anmeldedaten' }),
      }),
    ) as unknown as typeof fetch

    const wrapper = mount(LoginView)
    await wrapper.find('input[placeholder="Benutzername"]').setValue('falsch')
    await wrapper.find('input[placeholder="Passwort"]').setValue('falsch')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Ungültige Anmeldedaten')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('zeigt einen Fehler bei Verbindungsproblemen', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Netzwerkfehler'))) as unknown as typeof fetch

    const wrapper = mount(LoginView)
    await wrapper.find('input[placeholder="Benutzername"]').setValue('testuser')
    await wrapper.find('input[placeholder="Passwort"]').setValue('geheim')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Verbindung zum Server nicht möglich.')
  })
})
