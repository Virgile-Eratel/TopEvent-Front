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

vi.mock('lucide-react', async () => {
    const actual = await vi.importActual('lucide-react')
    return {
        ...actual,
        ChevronLeft: () => <span data-testid="chevron-left">←</span>,
        ChevronRight: () => <span data-testid="chevron-right">→</span>,
        MoreHorizontal: () => <span>...</span>
    }
})

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

    it('calls API with pagination parameters', () => {
        mockUseEventsList.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false
        })

        renderWithProviders(<EventsList />)

        expect(mockUseEventsList).toHaveBeenCalledWith(expect.objectContaining({
            page: 1,
            limit: 10
        }))
    })

    it('shows pagination when there are results equal to page limit', () => {
        // Generate exactly 10 events to trigger pagination display
        const mockEvents = Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            name: `Event ${i + 1}`,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-01-02'),
            location: 'Paris',
            type: 'concert',
            isPublic: true,
            totalPlaces: 100,
            currentSubscribers: 10,
            createdBy: { firstName: 'John', lastName: 'Doe' }
        }))

        mockUseEventsList.mockReturnValue({
            data: mockEvents,
            isLoading: false,
            isError: false
        })

        renderWithProviders(<EventsList />)

        expect(screen.getByRole('navigation', { name: 'pagination' })).toBeInTheDocument()
        expect(screen.getByText('Suivant')).toBeInTheDocument()
        expect(screen.getByText('Précédent')).toBeInTheDocument()
    })

    it('does not show pagination when there are fewer results than page limit', () => {
        const mockEvents = [
            {
                id: 1,
                name: 'Single Event',
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-01-02'),
                location: 'Paris',
                type: 'concert',
                isPublic: true,
                totalPlaces: 100,
                currentSubscribers: 10,
                createdBy: { firstName: 'John', lastName: 'Doe' }
            }
        ]

        mockUseEventsList.mockReturnValue({
            data: mockEvents,
            isLoading: false,
            isError: false
        })

        renderWithProviders(<EventsList />)

        expect(screen.queryByRole('navigation', { name: 'pagination' })).not.toBeInTheDocument()
    })

    it('navigates to next page when clicking next button', async () => {
        const user = userEvent.setup()
        const mockEvents = Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            name: `Event ${i + 1}`,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-01-02'),
            location: 'Paris',
            type: 'concert',
            isPublic: true,
            totalPlaces: 100,
            currentSubscribers: 10,
            createdBy: { firstName: 'John', lastName: 'Doe' }
        }))

        mockUseEventsList.mockReturnValue({
            data: mockEvents,
            isLoading: false,
            isError: false
        })

        renderWithProviders(<EventsList />)

        const nextButton = screen.getByText('Suivant')
        await user.click(nextButton)

        await waitFor(() => {
            expect(mockUseEventsList).toHaveBeenCalledWith(expect.objectContaining({
                page: 2,
                limit: 10
            }))
        })
    })

    it('displays current page in results text', () => {
        const mockEvents = Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            name: `Event ${i + 1}`,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-01-02'),
            location: 'Paris',
            type: 'concert',
            isPublic: true,
            totalPlaces: 100,
            currentSubscribers: 10,
            createdBy: { firstName: 'John', lastName: 'Doe' }
        }))

        mockUseEventsList.mockReturnValue({
            data: mockEvents,
            isLoading: false,
            isError: false
        })

        renderWithProviders(<EventsList />)

        expect(screen.getByText(/résultats : 10 \(page 1\)/i)).toBeInTheDocument()
    })
})

