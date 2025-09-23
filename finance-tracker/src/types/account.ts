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

// Validation schemas
export const ACCOUNT_TYPES: AccountType[] = ['bank', 'cash', 'wallet', 'credit_card'];

export const validateAccountName = (name: string): boolean => {
  return Boolean(name && name.trim().length >= 2 && name.trim().length <= 50);
};

export const validateAccountType = (type: string): type is AccountType => {
  return ACCOUNT_TYPES.includes(type as AccountType);
};

export const validateCreateAccountRequest = (data: any): data is CreateAccountRequest => {
  return (
    data &&
    typeof data.name === 'string' &&
    validateAccountName(data.name) &&
    typeof data.type === 'string' &&
    validateAccountType(data.type)
  );
};
