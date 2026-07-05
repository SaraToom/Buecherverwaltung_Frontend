import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BuchItem from '../BuchItem.vue'

const baseProps = {
  id: 1,
  titel: 'Der Prozess',
  autor: 'Franz Kafka',
  genre: 'Roman',
  releaseYear: 1925,
  stars: 4,
  review: 'Sehr eindringlich.',
  isFavorite: false,
  bookList: null,
  bookLists: [
    { id: 1, name: 'Möchte ich lesen' },
    { id: 2, name: 'Aktuell' },
  ],
}

describe('BuchItem', () => {
  it('rendert Titel, Autor, Genre, Jahr, Bewertung und Rezension', () => {
    const wrapper = mount(BuchItem, { props: baseProps })

    expect(wrapper.text()).toContain('Der Prozess')
    expect(wrapper.text()).toContain('Franz Kafka')
    expect(wrapper.text()).toContain('Roman')
    expect(wrapper.text()).toContain('1925')
    expect(wrapper.text()).toContain('4/5')
    expect(wrapper.text()).toContain('Sehr eindringlich.')
  })

  it('zeigt den Favoriten-Stern nur wenn isFavorite true ist', () => {
    const wrapperOhneFavorit = mount(BuchItem, { props: baseProps })
    expect(wrapperOhneFavorit.find('.fav-icon').exists()).toBe(false)

    const wrapperMitFavorit = mount(BuchItem, { props: { ...baseProps, isFavorite: true } })
    expect(wrapperMitFavorit.find('.fav-icon').exists()).toBe(true)
  })

  it('zeigt das Regal-Select mit der aktuellen bookList', () => {
    const wrapperOhneListe = mount(BuchItem, { props: baseProps })
    const selectOhneListe = wrapperOhneListe.find('.list-select')
    expect(selectOhneListe.exists()).toBe(true)
    expect((selectOhneListe.element as HTMLSelectElement).value).toBe('')

    const wrapperMitListe = mount(BuchItem, {
      props: { ...baseProps, bookList: { id: 1, name: 'Aktuell' } },
    })
    const selectMitListe = wrapperMitListe.find('.list-select')
    expect((selectMitListe.element as HTMLSelectElement).value).toBe('1')
  })

  it('beschriftet den Favoriten-Button je nach Status unterschiedlich', () => {
    const wrapperOhneFavorit = mount(BuchItem, { props: baseProps })
    expect(wrapperOhneFavorit.find('.btn-fav').text()).toBe('Zu Favoriten')

    const wrapperMitFavorit = mount(BuchItem, { props: { ...baseProps, isFavorite: true } })
    expect(wrapperMitFavorit.find('.btn-fav').text()).toBe('Unfavorit')
  })

  it('emittiert toggle-favorite beim Klick auf den Favoriten-Button', async () => {
    const wrapper = mount(BuchItem, { props: baseProps })

    await wrapper.find('.btn-fav').trigger('click')

    expect(wrapper.emitted('toggle-favorite')).toHaveLength(1)
  })

  it('emittiert delete-buch beim Klick auf den Löschen-Button', async () => {
    const wrapper = mount(BuchItem, { props: baseProps })

    await wrapper.find('.btn-delete').trigger('click')

    expect(wrapper.emitted('delete-buch')).toHaveLength(1)
  })
})
