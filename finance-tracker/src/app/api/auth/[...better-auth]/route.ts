import { auth } from "@/lib/auth-betterauth";
import { NextRequest, NextResponse } from "next/server";

// Handle all HTTP methods for BetterAuth
export async function GET(request: NextRequest) {
  try {
    return await auth.handler(request);
  } catch (error) {
    console.error('BetterAuth GET error:', error);
    return NextResponse.json(
      { error: 'Authentication service temporarily unavailable' },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    return await auth.handler(request);
  } catch (error) {
    console.error('BetterAuth POST error:', error);
    return NextResponse.json(
      { error: 'Authentication service temporarily unavailable' },
      { status: 503 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    return await auth.handler(request);
  } catch (error) {
    console.error('BetterAuth PUT error:', error);
    return NextResponse.json(
      { error: 'Authentication service temporarily unavailable' },
      { status: 503 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    return await auth.handler(request);
  } catch (error) {
    console.error('BetterAuth DELETE error:', error);
    return NextResponse.json(
      { error: 'Authentication service temporarily unavailable' },
      { status: 503 }
    );
  }
}
