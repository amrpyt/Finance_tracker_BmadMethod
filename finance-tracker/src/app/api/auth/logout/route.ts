import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth-dual'

export async function POST(request: NextRequest) {
  try {
    // Get current authentication context
    const authContext = await getAuthContext(request)

    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    )

    // Clear legacy JWT token cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expire immediately
    })

    // If user was authenticated via BetterAuth, also handle BetterAuth logout
    if (authContext.authType === 'betterauth') {
      try {
        const { auth } = await import('@/lib/auth-betterauth')
        await auth.api.signOut({
          headers: request.headers
        })
        
        // Clear BetterAuth session cookies
        const betterAuthCookies = [
          'better-auth.session_token',
          'better-auth.csrf_token',
          '__Secure-better-auth.session_token',
          '__Secure-better-auth.csrf_token'
        ]

        betterAuthCookies.forEach(cookieName => {
          response.cookies.set(cookieName, '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0
          })
        })
      } catch (error) {
        console.error('BetterAuth logout error:', error)
        // Continue with logout even if BetterAuth logout fails
      }
    }

    return response

  } catch (error) {
    console.error('Logout error:', error)
    
    // Even if there's an error, clear cookies and return success
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    )

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    })

    return response
  }
}
