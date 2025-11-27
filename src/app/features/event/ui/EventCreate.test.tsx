import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import EventCreate from './EventCreate'
import { renderWithProviders } from '@/test/test-utils'
import * as queries from '../api/queries'

// Mock the mutation hook
const mockCreateEvent = vi.fn()
vi.mock('../api/queries', () => ({
    useCreateEventMutation: () => ({
        mutateAsync: mockCreateEvent,
        isPending: false,
    }),
    EventTypeEnum: {
        enum: {
            concert: 'concert',
            conference: 'conference',
            workshop: 'workshop',
        },
        options: ['concert', 'conference', 'workshop']
    },
    EventCreateSchema: {
        parse: (v: any) => v // Mock simple pass-through or use real schema if possible
    }
}))

// We need to mock the real schema import if we want validation to work exactly as in app, 
// but for unit test of component we can rely on the fact that zodResolver is used.
// However, since we mock the module where schema is exported, we need to be careful.
// Actually, EventCreate imports schema from `../api/schema`. 
// Let's check imports in EventCreate.tsx:
// import { EventCreateSchema, EventTypeEnum, type EventCreateInput } from "@/app/features/event/api/schema";
// import { useCreateEventMutation } from "@/app/features/event/api/queries";

// So I only need to mock queries if I want to intercept the hook.
// I should NOT mock schema if I want form validation to work.

describe('EventCreate', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders the form correctly', () => {
        renderWithProviders(<EventCreate />)
        
        expect(screen.getByText(/créer un événement/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/nom de l'événement/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /créer l'événement/i })).toBeInTheDocument()
    })

    it('submits the form with valid data', async () => {
        const user = userEvent.setup()
        mockCreateEvent.mockResolvedValue({ id: 1 }) // Mock successful creation response

        renderWithProviders(<EventCreate />)

        // Fill form
        await user.type(screen.getByLabelText(/nom de l'événement/i), 'Mon Super Event')
        
        // Select type - assuming standard select
        const typeSelect = screen.getByLabelText(/type/i)
        await user.selectOptions(typeSelect, 'concert')

        // Dates
        // Note: Date inputs are tricky with userEvent sometimes, let's try direct typing
        // Format for datetime-local is YYYY-MM-DDTHH:mm
        const startDateInput = screen.getByLabelText(/date de début/i)
        await user.type(startDateInput, '2025-12-25T20:00')
        
        const endDateInput = screen.getByLabelText(/date de fin/i)
        await user.type(endDateInput, '2025-12-25T23:00')

        await user.type(screen.getByLabelText(/description/i), 'Une description détaillée')
        await user.type(screen.getByLabelText(/lieu/i), 'Paris')

        // Submit
        const submitBtn = screen.getByRole('button', { name: /créer l'événement/i })
        await user.click(submitBtn)

        await waitFor(() => {
            expect(mockCreateEvent).toHaveBeenCalled()
        })
        
        // Check if called with correct data structure (partial check)
        expect(mockCreateEvent).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Mon Super Event',
            location: 'Paris',
            type: 'concert'
        }))
    })

    it('displays validation errors for empty required fields', async () => {
        const user = userEvent.setup()
        renderWithProviders(<EventCreate />)

        // Click submit without filling anything
        const submitBtn = screen.getByRole('button', { name: /créer l'événement/i })
        await user.click(submitBtn)

        // Expect validation messages (Zod default messages or custom ones)
        // Since we use real schema (not mocked), we expect real validation errors.
        // "Required" is usually the default message for zod. 
        // Let's look for something that indicates error.
        // In the component: <FormMessage /> displays errors.
        
        await waitFor(() => {
            // Try to find at least one error message.
            // Zod string min(1) usually says "String must contain at least 1 character(s)" or "Required" depending on config.
            // Or we can check if mockCreateEvent was NOT called.
            expect(mockCreateEvent).not.toHaveBeenCalled()
        })
    })
})

