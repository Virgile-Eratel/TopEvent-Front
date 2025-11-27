import { screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import AdminEventDetail from './$eventId'
import { renderWithProviders } from '@/test/test-utils'

const mockUseAdminSubscriptions = vi.fn()
const mockUseEvent = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useParams: () => ({ eventId: '1' }),
    }
})

vi.mock('@/app/features/subscriptions/api/queries', () => ({
    useAdminSubscriptions: (id: number | null) => mockUseAdminSubscriptions(id)
}))

vi.mock('@/app/features/events/api/queries', () => ({
    useEvent: (id: number | null) => mockUseEvent(id)
}))

vi.mock('@/app/features/event/ui/EventDetail', () => ({
    default: () => <div data-testid="event-detail">Event Detail Component</div>
}))

describe('AdminEventDetail', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders event detail component', () => {
        mockUseAdminSubscriptions.mockReturnValue({ data: [], isLoading: false })
        mockUseEvent.mockReturnValue({ data: { currentSubscribers: 0 } })
        
        renderWithProviders(<AdminEventDetail />)
        
        expect(screen.getByTestId('event-detail')).toBeInTheDocument()
    })

    it('renders loading state for subscriptions', () => {
        mockUseAdminSubscriptions.mockReturnValue({ isLoading: true })
        mockUseEvent.mockReturnValue({ data: { currentSubscribers: 0 } })
        
        const { container } = renderWithProviders(<AdminEventDetail />)
        
        // Look for skeletons
        expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
    })

    it('renders error state', () => {
        mockUseAdminSubscriptions.mockReturnValue({ isError: true, error: new Error('Failed to load') })
        mockUseEvent.mockReturnValue({ data: { currentSubscribers: 0 } })
        
        renderWithProviders(<AdminEventDetail />)
        
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
    })

    it('renders empty subscriptions list', () => {
        mockUseAdminSubscriptions.mockReturnValue({ data: [], isLoading: false })
        mockUseEvent.mockReturnValue({ data: { currentSubscribers: 0 } })
        
        renderWithProviders(<AdminEventDetail />)
        
        expect(screen.getByText(/aucune inscription pour le moment/i)).toBeInTheDocument()
    })

    it('renders subscriptions list', () => {
        const mockSubscriptions = [
            { id: 1, userId: 101, subscriptionDate: '2025-01-01T12:00:00' },
            { id: 2, userId: 102, subscriptionDate: '2025-01-02T12:00:00' }
        ]
        mockUseAdminSubscriptions.mockReturnValue({ data: mockSubscriptions, isLoading: false })
        mockUseEvent.mockReturnValue({ data: { currentSubscribers: 2 } })
        
        renderWithProviders(<AdminEventDetail />)
        
        expect(screen.getByText(/2 inscriptions au total/i)).toBeInTheDocument()
        expect(screen.getByText('Utilisateur #101')).toBeInTheDocument()
        expect(screen.getByText('Utilisateur #102')).toBeInTheDocument()
    })
})

