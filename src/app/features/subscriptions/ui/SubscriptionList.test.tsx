import { screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import SubscriptionList from './SubscriptionList'
import { renderWithProviders } from '@/test/test-utils'

const mockUseUserSubscriptions = vi.fn()
const mockUseEvent = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate
    }
})

vi.mock('@/app/features/subscriptions/api/queries', () => ({
    useUserSubscriptions: () => mockUseUserSubscriptions()
}))

vi.mock('@/app/features/events/api/queries', () => ({
    useEvent: (id: number) => mockUseEvent(id)
}))

vi.mock('./CancelSubscriptionDialog', () => ({
    CancelSubscriptionDialog: ({ open }: { open: boolean }) => 
        open ? <div data-testid="cancel-dialog">Cancel Dialog</div> : null
}))

describe('SubscriptionList', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUseUserSubscriptions.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false
        })
    })

    it('displays loading state', () => {
        mockUseUserSubscriptions.mockReturnValue({
            isLoading: true
        })

        renderWithProviders(<SubscriptionList />)
        
        expect(screen.getByText(/chargement de vos inscriptions.../i)).toBeInTheDocument()
    })

    it('displays error state', () => {
        mockUseUserSubscriptions.mockReturnValue({
            isError: true,
            error: new Error('Fetch Error')
        })

        renderWithProviders(<SubscriptionList />)
        
        expect(screen.getByText(/une erreur est survenue : fetch error/i)).toBeInTheDocument()
    })

    it('displays empty state', () => {
        mockUseUserSubscriptions.mockReturnValue({
            data: [],
            isLoading: false
        })

        renderWithProviders(<SubscriptionList />)
        
        expect(screen.getByText(/vous n'êtes inscrit à aucun événement/i)).toBeInTheDocument()
    })

    it('renders subscriptions table', () => {
        const mockSubscriptions = [
            { id: 1, eventId: 101, subscriptionDate: new Date('2025-01-01') }
        ]
        mockUseUserSubscriptions.mockReturnValue({
            data: mockSubscriptions,
            isLoading: false
        })

        mockUseEvent.mockReturnValue({
            data: {
                id: 101,
                name: 'Event 101',
                startDate: new Date('2025-02-01'),
                endDate: new Date('2025-02-01')
            },
            isLoading: false
        })

        renderWithProviders(<SubscriptionList />)
        
        expect(screen.getByText('Event 101')).toBeInTheDocument()
        expect(screen.getByText('Inscrit')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /se désinscrire/i })).toBeInTheDocument()
    })

    it('navigates to event detail on click', () => {
        const mockSubscriptions = [
            { id: 1, eventId: 101, subscriptionDate: new Date('2025-01-01') }
        ]
        mockUseUserSubscriptions.mockReturnValue({
            data: mockSubscriptions,
            isLoading: false
        })

        mockUseEvent.mockReturnValue({
            data: {
                id: 101,
                name: 'Event 101',
                startDate: new Date('2025-02-01'),
                endDate: new Date('2025-02-01')
            },
            isLoading: false
        })

        renderWithProviders(<SubscriptionList />)
        
        const eventLink = screen.getByText('Event 101')
        fireEvent.click(eventLink)
        
        expect(mockNavigate).toHaveBeenCalledWith('/events/101')
    })

    it('opens cancel dialog on unsubscribe click', () => {
        const mockSubscriptions = [
            { id: 1, eventId: 101, subscriptionDate: new Date('2025-01-01') }
        ]
        mockUseUserSubscriptions.mockReturnValue({
            data: mockSubscriptions,
            isLoading: false
        })

        mockUseEvent.mockReturnValue({
            data: {
                id: 101,
                name: 'Event 101',
                startDate: new Date('2025-02-01'),
                endDate: new Date('2025-02-01')
            },
            isLoading: false
        })

        renderWithProviders(<SubscriptionList />)
        
        const unsubscribeBtn = screen.getByRole('button', { name: /se désinscrire/i })
        fireEvent.click(unsubscribeBtn)
        
        expect(screen.getByTestId('cancel-dialog')).toBeInTheDocument()
    })

    it('handles loading state for individual event', () => {
        const mockSubscriptions = [
            { id: 1, eventId: 101, subscriptionDate: new Date('2025-01-01') }
        ]
        mockUseUserSubscriptions.mockReturnValue({
            data: mockSubscriptions,
            isLoading: false
        })

        mockUseEvent.mockReturnValue({
            isLoading: true
        })

        renderWithProviders(<SubscriptionList />)
        
        expect(screen.getByText(/chargement de l'événement.../i)).toBeInTheDocument()
    })

    it('handles missing event', () => {
        const mockSubscriptions = [
            { id: 1, eventId: 101, subscriptionDate: new Date('2025-01-01') }
        ]
        mockUseUserSubscriptions.mockReturnValue({
            data: mockSubscriptions,
            isLoading: false
        })

        mockUseEvent.mockReturnValue({
            data: null,
            isLoading: false
        })

        renderWithProviders(<SubscriptionList />)
        
        expect(screen.getByText(/événement introuvable/i)).toBeInTheDocument()
    })
})

