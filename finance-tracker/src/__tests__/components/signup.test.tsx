import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignupPage from '@/app/signup/page'

// Mock fetch
const mockPush = jest.fn()
global.fetch = jest.fn()

// Mock Next.js router at the module level
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
}))

describe('SignupPage Component', () => {
  beforeEach(() => {
    ;(fetch as jest.Mock).mockClear()
    mockPush.mockClear()
  })

  it('renders signup form with all required fields', () => {
    render(<SignupPage />)
    
    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password \(min\. 8 characters\)/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('shows error when passwords do not match', async () => {
    render(<SignupPage />)
    
    fireEvent.change(screen.getByPlaceholderText(/full name/i), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByPlaceholderText(/email address/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByPlaceholderText(/password \(min\. 8 characters\)/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: 'different123' } })
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })

  it('shows error when password is too short', async () => {
    render(<SignupPage />)
    
    fireEvent.change(screen.getByPlaceholderText(/full name/i), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByPlaceholderText(/email address/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByPlaceholderText(/password \(min\. 8 characters\)/i), { target: { value: '1234567' } })
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: '1234567' } })
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument()
    })
  })

  it('submits form with valid data and redirects on success', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Account created successfully',
        user: { id: 'test-id', email: 'test@example.com' }
      })
    })

    render(<SignupPage />)
    
    fireEvent.change(screen.getByPlaceholderText(/full name/i), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByPlaceholderText(/email address/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByPlaceholderText(/password \(min\. 8 characters\)/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: 'password123' } })
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
      })
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows error message when API returns error', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'An account with this email already exists'
      })
    })

    render(<SignupPage />)
    
    fireEvent.change(screen.getByPlaceholderText(/full name/i), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByPlaceholderText(/email address/i), { target: { value: 'existing@example.com' } })
    fireEvent.change(screen.getByPlaceholderText(/password \(min\. 8 characters\)/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: 'password123' } })
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))
    
    await waitFor(() => {
      expect(screen.getByText('An account with this email already exists')).toBeInTheDocument()
    })
  })

  it('shows loading state during form submission', async () => {
    ;(fetch as jest.Mock).mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({
        ok: true,
        json: async () => ({ message: 'Success' })
      }), 100)
    ))

    render(<SignupPage />)
    
    fireEvent.change(screen.getByPlaceholderText(/full name/i), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByPlaceholderText(/email address/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByPlaceholderText(/password \(min\. 8 characters\)/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: 'password123' } })
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))
    
    expect(screen.getByText('Creating Account...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled()
  })

  it('handles network errors gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<SignupPage />)
    
    fireEvent.change(screen.getByPlaceholderText(/full name/i), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByPlaceholderText(/email address/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByPlaceholderText(/password \(min\. 8 characters\)/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: 'password123' } })
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument()
    })
  })
})
