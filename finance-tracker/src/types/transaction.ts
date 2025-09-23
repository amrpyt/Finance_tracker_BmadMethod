export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense';

export interface CreateTransactionRequest {
  accountId: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string;
}

export interface CreateTransactionResponse {
  transaction: Transaction;
  updatedAccountBalance: number;
}

export interface GetTransactionsResponse {
  transactions: Transaction[];
}

export interface UpdateTransactionRequest {
  amount?: number;
  type?: TransactionType;
  category?: string;
  description?: string;
  date?: string;
}

export interface UpdateTransactionResponse {
  transaction: Transaction;
  updatedAccountBalance: number;
}

export interface DeleteTransactionResponse {
  deletedTransactionId: string;
  updatedAccountBalance: number;
}

// Transaction Categories
export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Entertainment', 
  'Shopping',
  'Bills',
  'Healthcare',
  'Education'
] as const;

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance', 
  'Investment',
  'Business',
  'Gift',
  'Other'
] as const;

export const TRANSACTION_CATEGORIES = [
  ...EXPENSE_CATEGORIES,
  ...INCOME_CATEGORIES
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type IncomeCategory = typeof INCOME_CATEGORIES[number];
export type TransactionCategory = typeof TRANSACTION_CATEGORIES[number];

// Validation schemas
export const TRANSACTION_TYPES: TransactionType[] = ['income', 'expense'];

export const validateTransactionType = (type: string): type is TransactionType => {
  return TRANSACTION_TYPES.includes(type as TransactionType);
};

export const validateTransactionCategory = (category: string): category is TransactionCategory => {
  return TRANSACTION_CATEGORIES.includes(category as TransactionCategory);
};

export const validateAmount = (amount: number): boolean => {
  return typeof amount === 'number' && amount > 0 && Number.isFinite(amount);
};

export const validateDescription = (description: string): boolean => {
  return Boolean(description && description.trim().length >= 3 && description.trim().length <= 100);
};

export const validateTransactionDate = (date: string): boolean => {
  const transactionDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  return (
    !isNaN(transactionDate.getTime()) &&
    transactionDate <= today
  );
};

export const validateCreateTransactionRequest = (data: unknown): data is CreateTransactionRequest => {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  
  return (
    typeof obj.accountId === 'string' &&
    obj.accountId.trim().length > 0 &&
    typeof obj.amount === 'number' &&
    validateAmount(obj.amount) &&
    typeof obj.type === 'string' &&
    validateTransactionType(obj.type) &&
    typeof obj.category === 'string' &&
    validateTransactionCategory(obj.category) &&
    typeof obj.description === 'string' &&
    validateDescription(obj.description) &&
    typeof obj.date === 'string' &&
    validateTransactionDate(obj.date)
  );
};

export const validateUpdateTransactionRequest = (data: unknown): data is UpdateTransactionRequest => {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  
  // At least one field must be provided
  const hasAnyField = obj.amount !== undefined || 
                      obj.type !== undefined || 
                      obj.category !== undefined || 
                      obj.description !== undefined || 
                      obj.date !== undefined;
                      
  if (!hasAnyField) return false;
  
  // Validate provided fields
  if (obj.amount !== undefined && (typeof obj.amount !== 'number' || !validateAmount(obj.amount))) {
    return false;
  }
  
  if (obj.type !== undefined && (typeof obj.type !== 'string' || !validateTransactionType(obj.type))) {
    return false;
  }
  
  if (obj.category !== undefined && (typeof obj.category !== 'string' || !validateTransactionCategory(obj.category))) {
    return false;
  }
  
  if (obj.description !== undefined && (typeof obj.description !== 'string' || !validateDescription(obj.description))) {
    return false;
  }
  
  if (obj.date !== undefined && (typeof obj.date !== 'string' || !validateTransactionDate(obj.date))) {
    return false;
  }
  
  return true;
};

// Helper functions for category filtering
export const getCategoriesForType = (type: TransactionType): readonly string[] => {
  return type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
};

export const isCategoryValidForType = (category: string, type: TransactionType): boolean => {
  const validCategories = getCategoriesForType(type);
  return validCategories.includes(category as TransactionCategory);
};
