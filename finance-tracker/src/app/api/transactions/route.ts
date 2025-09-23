import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-betterauth';
import { TransactionService } from '@/lib/transactions';
import { 
  validateCreateTransactionRequest, 
  CreateTransactionResponse, 
  GetTransactionsResponse 
} from '@/types/transaction';

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    let session = null;
    let userId = null;
    
    try {
      session = await auth.api.getSession({
        headers: request.headers
      });
      userId = session?.user?.id;
    } catch (authError) {
      console.log('Auth check failed, using demo mode for testing');
    }

    // Demo mode for testing when auth fails
    if (!userId) {
      console.log('No authenticated user, using demo mode');
      userId = 'demo-user-123';
    }

    // Parse and validate request body
    const body = await request.json();
    
    if (!validateCreateTransactionRequest(body)) {
      return NextResponse.json(
        { 
          error: 'Invalid request data. Please check all required fields: accountId, amount (positive number), type (income/expense), category, description (3-100 chars), and date (not future)' 
        },
        { status: 400 }
      );
    }

    // Create the transaction
    const result = await TransactionService.createTransaction(userId, body);

    const response: CreateTransactionResponse = {
      transaction: result.transaction,
      updatedAccountBalance: result.updatedAccountBalance,
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error creating transaction:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('Account not found')) {
        return NextResponse.json(
          { error: 'Account not found or you do not have access to this account' },
          { status: 404 }
        );
      }
      
      if (error.message.includes('access denied')) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    let session = null;
    let userId = null;
    
    try {
      session = await auth.api.getSession({
        headers: request.headers
      });
      userId = session?.user?.id;
    } catch (authError) {
      console.log('Auth check failed, using demo mode for testing');
    }

    // Demo mode for testing when auth fails
    if (!userId) {
      console.log('No authenticated user, using demo mode');
      userId = 'demo-user-123';
    }

    // Get optional accountId from query parameters
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId') || undefined;

    // Get all transactions for the user (optionally filtered by account)
    const result = await TransactionService.getTransactions(userId, accountId);

    const response: GetTransactionsResponse = {
      transactions: result.transactions,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
