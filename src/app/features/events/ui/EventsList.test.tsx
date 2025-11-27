import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import EventsList from './EventsList'
import { renderWithProviders } from '@/test/test-utils'

const mockUseEventsList = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate
    }
})

vi.mock('@/app/features/events/api/queries', () => ({
    useEventsList: (filters: unknown) => mockUseEventsList(filters)
}))

vi.mock('@/app/features/event/api/schema', () => ({
    EventTypeEnum: {
        options: ['concert', 'conference', 'workshop']
    }
}))

describe('EventsList', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUseEventsList.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false
        })
    })

    it('renders filters and table headers', () => {
        renderWithProviders(<EventsList />)

        expect(screen.getByPlaceholderText(/rechercher.../i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/lieu.../i)).toBeInTheDocument()
        expect(screen.getByText(/catégorie/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /réinitialiser/i })).toBeInTheDocument()
        
        expect(screen.getByText('Nom')).toBeInTheDocument()
        expect(screen.getByText('Début')).toBeInTheDocument()
        expect(screen.getByText('Lieu')).toBeInTheDocument()
    })

    it('displays loading state', () => {
        mockUseEventsList.mockReturnValue({
            data: [],
            isLoading: true,
            isError: false
        })

        renderWithProviders(<EventsList />)
        
        expect(screen.getByText('Chargement...')).toBeInTheDocument()
        expect(screen.getByText('Chargement des événements...')).toBeInTheDocument()
    })

    it('displays error state', () => {
        mockUseEventsList.mockReturnValue({
            data: [],
            isLoading: false,
            isError: true,
            error: new Error('API Error')
        })

        renderWithProviders(<EventsList />)
        
        expect(screen.getByText(/une erreur est survenue : api error/i)).toBeInTheDocument()
    })

    it('renders list of events and handles interactions', async () => {
        const mockEvents = [
            {
                id: 1,
                name: 'Concert A',
                startDate: new Date('2025-01-01T20:00:00'),
                endDate: new Date('2025-01-01T23:00:00'),
                location: 'Paris',
                type: 'concert',
                isPublic: true,
                totalPlaces: 100,
                currentSubscribers: 10,
                createdBy: { firstName: 'John', lastName: 'Doe' }
            },
            {
                id: 2,
                name: 'Conference B',
                startDate: new Date('2025-02-01T10:00:00'),
                endDate: new Date('2025-02-01T18:00:00'),
                location: 'Lyon',
                type: 'conference',
                isPublic: false,
                totalPlaces: 50,
                currentSubscribers: 5,
                createdBy: { firstName: 'Jane', lastName: 'Smith' }
            }
        ]

        mockUseEventsList.mockReturnValue({
            data: mockEvents,
            isLoading: false,
            isError: false
        })

        renderWithProviders(<EventsList />)

        expect(screen.getByText('Concert A')).toBeInTheDocument()
        expect(screen.getByText('Paris')).toBeInTheDocument()
        expect(screen.getByText('Conference B')).toBeInTheDocument()
        expect(screen.getByText('Lyon')).toBeInTheDocument()

        // Test navigation on click
        const row = screen.getByText('Concert A').closest('tr')
        fireEvent.click(row!)
        expect(mockNavigate).toHaveBeenCalledWith('/events/1')
    })

    it('updates filters and debounces search', async () => {
        const user = userEvent.setup()
        renderWithProviders(<EventsList />)

        const searchInput = screen.getByPlaceholderText(/rechercher.../i)
        await user.type(searchInput, 'Jazz')

        // Verify that hook is called with debounced value eventually
        await waitFor(() => {
            expect(mockUseEventsList).toHaveBeenCalledWith(expect.objectContaining({
                search: 'Jazz'
            }))
        }, { timeout: 1000 })
    })

    it('resets filters when button clicked', async () => {
        const user = userEvent.setup()
        renderWithProviders(<EventsList />)

        const searchInput = screen.getByPlaceholderText(/rechercher.../i)
        await user.type(searchInput, 'Rock')
        
        const resetBtn = screen.getByRole('button', { name: /réinitialiser/i })
        await user.click(resetBtn)

        expect(searchInput).toHaveValue('')
    })
})

