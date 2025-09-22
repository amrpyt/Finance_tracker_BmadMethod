import { NextRequest } from 'next/server'
import { POST as signupPOST } from '@/app/api/auth/signup/route'
import { GET as authMeGET } from '@/app/api/auth/me/route'

// Mock database for integration tests
const mockUsers: any[] = []

// Create a proper mock that tracks state
let mockSupabaseState = {
  users: [] as any[]
}

jest.mock('@/lib/database', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => {
            const { users } = mockSupabaseState
            const existingUser = users.find(u => 
              u.email && (
                u.email.toLowerCase() === 'test@example.com' || 
                u.email.toLowerCase() === 'duplicate@example.com'
              )
            )
            return Promise.resolve({
              data: existingUser || null,
              error: existingUser ? null : { code: 'PGRST116' }
            })
          })
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => {
            // Mock successful insert - add to our state
            const newUser = {
              id: 'test-user-id',
              name: 'Test User',
              email: 'test@example.com',
              password_hash: 'hashed-password',
              created_at: new Date().toISOString()
            }
            mockSupabaseState.users.push(newUser)
            return Promise.resolve({
              data: newUser,
              error: null
            })
          })
        }))
      }))
    }))
  }
}))

// Don't mock auth utilities for integration test
jest.unmock('@/lib/auth')

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    mockUsers.length = 0 // Clear users array
    mockSupabaseState.users.length = 0 // Clear mock state
  })

  it('should complete full signup and authentication flow', async () => {
    // Step 1: Create account
    const signupRequest = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    })

    const signupResponse = await signupPOST(signupRequest)
    const signupData = await signupResponse.json()

    expect(signupResponse.status).toBe(201)
    expect(signupData.message).toBe('Account created successfully')
    expect(signupData.user.email).toBe('test@example.com')

    // Step 2: Extract JWT token from cookie
    const cookies = signupResponse.headers.get('set-cookie')
    expect(cookies).toContain('auth-token=')
    
    const tokenMatch = cookies?.match(/auth-token=([^;]+)/)
    const token = tokenMatch?.[1]
    expect(token).toBeDefined()

    // Step 3: Verify authentication with JWT
    const authRequest = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Cookie': `auth-token=${token}`
      }
    })

    const authResponse = await authMeGET(authRequest)
    const authData = await authResponse.json()

    expect(authResponse.status).toBe(200)
    expect(authData.user.email).toBe('test@example.com')
    expect(authData.user.id).toBeDefined()
  })

  it('should prevent duplicate account creation', async () => {
    // Create first account
    const firstRequest = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'First User',
        email: 'duplicate@example.com',
        password: 'password123'
      })
    })

    const firstResponse = await signupPOST(firstRequest)
    expect(firstResponse.status).toBe(201)

    // Attempt to create duplicate account
    const duplicateRequest = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate User',
        email: 'duplicate@example.com',
        password: 'differentpassword'
      })
    })

    const duplicateResponse = await signupPOST(duplicateRequest)
    const duplicateData = await duplicateResponse.json()

    expect(duplicateResponse.status).toBe(409)
    expect(duplicateData.error).toBe('An account with this email already exists')
  })

  it('should reject authentication with invalid token', async () => {
    const authRequest = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Cookie': 'auth-token=invalid.jwt.token'
      }
    })

    const authResponse = await authMeGET(authRequest)
    const authData = await authResponse.json()

    expect(authResponse.status).toBe(401)
    expect(authData.error).toBe('Invalid token')
  })

  it('should reject authentication with no token', async () => {
    const authRequest = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'GET'
    })

    const authResponse = await authMeGET(authRequest)
    const authData = await authResponse.json()

    expect(authResponse.status).toBe(401)
    expect(authData.error).toBe('Not authenticated')
  })
})
