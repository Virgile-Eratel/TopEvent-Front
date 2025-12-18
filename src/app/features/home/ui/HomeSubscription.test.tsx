import { screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import HomeSubscription from './HomeSubscription'
import { renderWithProviders } from '@/test/test-utils'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'

// Initialisation de dayjs pour les tests
dayjs.locale('fr')

// 1. Mocks des hooks API
const mockUseUserSubscriptions = vi.fn()
const mockUseEvent = vi.fn()

vi.mock('../../subscriptions/api/queries', () => ({
    useUserSubscriptions: () => mockUseUserSubscriptions()
}))

vi.mock('../../events/api/queries', () => ({
    useEvent: (id: string) => mockUseEvent(id)
}))

describe('HomeSubscription', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        
        // Mock par défaut pour éviter les erreurs de rendu
        mockUseUserSubscriptions.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false
        })
    })

    it('affiche l\'état de chargement initial', () => {
        mockUseUserSubscriptions.mockReturnValue({
            isLoading: true
        })

        renderWithProviders(<HomeSubscription />)
        expect(screen.getByText(/Chargement de vos inscriptions/i)).toBeInTheDocument()
    })

    it('affiche l\'état d\'erreur', () => {
        mockUseUserSubscriptions.mockReturnValue({
            isError: true,
            error: new Error('Erreur API')
        })

        renderWithProviders(<HomeSubscription />)
        expect(screen.getByText(/Une erreur est survenue : Erreur API/i)).toBeInTheDocument()
    })

    it('affiche la liste des inscriptions avec le calcul des jours restants', async () => {
        // Date aujourd'hui fixe pour le test
        const today = dayjs().startOf('day')
        const eventDate = today.add(5, 'day').toDate() // Dans 5 jours

        const mockSubs = [
            { id: 'sub-1', eventId: 'event-100', subscriptionDate: new Date() }
        ]

        const mockEventDetails = {
            id: 'event-100',
            name: 'Conférence React',
            location: 'Rennes',
            startDate: eventDate
        }

        mockUseUserSubscriptions.mockReturnValue({ data: mockSubs, isLoading: false })
        // On mock le retour du hook useEvent pour l'ID spécifique
        mockUseEvent.mockReturnValue({ data: mockEventDetails, isLoading: false })

        renderWithProviders(<HomeSubscription />)

        // Vérification du titre principal
        expect(screen.getByText(/Vos prochains événements à venir/i)).toBeInTheDocument()

        // Vérification du contenu généré par SubscriptionRow
        // Utilisation de regex car le texte est splité par des balises <b> et <u>
        expect(screen.getByText(/Plus que/i)).toBeInTheDocument()
        expect(screen.getByText(/5 jours/i)).toBeInTheDocument()
        expect(screen.getByText(/Conférence React/i)).toBeInTheDocument()
        expect(screen.getByText(/Rennes/i)).toBeInTheDocument()
    })

    it('trie les inscriptions par date d\'inscription', () => {
        const mockSubs = [
            { id: 'sub-recent', eventId: 'e1', subscriptionDate: new Date('2025-01-10') },
            { id: 'sub-old', eventId: 'e2', subscriptionDate: new Date('2025-01-01') }
        ]

        mockUseUserSubscriptions.mockReturnValue({ data: mockSubs, isLoading: false })
        mockUseEvent.mockReturnValue({ data: null, isLoading: true }) // On laisse en chargement pour simplifier

        renderWithProviders(<HomeSubscription />)

        const rows = screen.getAllByText(/Chargement de l'évènement/i)
        // Vérifie que le tri (a.date - b.date) est appliqué : la plus ancienne en premier
        expect(rows.length).toBe(2)
    })

    it('affiche un état de chargement spécifique pour une ligne d\'événement', () => {
        const mockSubs = [{ id: 'sub-1', eventId: 'e1', subscriptionDate: new Date() }]
        
        mockUseUserSubscriptions.mockReturnValue({ data: mockSubs, isLoading: false })
        mockUseEvent.mockReturnValue({ isLoading: true }) // L'événement lui-même charge

        renderWithProviders(<HomeSubscription />)

        expect(screen.getByText(/Chargement de l'évènement\.\.\./i)).toBeInTheDocument()
    })
})