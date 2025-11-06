import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type PropsWithChildren, useState } from "react"
import { Toaster } from "react-hot-toast"

import { AuthProvider } from "@/app/features/auth/context/AuthContext"

export function AppProviders({ children }: PropsWithChildren) {
  const [qc] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}