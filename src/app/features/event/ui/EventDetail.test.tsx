import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import EventDetail from './EventDetail'
import { renderWithProviders } from '@/test/test-utils'

// Mock dependencies
const mockUseEvent = vi.fn()
const mockUseAuth = vi.fn()
const mockUseCreateSubscription = vi.fn()
const mockUseUserSubscription = vi.fn()
const mockCreateSubscriptionMutate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useParams: () => ({ eventId: '1' }),
    }
})

vi.mock('@/app/features/events/api/queries', () => ({
    useEvent: (id: number) => mockUseEvent(id)
}))

vi.mock('@/app/features/auth/context/AuthContext', () => ({
    useAuth: () => mockUseAuth()
}))

vi.mock('@/app/features/subscriptions/api/queries', () => ({
    useCreateSubscriptionMutation: () => ({
        mutateAsync: mockCreateSubscriptionMutate,
        isPending: false,
    }),
    useUserSubscription: (id: number | null) => mockUseUserSubscription(id)
}))

vi.mock('@/app/features/subscriptions/ui/CancelSubscriptionDialog', () => ({
    CancelSubscriptionDialog: () => <div data-testid="cancel-dialog">Cancel Dialog</div>
}))

describe('EventDetail', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUseUserSubscription.mockReturnValue({ data: null })
        mockUseCreateSubscription.mockReturnValue({ mutateAsync: mockCreateSubscriptionMutate, isPending: false })
    })

    it('renders loading state', () => {
        mockUseEvent.mockReturnValue({ isLoading: true })
        mockUseAuth.mockReturnValue({ isAuthenticated: false })
        
        const { container } = renderWithProviders(<EventDetail />)
        
        // Check for skeleton loaders by class name since they are visual only
        // and don't have accessible roles
        const skeletons = container.querySelectorAll('.animate-pulse')
        expect(skeletons.length).toBeGreaterThan(0)
        
        expect(screen.queryByText(/Événement introuvable/i)).not.toBeInTheDocument()
    })

    it('renders event details correctly', () => {
        const mockEvent = {
            id: 1,
            name: 'Concert Test',
            description: 'Best concert ever',
            location: 'Paris',
            startDate: '2025-01-01T20:00:00.000Z',
            endDate: '2025-01-01T23:00:00.000Z',
            isPublic: true,
            type: 'concert',
            createdBy: { firstName: 'John', lastName: 'Doe', mail: 'john@example.com' },
            totalPlaces: 100,
            currentSubscribers: 10
        }
        mockUseEvent.mockReturnValue({ data: mockEvent, isLoading: false })
        mockUseAuth.mockReturnValue({ isAuthenticated: false })

        renderWithProviders(<EventDetail />)

        expect(screen.getByText('Concert Test')).toBeInTheDocument()
        expect(screen.getByText('Best concert ever')).toBeInTheDocument()
        expect(screen.getByText('Paris')).toBeInTheDocument()
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument()
    })

    it('shows login button for unauthenticated users on public event', () => {
        const mockEvent = {
            id: 1,
            name: 'Public Event',
            isPublic: true,
            startDate: '2025-01-01T20:00:00.000Z',
            endDate: '2025-01-01T23:00:00.000Z',
        }
        mockUseEvent.mockReturnValue({ data: mockEvent, isLoading: false })
        mockUseAuth.mockReturnValue({ isAuthenticated: false })

        renderWithProviders(<EventDetail />)

        expect(screen.getByText(/connectez-vous pour vous inscrire/i)).toBeInTheDocument()
    })

    it('shows subscribe button for authenticated users', async () => {
        const mockEvent = {
            id: 1,
            name: 'Public Event',
            isPublic: true,
            startDate: '2025-01-01T20:00:00.000Z',
            endDate: '2025-01-01T23:00:00.000Z',
            totalPlaces: 100,
            currentSubscribers: 0
        }
        mockUseEvent.mockReturnValue({ data: mockEvent, isLoading: false })
        mockUseAuth.mockReturnValue({ isAuthenticated: true })
        mockUseUserSubscription.mockReturnValue({ data: null }) // Not subscribed yet

        renderWithProviders(<EventDetail />)

        const subscribeBtn = screen.getByRole('button', { name: "S'inscrire" })
        expect(subscribeBtn).toBeInTheDocument()
        
        // Test interaction
        const user = userEvent.setup()
        await user.click(subscribeBtn)
        
        expect(mockCreateSubscriptionMutate).toHaveBeenCalledWith({ eventId: 1 })
    })

    it('shows unsubscribe button when user is subscribed', () => {
        const mockEvent = {
            id: 1,
            name: 'Public Event',
            isPublic: true,
            startDate: '2025-01-01T20:00:00.000Z',
            endDate: '2025-01-01T23:00:00.000Z',
        }
        mockUseEvent.mockReturnValue({ data: mockEvent, isLoading: false })
        mockUseAuth.mockReturnValue({ isAuthenticated: true })
        mockUseUserSubscription.mockReturnValue({ 
            data: { id: 123, subscriptionDate: '2024-01-01' } 
        })

        renderWithProviders(<EventDetail />)

        expect(screen.getByText(/vous êtes inscrit à cet événement/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /se désinscrire/i })).toBeInTheDocument()
    })
})

