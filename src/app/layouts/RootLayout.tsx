import { Outlet } from 'react-router-dom'

export default function RootLayout() {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <main className="flex-1 w-full">
                <Outlet />
            </main>
        </div>
    )
}

