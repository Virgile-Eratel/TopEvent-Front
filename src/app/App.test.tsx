import { screen, render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { App } from './App'

// Mock everything App uses
vi.mock('./providers', () => ({
    AppProviders: ({ children }: { children: React.ReactNode }) => <div data-testid="providers">{children}</div>
}))

vi.mock('react-router-dom', () => ({
    RouterProvider: () => <div data-testid="router">Router</div>,
    // Add other exports if needed by App imports (though App only uses RouterProvider directly)
}))

vi.mock('./router', () => ({
    router: {}
}))

describe('App', () => {
    it('renders providers and router', () => {
        render(<App />)
        
        expect(screen.getByTestId('providers')).toBeInTheDocument()
        expect(screen.getByTestId('router')).toBeInTheDocument()
    })
})

