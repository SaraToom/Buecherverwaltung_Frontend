import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../App.vue'

interface FetchMockData {
  books?: unknown[]
  lists?: unknown[]
}

function createFetchMock({ books = [], lists = [] }: FetchMockData = {}) {
  return vi.fn((url: string, options?: { method?: string; body?: string }) => {
    const method = options?.method ?? 'GET'

    if (url.endsWith('/lists') && method === 'GET') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(lists) })
    }
    if (url.endsWith('/lists') && method === 'POST') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 99, name: 'Neues Regal' }) })
    }
    if (url.includes('/lists/') && method === 'DELETE') {
      return Promise.resolve({ ok: true })
    }
    if (url.endsWith('/books') && method === 'GET') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(books) })
    }
    if (url.endsWith('/books') && method === 'POST') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 100 }) })
    }
    if (url.includes('/books/') && method === 'PUT') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    }
    if (url.includes('/books/') && method === 'DELETE') {
      return Promise.resolve({ ok: true })
    }
    return Promise.reject(new Error(`Unerwarteter Fetch-Aufruf: ${method} ${url}`))
  })
}

function findPostCallBody(fetchMock: ReturnType<typeof createFetchMock>, path: string) {
  const call = fetchMock.mock.calls.find(
    ([url, options]) => (url as string).endsWith(path) && options?.method === 'POST',
  )
  return call ? JSON.parse((call[1] as { body: string }).body) : undefined
}

function findButtonByText(wrapper: ReturnType<typeof mount>, text: string) {
  const button = wrapper.findAll('button').find((b) => b.text().includes(text))
  if (!button) throw new Error(`Button mit Text "${text}" nicht gefunden`)
  return button
}

const buch1 = {
  id: 1,
  title: 'Der Prozess',
  author: 'Franz Kafka',
  genre: 'Roman',
  releaseYear: 1925,
  stars: 4,
  review: '',
  isFavorite: false,
  bookList: { id: 1, name: 'Aktuell' },
}

const buch2 = {
  id: 2,
  title: 'Faust',
  author: 'Johann Wolfgang von Goethe',
  genre: 'Drama',
  releaseYear: 1808,
  stars: 5,
  review: '',
  isFavorite: false,
  bookList: null,
}

const listen = [{ id: 1, name: 'Aktuell' }, { id: 2, name: 'Gelesen' }]

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('App', () => {
  it('lädt Bücher und Regale vom Backend und zeigt sie an', async () => {
    global.fetch = createFetchMock({ books: [buch1, buch2], lists: listen }) as unknown as typeof fetch

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.text()).toContain('Der Prozess')
    expect(wrapper.text()).toContain('Faust')
    expect(wrapper.text()).toContain('Aktuell')
    expect(wrapper.text()).toContain('Gelesen')
  })

  it('zeigt einen Hinweis an, wenn keine Bücher vorhanden sind', async () => {
    global.fetch = createFetchMock({ books: [], lists: [] }) as unknown as typeof fetch

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.text()).toContain('Keine Bücher in dieser Liste vorhanden.')
  })

  it('sendet beim Speichern eines neuen Buchs einen POST-Request mit den Formulardaten', async () => {
    const fetchMock = createFetchMock({ books: [], lists: listen })
    global.fetch = fetchMock as unknown as typeof fetch
    vi.stubGlobal('alert', vi.fn())

    const wrapper = mount(App)
    await flushPromises()

    await wrapper.find('input[placeholder="Buchtitel"]').setValue('1984')
    await wrapper.find('input[placeholder="Autor"]').setValue('George Orwell')
    await findButtonByText(wrapper, 'Buch speichern').trigger('click')
    await flushPromises()

    const gesendetesBuch = findPostCallBody(fetchMock, '/books')
    expect(gesendetesBuch).toMatchObject({ title: '1984', author: 'George Orwell' })
  })

  it('bricht das Speichern ab und warnt, wenn Titel oder Autor fehlen', async () => {
    const fetchMock = createFetchMock({ books: [], lists: [] })
    global.fetch = fetchMock as unknown as typeof fetch
    const alertMock = vi.fn()
    vi.stubGlobal('alert', alertMock)

    const wrapper = mount(App)
    await flushPromises()
    fetchMock.mockClear()

    await findButtonByText(wrapper, 'Buch speichern').trigger('click')
    await flushPromises()

    expect(alertMock).toHaveBeenCalled()
    expect(findPostCallBody(fetchMock, '/books')).toBeUndefined()
  })

  it('löscht ein Buch nach Bestätigung und lädt die Liste neu', async () => {
    const fetchMock = createFetchMock({ books: [buch1], lists: listen })
    global.fetch = fetchMock as unknown as typeof fetch
    vi.stubGlobal('confirm', vi.fn(() => true))

    const wrapper = mount(App)
    await flushPromises()

    await wrapper.find('.btn-delete').trigger('click')
    await flushPromises()

    const deleteCall = fetchMock.mock.calls.find(
      ([url, options]) => (url as string).includes(`/books/${buch1.id}`) && options?.method === 'DELETE',
    )
    expect(deleteCall).toBeDefined()
  })

  it('löscht kein Buch, wenn der Benutzer die Bestätigung ablehnt', async () => {
    const fetchMock = createFetchMock({ books: [buch1], lists: listen })
    global.fetch = fetchMock as unknown as typeof fetch
    vi.stubGlobal('confirm', vi.fn(() => false))

    const wrapper = mount(App)
    await flushPromises()

    await wrapper.find('.btn-delete').trigger('click')
    await flushPromises()

    const deleteCall = fetchMock.mock.calls.find(
      ([url, options]) => (url as string).includes(`/books/${buch1.id}`) && options?.method === 'DELETE',
    )
    expect(deleteCall).toBeUndefined()
  })

  it('schaltet den Favoriten-Status eines Buchs per PUT-Request um', async () => {
    const fetchMock = createFetchMock({ books: [buch1], lists: listen })
    global.fetch = fetchMock as unknown as typeof fetch

    const wrapper = mount(App)
    await flushPromises()

    await wrapper.find('.btn-fav').trigger('click')
    await flushPromises()

    const putCall = fetchMock.mock.calls.find(
      ([url, options]) => (url as string).includes(`/books/${buch1.id}`) && options?.method === 'PUT',
    )
    expect(putCall).toBeDefined()
    const gesendetesBuch = JSON.parse((putCall![1] as { body: string }).body)
    expect(gesendetesBuch.isFavorite).toBe(true)
  })

  it('filtert Bücher nach dem ausgewählten Regal in der Sidebar', async () => {
    global.fetch = createFetchMock({ books: [buch1, buch2], lists: listen }) as unknown as typeof fetch

    const wrapper = mount(App)
    await flushPromises()

    const listItems = wrapper.findAll('.list-item')
    const gelesenEintrag = listItems.find((item) => item.text().includes('Aktuell'))
    await gelesenEintrag!.trigger('click')

    expect(wrapper.text()).toContain('Der Prozess')
    expect(wrapper.text()).not.toContain('Faust')
  })

  it('filtert Bücher nach Suchbegriff', async () => {
    global.fetch = createFetchMock({ books: [buch1, buch2], lists: listen }) as unknown as typeof fetch

    const wrapper = mount(App)
    await flushPromises()

    await wrapper.find('.search-input').setValue('Faust')

    expect(wrapper.text()).toContain('Faust')
    expect(wrapper.text()).not.toContain('Der Prozess')
  })
})
