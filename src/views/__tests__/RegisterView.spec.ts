import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import RegisterView from '../RegisterView.vue'

const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  mockPush.mockClear()
})

describe('RegisterView', () => {
  it('rendert das Registrierungsformular', () => {
    const wrapper = mount(RegisterView)
    expect(wrapper.find('input[placeholder="Benutzername *"]').exists()).toBe(true)
    expect(wrapper.find('input[placeholder="Passwort *"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('zeigt einen Fehler bei fehlendem Benutzernamen oder Passwort', async () => {
    const wrapper = mount(RegisterView)

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Bitte Benutzername und Passwort eingeben.')
  })

  it('zeigt eine Erfolgsmeldung nach erfolgreicher Registrierung', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    ) as unknown as typeof fetch

    const wrapper = mount(RegisterView)
    await wrapper.find('input[placeholder="Benutzername *"]').setValue('neuuser')
    await wrapper.find('input[placeholder="Passwort *"]').setValue('geheim123')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Registrierung erfolgreich')
  })

  it('zeigt einen Fehler bei bereits vorhandenem Benutzernamen', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Benutzername bereits vergeben' }),
      }),
    ) as unknown as typeof fetch

    const wrapper = mount(RegisterView)
    await wrapper.find('input[placeholder="Benutzername *"]').setValue('vorhandener')
    await wrapper.find('input[placeholder="Passwort *"]').setValue('geheim')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Benutzername bereits vergeben')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('zeigt einen Fehler bei Verbindungsproblemen', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Netzwerkfehler'))) as unknown as typeof fetch

    const wrapper = mount(RegisterView)
    await wrapper.find('input[placeholder="Benutzername *"]').setValue('neuuser')
    await wrapper.find('input[placeholder="Passwort *"]').setValue('geheim')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Verbindung zum Server nicht möglich.')
  })
})
