import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test basic imports
    const { betterAuth } = await import('better-auth');
    const { Pool } = await import('pg');
    
    // Test environment variables
    const hasSecret = !!process.env.BETTER_AUTH_SECRET;
    const hasUrl = !!process.env.BETTER_AUTH_URL;
    const hasDbUrl = !!process.env.DATABASE_URL;
    
    return NextResponse.json({
      status: 'success',
      message: 'BetterAuth setup test',
      checks: {
        betterAuthImport: 'OK',
        pgImport: 'OK',
        environmentVariables: {
          BETTER_AUTH_SECRET: hasSecret ? 'SET' : 'MISSING',
          BETTER_AUTH_URL: hasUrl ? 'SET' : 'MISSING',
          DATABASE_URL: hasDbUrl ? 'SET' : 'MISSING',
        }
      },
      nextSteps: [
        'Run database migrations',
        'Test authentication endpoints',
        'Integrate with frontend'
      ]
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'BetterAuth setup test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
