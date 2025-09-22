import { NextRequest, NextResponse } from 'next/server'
import { isValidEmail } from '@/lib/auth'
import { authenticateUser } from '@/lib/auth-dual'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Use dual authentication system for login
    const result = await authenticateUser(email, password, request)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Authentication failed' },
        { status: 401 }
      )
    }

    // Add migration notification if user was just migrated
    const responseData: any = {
      message: 'Authentication successful',
      user: {
        id: result.user!.id,
        email: result.user!.email,
        name: result.user!.name
      }
    }

    if (result.migrated) {
      responseData.migrated = true
      responseData.message = 'Authentication successful - Account upgraded to enhanced security'
    }

    // Return the response from dual auth system or create our own
    if (result.response) {
      return result.response
    }

    return NextResponse.json(responseData, { status: 200 })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
