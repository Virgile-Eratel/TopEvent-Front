import { screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders } from '@/test/test-utils'
import AuthPage from './auth/index'
import EventsPage from './events/index'
import EventDetailPage from './events/$eventId'
import SubscriptionsListPage from './subscriptions/index'
import AdminEventsPage from './admin/events/listEvents'
import AdminEventCreatePage from './admin/events/create'

const mockUseEventsList = vi.fn()
const mockUseAdminEventsList = vi.fn()
const mockUseEvent = vi.fn()
const mockUseUserSubscriptions = vi.fn()
const mockUseUserSubscription = vi.fn()
const mockUseAuth = vi.fn()

vi.mock('@/app/features/events/api/queries', () => ({
    useEventsList: () => mockUseEventsList(),
    useAdminEventsList: () => mockUseAdminEventsList(),
    useEvent: (id: unknown) => mockUseEvent(id),
}))

vi.mock('@/app/features/event/api/queries', () => ({
    useEvent: (id: unknown) => mockUseEvent(id),
    useCreateEventMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useUpdateEventMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useDeleteEventMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock('@/app/features/subscriptions/api/queries', () => ({
    useUserSubscriptions: () => mockUseUserSubscriptions(),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    useUserSubscription: (id: unknown) => mockUseUserSubscription(),
    useCreateSubscriptionMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useCancelSubscriptionMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock('@/app/features/auth/context/AuthContext', () => ({
    useAuth: () => mockUseAuth()
}))

describe('Pages', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUseEventsList.mockReturnValue({ data: [], isLoading: false })
        mockUseAdminEventsList.mockReturnValue({ data: [], isLoading: false })
        mockUseEvent.mockReturnValue({ data: null, isLoading: false })
        mockUseUserSubscriptions.mockReturnValue({ data: [], isLoading: false })
        mockUseUserSubscription.mockReturnValue({ data: null, isLoading: false })
        mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'admin' } })
    })

    it('AuthPage renders AuthForms', () => {
        renderWithProviders(<AuthPage />)
        expect(screen.getByText(/Bienvenue sur TopEvent/i)).toBeInTheDocument()
    })

    it('EventsPage renders EventsList', () => {
        mockUseEventsList.mockReturnValue({ data: [], isLoading: false })
        renderWithProviders(<EventsPage />)
        expect(screen.getByRole('heading', { name: /^Événements$/i })).toBeInTheDocument()
    })

    it('EventDetailPage renders EventDetail', () => {
        // Setup route with param
        window.history.pushState({}, 'Test Page', '/events/1')
        
        mockUseEvent.mockReturnValue({ 
            data: { 
                id: 1, name: 'Test Event', 
                startDate: new Date(), endDate: new Date(),
                isPublic: true,
                totalPlaces: 100, currentSubscribers: 0
            }, 
            isLoading: false 
        })
        
        renderWithProviders(
            <Routes>
                <Route path="/events/:eventId" element={<EventDetailPage />} />
            </Routes>
        )
        expect(screen.getByText('Test Event')).toBeInTheDocument()
    })

    it('SubscriptionsListPage renders SubscriptionList', () => {
        mockUseUserSubscriptions.mockReturnValue({ data: [], isLoading: false })
        renderWithProviders(<SubscriptionsListPage />)
        expect(screen.getByText('Mes inscriptions')).toBeInTheDocument()
    })

    it('AdminEventsPage renders EventListAdmin', () => {
        mockUseAdminEventsList.mockReturnValue({ data: [], isLoading: false })
        renderWithProviders(<AdminEventsPage />)
        expect(screen.getByText('Mes événements')).toBeInTheDocument()
    })

    it('AdminEventCreatePage renders EventCreate', () => {
        renderWithProviders(<AdminEventCreatePage />)
        expect(screen.getByText('Créer un événement')).toBeInTheDocument()
    })
})
