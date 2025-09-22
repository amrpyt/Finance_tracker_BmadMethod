import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth-dual'

export async function GET(request: NextRequest) {
  try {
    // Use dual authentication system to get user context
    const authContext = await getAuthContext(request)

    if (!authContext.isAuthenticated || !authContext.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { 
        user: { 
          id: authContext.user.id, 
          email: authContext.user.email,
          name: authContext.user.name
        },
        authType: authContext.authType,
        isMigrated: authContext.user.isMigrated
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
