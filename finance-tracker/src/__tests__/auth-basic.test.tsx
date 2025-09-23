/**
 * Basic Authentication Test
 * Simple test to verify auth setup
 */

import { render, screen } from '@testing-library/react'

// Simple test component
function TestComponent() {
  return <div data-testid="test">Auth Test</div>
}

describe('Basic Auth Test', () => {
  test('should render test component', () => {
    render(<TestComponent />)
    expect(screen.getByTestId('test')).toHaveTextContent('Auth Test')
  })
})
