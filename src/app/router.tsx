import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import EventsPage from './pages/events'
import EventDetailPage from './pages/events/$eventId.tsx'
import AdminEventCreatePage from './pages/admin/events/create.tsx'
import AdminEventDetailPage from './pages/admin/events/$eventId.tsx'
import AuthPage from './pages/auth'
import AdminEventsPage from './pages/admin/events/listEvents.tsx'
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute'
import HomePage from './pages/home/index.tsx'
import SubscriptionsListPage from './pages/subscriptions/index.tsx'


export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            {   
                path: 'home',
                index: true, element: <HomePage />
            },
            {
                path: 'events',
                children: [
                    { index: true, element: <EventsPage /> },
                    { path: ':eventId', element: <EventDetailPage /> },
                ],
            },
            {
                path: 'subscriptions',
                children: [
                    { index: true, element: <SubscriptionsListPage /> },
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
                            { path: ':eventId', element: <AdminEventDetailPage /> },
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