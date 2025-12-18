import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import EventListAdmin from './EventListAdmin'
import { renderWithProviders } from '@/test/test-utils'

const mockUseAdminEventsList = vi.fn()
const mockUpdateEvent = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate
    }
})

vi.mock('@/app/features/events/api/queries', () => ({
    useAdminEventsList: () => mockUseAdminEventsList()
}))

vi.mock('@/app/features/event/api/queries', () => ({
    useUpdateEventMutation: () => ({
        mutateAsync: mockUpdateEvent,
        isPending: false
    })
}))

vi.mock('./DeleteEventDialog', () => ({
    DeleteEventDialog: ({ open, onSuccess }: { open: boolean, onSuccess: () => void }) => 
        open ? (
            <div data-testid="delete-dialog">
                Delete Dialog
                <button onClick={onSuccess}>Confirm Delete</button>
            </div>
        ) : null
}))

vi.mock('../../users/api/schema.ts', () => ({
    UserSchemaSecure: {}
}))
vi.mock('../../subscriptions/api/schema.ts', () => ({
    SubscriptionSchema: {}
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

describe('EventListAdmin', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUseAdminEventsList.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false
        })
    })

    it('renders loading state', () => {
        mockUseAdminEventsList.mockReturnValue({ isLoading: true })
        renderWithProviders(<EventListAdmin />)
        expect(screen.getByText(/chargement de vos événements/i)).toBeInTheDocument()
    })

    it('renders error state', () => {
        mockUseAdminEventsList.mockReturnValue({ isError: true, error: new Error('Failed') })
        renderWithProviders(<EventListAdmin />)
        expect(screen.getByText(/une erreur est survenue : failed/i)).toBeInTheDocument()
    })

    it('renders empty state', () => {
        mockUseAdminEventsList.mockReturnValue({ data: [], isLoading: false })
        renderWithProviders(<EventListAdmin />)
        expect(screen.getByText(/aucun événement pour le moment/i)).toBeInTheDocument()
    })

    it('renders list of events', () => {
        const mockEvents = [{
            id: 1,
            name: 'My Event',
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-01-02'),
            location: 'Paris',
            type: 'concert',
            isPublic: true,
            totalPlaces: 100,
            currentSubscribers: 5
        }]
        mockUseAdminEventsList.mockReturnValue({ data: mockEvents, isLoading: false })
        
        renderWithProviders(<EventListAdmin />)
        expect(screen.getByText('My Event')).toBeInTheDocument()
        expect(screen.getByText('Paris')).toBeInTheDocument()
    })

    it('opens edit sheet on click', async () => {
        const mockEvents = [{
            id: 1,
            name: 'My Event',
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-01-02'),
            location: 'Paris',
            type: 'concert',
            isPublic: true,
            totalPlaces: 100,
            currentSubscribers: 5
        }]
        mockUseAdminEventsList.mockReturnValue({ data: mockEvents, isLoading: false })
        
        renderWithProviders(<EventListAdmin />)
        
        const editBtn = screen.getByRole('button', { name: 'Modifier' })
        fireEvent.click(editBtn)
        
        expect(screen.getByText('Modifier un événement')).toBeInTheDocument()
        // We expect 2 instances: one in table, one in sheet
        expect(screen.getAllByText('My Event')).toHaveLength(2)
    })

    // it('submits edit form', async () => {
    //     const mockEvents = [{
    //         id: 1,
    //         name: 'My Event',
    //         startDate: new Date('2025-01-01T10:00:00'),
    //         endDate: new Date('2025-01-02T10:00:00'),
    //         location: 'Paris',
    //         type: 'concert',
    //         isPublic: true,
    //         totalPlaces: 100,
    //         currentSubscribers: 5
    //     }]
    //     mockUseAdminEventsList.mockReturnValue({ data: mockEvents, isLoading: false })
    //     mockUpdateEvent.mockResolvedValue({})
    //     
    //     const user = userEvent.setup()
    //     renderWithProviders(<EventListAdmin />)
    //     
    //     // Open sheet
    //     await user.click(screen.getByRole('button', { name: 'Modifier' }))
    //     
    //     // Modify
    //     const nameInput = screen.getByLabelText(/nom de l'événement/i)
    //     await user.clear(nameInput)
    //     await user.type(nameInput, 'Updated Event')
    //     
    //     // Submit
    //     const submitBtn = screen.getByRole('button', { name: /enregistrer les modifications/i })
    //     await user.click(submitBtn)
    //     
    //     await waitFor(() => {
    //         expect(mockUpdateEvent).toHaveBeenCalledWith(expect.objectContaining({
    //             eventId: 1,
    //             values: expect.objectContaining({ name: 'Updated Event' })
    //         }))
    //     })
    // })

    it('opens delete dialog', async () => {
        const mockEvents = [{
            id: 1,
            name: 'My Event',
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-01-02'),
            location: 'Paris'
        }]
        mockUseAdminEventsList.mockReturnValue({ data: mockEvents, isLoading: false })
        
        renderWithProviders(<EventListAdmin />)
        
        const deleteBtn = screen.getByRole('button', { name: 'Supprimer' })
        fireEvent.click(deleteBtn)
        
        expect(screen.getByTestId('delete-dialog')).toBeInTheDocument()
    })

    it('shows pagination when there are more than 10 events', () => {
        const mockEvents = Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            name: `Event ${i + 1}`,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-01-02'),
            location: 'Paris',
            type: 'concert',
            isPublic: true,
            totalPlaces: 100,
            currentSubscribers: 5
        }))
        mockUseAdminEventsList.mockReturnValue({ data: mockEvents, isLoading: false })
        
        renderWithProviders(<EventListAdmin />)
        
        expect(screen.getByRole('navigation', { name: 'pagination' })).toBeInTheDocument()
        expect(screen.getByText('Suivant')).toBeInTheDocument()
        expect(screen.getByText('Précédent')).toBeInTheDocument()
    })

    it('does not show pagination when there are 10 or fewer events', () => {
        const mockEvents = Array.from({ length: 5 }, (_, i) => ({
            id: i + 1,
            name: `Event ${i + 1}`,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-01-02'),
            location: 'Paris',
            type: 'concert',
            isPublic: true,
            totalPlaces: 100,
            currentSubscribers: 5
        }))
        mockUseAdminEventsList.mockReturnValue({ data: mockEvents, isLoading: false })
        
        renderWithProviders(<EventListAdmin />)
        
        expect(screen.queryByRole('navigation', { name: 'pagination' })).not.toBeInTheDocument()
    })

    it('paginates events correctly', async () => {
        const user = userEvent.setup()
        const mockEvents = Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            name: `Event ${i + 1}`,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-01-02'),
            location: 'Paris',
            type: 'concert',
            isPublic: true,
            totalPlaces: 100,
            currentSubscribers: 5
        }))
        mockUseAdminEventsList.mockReturnValue({ data: mockEvents, isLoading: false })
        
        renderWithProviders(<EventListAdmin />)
        
        // First page should show events 1-10
        expect(screen.getByText('Event 1')).toBeInTheDocument()
        expect(screen.getByText('Event 10')).toBeInTheDocument()
        expect(screen.queryByText('Event 11')).not.toBeInTheDocument()
        
        // Click next page
        const nextButton = screen.getByText('Suivant')
        await user.click(nextButton)
        
        // Second page should show events 11-15
        expect(screen.queryByText('Event 1')).not.toBeInTheDocument()
        expect(screen.getByText('Event 11')).toBeInTheDocument()
        expect(screen.getByText('Event 15')).toBeInTheDocument()
    })

    it('displays page info in results text', () => {
        const mockEvents = Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            name: `Event ${i + 1}`,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-01-02'),
            location: 'Paris',
            type: 'concert',
            isPublic: true,
            totalPlaces: 100,
            currentSubscribers: 5
        }))
        mockUseAdminEventsList.mockReturnValue({ data: mockEvents, isLoading: false })
        
        renderWithProviders(<EventListAdmin />)
        
        expect(screen.getByText(/résultats : 15.*page 1\/2/i)).toBeInTheDocument()
    })

    it('disables previous button on first page', () => {
        const mockEvents = Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            name: `Event ${i + 1}`,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-01-02'),
            location: 'Paris',
            type: 'concert',
            isPublic: true,
            totalPlaces: 100,
            currentSubscribers: 5
        }))
        mockUseAdminEventsList.mockReturnValue({ data: mockEvents, isLoading: false })
        
        renderWithProviders(<EventListAdmin />)
        
        const prevButton = screen.getByText('Précédent').closest('button')
        expect(prevButton).toHaveClass('pointer-events-none')
        expect(prevButton).toHaveClass('opacity-50')
    })

    it('disables next button on last page', async () => {
        const user = userEvent.setup()
        const mockEvents = Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            name: `Event ${i + 1}`,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-01-02'),
            location: 'Paris',
            type: 'concert',
            isPublic: true,
            totalPlaces: 100,
            currentSubscribers: 5
        }))
        mockUseAdminEventsList.mockReturnValue({ data: mockEvents, isLoading: false })
        
        renderWithProviders(<EventListAdmin />)
        
        // Go to last page
        const nextButton = screen.getByText('Suivant')
        await user.click(nextButton)
        
        // Next button should be disabled on last page
        expect(nextButton.closest('button')).toHaveClass('pointer-events-none')
        expect(nextButton.closest('button')).toHaveClass('opacity-50')
    })
})
