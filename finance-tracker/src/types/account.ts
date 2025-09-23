export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number;
  created_at: string;
}

export type AccountType = 'bank' | 'cash' | 'wallet' | 'credit_card';

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
}

export interface CreateAccountResponse {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  created_at: string;
}

export interface GetAccountsResponse {
  accounts: Account[];
}

export interface UpdateAccountRequest {
  name: string;
}

export interface UpdateAccountResponse {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  created_at: string;
}

export interface DeleteAccountResponse {
  deletedAccountId: string;
  deletedTransactionCount: number;
}

// Validation schemas
export const ACCOUNT_TYPES: AccountType[] = ['bank', 'cash', 'wallet', 'credit_card'];

export const validateAccountName = (name: string): boolean => {
  return Boolean(name && name.trim().length >= 2 && name.trim().length <= 50);
};

export const validateAccountType = (type: string): type is AccountType => {
  return ACCOUNT_TYPES.includes(type as AccountType);
};

export const validateCreateAccountRequest = (data: unknown): data is CreateAccountRequest => {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  
  return (
    typeof obj.name === 'string' &&
    validateAccountName(obj.name) &&
    typeof obj.type === 'string' &&
    validateAccountType(obj.type)
  );
};

export const validateUpdateAccountRequest = (data: unknown): data is UpdateAccountRequest => {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  
  return (
    typeof obj.name === 'string' &&
    validateAccountName(obj.name)
  );
};
