import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import EventsPage from './pages/events'
import EventDetailPage from './pages/events/$eventId.tsx'
import AdminEventCreatePage from './pages/admin/events/create.tsx'
import AuthPage from './pages/auth'
import AdminEventsPage from './pages/admin/events/listEvents.tsx'
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute'


export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            { index: true, element: <div>Home</div> },
            {
                path: 'events',
                children: [
                    { index: true, element: <EventsPage /> },
                    { path: ':eventId', element: <EventDetailPage /> },
                ],
            },
            {
                path: 'admin',
                element: <ProtectedAdminRoute />,
                children: [
                    {
                        path: 'events',
                        children: [
                            { path: 'create', element: <AdminEventCreatePage /> },
                            { index: true, element: <AdminEventsPage /> },
                        ],
                    },
                ],
            },
            {
                path: 'auth',
                children: [{ index: true, element: <AuthPage /> }],
            },
        ],
    },
])