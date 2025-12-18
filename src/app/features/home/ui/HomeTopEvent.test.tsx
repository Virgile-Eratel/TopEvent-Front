import { screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { HomeTopEvent } from './HomeTopEvent'
import { renderWithProviders } from '@/test/test-utils'
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale("fr");

// 1. Mock des hooks et navigate
const mockUseEventsTop = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate
    }
})

// Attention : Le chemin doit correspondre exactement à l'import dans votre composant
vi.mock('../../events/api/queries', () => ({
    useEventsTop: () => mockUseEventsTop()
}))

describe('HomeTopEvent', () => {
    // 2. Nettoyage avant chaque test
    beforeEach(() => {
        vi.clearAllMocks()
        // Par défaut, on retourne un tableau vide pour éviter les erreurs de mapping
        mockUseEventsTop.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false
        })
    })

    it('renders the main title', () => {
        renderWithProviders(<HomeTopEvent />)
        
        expect(screen.getByText(/⭐ Événements recommandés pour vous/i)).toBeInTheDocument()
    })

    it('renders list of events with correct formatting', () => {
        const mockDate = '2025-12-25T20:00:00'
        
        const mockEvents = [
            {
                id: '123',
                name: 'Grand Concert de Noël',
                startDate: mockDate,
                location: 'Paris',
            },
            {
                id: '456',
                name: 'Festival Tech',
                startDate: '2025-06-10T09:00:00',
                location: 'Lyon',
            }
        ]

        mockUseEventsTop.mockReturnValue({
            data: mockEvents,
        })

        renderWithProviders(<HomeTopEvent />)

        // --- CORRECTION ICI ---
        
        // 1. "Paris" est dans une balise <i>, donc getByText fonctionne directement
        expect(screen.getByText('Paris')).toBeInTheDocument()
        
        // 2. "Grand Concert de Noël" est un bout de texte dans le label parent.
        // Il faut utiliser une Regex (/.../) pour matcher une partie du texte.
        expect(screen.getByText(/Grand Concert de Noël/)).toBeInTheDocument()
        
        // 3. Vérification de la date en français
        // Grâce à l'import 'dayjs/locale/fr', on aura bien "jeudi" et non "Thursday"
        expect(screen.getByText(/jeudi 25 décembre 2025/i)).toBeInTheDocument()
        
        // 4. Vérification de l'heure
        // On utilise une regex flexible (\s*) pour gérer les éventuels espaces ou retours à la ligne du DOM
        expect(screen.getByText(/20\s*H/)).toBeInTheDocument()

        // Vérification du deuxième événement
        expect(screen.getByText('Lyon')).toBeInTheDocument()
        expect(screen.getByText(/Festival Tech/)).toBeInTheDocument()
    })

    it('navigates to event details when button is clicked', () => {
        const mockEvents = [
            {
                id: 'event-123',
                name: 'Concert Test',
                startDate: '2025-01-01T20:00:00',
                location: 'Bordeaux',
            }
        ]

        mockUseEventsTop.mockReturnValue({
            data: mockEvents,
        })

        renderWithProviders(<HomeTopEvent />)

        const detailButton = screen.getByRole('button', { name: /voir le détail/i })
        
        // Simulation du clic
        fireEvent.click(detailButton)

        // Vérification de la navigation
        expect(mockNavigate).toHaveBeenCalledTimes(1)
        expect(mockNavigate).toHaveBeenCalledWith('/events/event-123')
    })

    it('handles empty data gracefully', () => {
        mockUseEventsTop.mockReturnValue({
            data: undefined, // Test du cas a?.data ?? []
        })

        renderWithProviders(<HomeTopEvent />)

        expect(screen.getByText(/⭐ Événements recommandés pour vous/i)).toBeInTheDocument()
        // Vérifie qu'aucun bouton n'est affiché s'il n'y a pas d'événements
        expect(screen.queryByRole('button', { name: /voir le détail/i })).not.toBeInTheDocument()
    })
})