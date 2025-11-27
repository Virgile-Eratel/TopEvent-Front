import { screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { AuthForms } from './AuthForms'
import { renderWithProviders } from '@/test/test-utils'

// Mock components to simplify testing the switching logic
vi.mock('./LoginForm', () => ({
    LoginForm: () => <div data-testid="login-form">Login Form</div>
}))

vi.mock('./RegisterForm', () => ({
    RegisterForm: () => <div data-testid="register-form">Register Form</div>
}))

describe('AuthForms', () => {
    it('renders login form by default', () => {
        renderWithProviders(<AuthForms />)
        
        expect(screen.getByTestId('login-form')).toBeInTheDocument()
        expect(screen.getByText('Connexion')).toBeInTheDocument()
        expect(screen.getByText("Pas encore de compte ?")).toBeInTheDocument()
        expect(screen.getByRole('button', { name: "Créer un compte" })).toBeInTheDocument()
    })

    it('switches to register form when link is clicked', () => {
        renderWithProviders(<AuthForms />)
        
        const toggleLink = screen.getByRole('button', { name: "Créer un compte" })
        fireEvent.click(toggleLink)

        expect(screen.getByTestId('register-form')).toBeInTheDocument()
        expect(screen.getByText('Créer un compte')).toBeInTheDocument()
        expect(screen.getByText("Déjà inscrit ?")).toBeInTheDocument()
        expect(screen.getByRole('button', { name: "Se connecter" })).toBeInTheDocument()
    })

    it('switches back to login form', () => {
        renderWithProviders(<AuthForms />)
        
        // Switch to register
        fireEvent.click(screen.getByRole('button', { name: "Créer un compte" }))
        
        // Switch back to login
        fireEvent.click(screen.getByRole('button', { name: "Se connecter" }))
        
        expect(screen.getByTestId('login-form')).toBeInTheDocument()
        expect(screen.getByText('Connexion')).toBeInTheDocument()
    })

    it('switches view on Enter key press', () => {
        renderWithProviders(<AuthForms />)
        
        const toggleLink = screen.getByRole('button', { name: "Créer un compte" })
        fireEvent.keyDown(toggleLink, { key: 'Enter' })

        expect(screen.getByTestId('register-form')).toBeInTheDocument()
    })
})

