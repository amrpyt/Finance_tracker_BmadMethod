import { NextRequest, NextResponse } from 'next/server'
import { isValidEmail } from '@/lib/auth'
import { signUpUser } from '@/lib/auth-dual'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Use dual authentication system for signup
    const result = await signUpUser(name, email, password, request)

    if (!result.success) {
      const statusCode = result.error?.includes('already exists') ? 409 : 500
      return NextResponse.json(
        { error: result.error || 'Account creation failed' },
        { status: statusCode }
      )
    }

    // Return the response from dual auth system
    return result.response || NextResponse.json(
      { 
        message: 'Account created successfully',
        user: { 
          id: result.user!.id, 
          email: result.user!.email,
          name: result.user!.name
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
