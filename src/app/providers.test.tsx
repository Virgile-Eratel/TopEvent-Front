import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppProviders } from './providers'
import { render } from '@testing-library/react'

describe('AppProviders', () => {
    it('renders children', () => {
        render(
            <AppProviders>
                <div data-testid="child">Child</div>
            </AppProviders>
        )
        
        expect(screen.getByTestId('child')).toBeInTheDocument()
    })
})

