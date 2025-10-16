import { createBrowserRouter } from 'react-router-dom'
import EventsPage from "./pages/events";
import EventDetailPage from "./pages/events/$eventId.tsx";
import AdminEventCreatePage from "./pages/admin/events/create.tsx";


export const router = createBrowserRouter([
    { path: '/', element: <div>Home</div> },
    {
        path: '/events',
        children: [
            { index: true, element: <EventsPage /> },
            { path: ':eventId', element: <EventDetailPage /> },
        ],
    },
    {
        path: '/admin/events',
        children: [{ path: 'create', element: <AdminEventCreatePage /> }],
    },
])