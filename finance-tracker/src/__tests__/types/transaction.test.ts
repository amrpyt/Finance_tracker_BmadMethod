import {
  validateTransactionType,
  validateTransactionCategory,
  validateAmount,
  validateDescription,
  validateTransactionDate,
  validateCreateTransactionRequest,
  validateUpdateTransactionRequest,
  getCategoriesForType,
  isCategoryValidForType,
  TRANSACTION_TYPES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  TRANSACTION_CATEGORIES,
  type CreateTransactionRequest,
  type UpdateTransactionRequest,
} from '../../types/transaction';

describe('Transaction Type Validations', () => {
  describe('validateTransactionType', () => {
    it('should validate income and expense types', () => {
      expect(validateTransactionType('income')).toBe(true);
      expect(validateTransactionType('expense')).toBe(true);
    });

    it('should reject invalid transaction types', () => {
      expect(validateTransactionType('invalid')).toBe(false);
      expect(validateTransactionType('')).toBe(false);
      expect(validateTransactionType('INCOME')).toBe(false);
    });
  });

  describe('validateTransactionCategory', () => {
    it('should validate expense categories', () => {
      EXPENSE_CATEGORIES.forEach(category => {
        expect(validateTransactionCategory(category)).toBe(true);
      });
    });

    it('should validate income categories', () => {
      INCOME_CATEGORIES.forEach(category => {
        expect(validateTransactionCategory(category)).toBe(true);
      });
    });

    it('should reject invalid categories', () => {
      expect(validateTransactionCategory('InvalidCategory')).toBe(false);
      expect(validateTransactionCategory('')).toBe(false);
      expect(validateTransactionCategory('food')).toBe(false); // case sensitive
    });
  });

  describe('validateAmount', () => {
    it('should accept positive numbers', () => {
      expect(validateAmount(1)).toBe(true);
      expect(validateAmount(10.99)).toBe(true);
      expect(validateAmount(1000000)).toBe(true);
    });

    it('should reject zero, negative, and invalid numbers', () => {
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-1)).toBe(false);
      expect(validateAmount(Infinity)).toBe(false);
      expect(validateAmount(NaN)).toBe(false);
    });
  });

  describe('validateDescription', () => {
    it('should accept valid descriptions', () => {
      expect(validateDescription('Lunch at restaurant')).toBe(true);
      expect(validateDescription('Salary payment from company')).toBe(true);
      expect(validateDescription('Gas')).toBe(true); // minimum 3 chars
      expect(validateDescription('a'.repeat(100))).toBe(true); // maximum 100 chars
    });

    it('should reject invalid descriptions', () => {
      expect(validateDescription('')).toBe(false);
      expect(validateDescription('  ')).toBe(false);
      expect(validateDescription('ab')).toBe(false); // too short
      expect(validateDescription('a'.repeat(101))).toBe(false); // too long
    });
  });

  describe('validateTransactionDate', () => {
    it('should accept valid dates (today and past)', () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      expect(validateTransactionDate(today)).toBe(true);
      expect(validateTransactionDate(yesterday)).toBe(true);
      expect(validateTransactionDate('2023-01-01')).toBe(true);
    });

    it('should reject future dates and invalid dates', () => {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      expect(validateTransactionDate(tomorrow)).toBe(false);
      expect(validateTransactionDate('invalid-date')).toBe(false);
      expect(validateTransactionDate('')).toBe(false);
    });
  });

  describe('validateCreateTransactionRequest', () => {
    const validRequest: CreateTransactionRequest = {
      accountId: 'account-123',
      amount: 25.99,
      type: 'expense',
      category: 'Food',
      description: 'Lunch at cafe',
      date: new Date().toISOString().split('T')[0],
    };

    it('should validate complete valid request', () => {
      expect(validateCreateTransactionRequest(validRequest)).toBe(true);
    });

    it('should reject request with missing fields', () => {
      const { accountId, ...incomplete } = validRequest;
      expect(validateCreateTransactionRequest(incomplete)).toBe(false);
    });

    it('should reject request with invalid amount', () => {
      expect(validateCreateTransactionRequest({ ...validRequest, amount: -10 })).toBe(false);
      expect(validateCreateTransactionRequest({ ...validRequest, amount: 0 })).toBe(false);
    });

    it('should reject request with invalid type', () => {
      expect(validateCreateTransactionRequest({ ...validRequest, type: 'invalid' as any })).toBe(false);
    });

    it('should reject request with invalid category', () => {
      expect(validateCreateTransactionRequest({ ...validRequest, category: 'InvalidCategory' })).toBe(false);
    });

    it('should reject request with invalid description', () => {
      expect(validateCreateTransactionRequest({ ...validRequest, description: 'ab' })).toBe(false);
    });

    it('should reject request with future date', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      expect(validateCreateTransactionRequest({ ...validRequest, date: futureDate })).toBe(false);
    });
  });

  describe('validateUpdateTransactionRequest', () => {
    it('should validate partial updates', () => {
      expect(validateUpdateTransactionRequest({ amount: 50 })).toBe(true);
      expect(validateUpdateTransactionRequest({ description: 'Updated description' })).toBe(true);
      expect(validateUpdateTransactionRequest({ type: 'income', category: 'Salary' })).toBe(true);
    });

    it('should reject empty updates', () => {
      expect(validateUpdateTransactionRequest({})).toBe(false);
      expect(validateUpdateTransactionRequest(null)).toBe(false);
    });

    it('should reject updates with invalid values', () => {
      expect(validateUpdateTransactionRequest({ amount: -10 })).toBe(false);
      expect(validateUpdateTransactionRequest({ type: 'invalid' as any })).toBe(false);
      expect(validateUpdateTransactionRequest({ category: 'InvalidCategory' })).toBe(false);
    });
  });

  describe('Category Helper Functions', () => {
    describe('getCategoriesForType', () => {
      it('should return expense categories for expense type', () => {
        const categories = getCategoriesForType('expense');
        expect(categories).toEqual(EXPENSE_CATEGORIES);
      });

      it('should return income categories for income type', () => {
        const categories = getCategoriesForType('income');
        expect(categories).toEqual(INCOME_CATEGORIES);
      });
    });

    describe('isCategoryValidForType', () => {
      it('should validate expense categories for expense type', () => {
        expect(isCategoryValidForType('Food', 'expense')).toBe(true);
        expect(isCategoryValidForType('Transportation', 'expense')).toBe(true);
        expect(isCategoryValidForType('Salary', 'expense')).toBe(false);
      });

      it('should validate income categories for income type', () => {
        expect(isCategoryValidForType('Salary', 'income')).toBe(true);
        expect(isCategoryValidForType('Freelance', 'income')).toBe(true);
        expect(isCategoryValidForType('Food', 'income')).toBe(false);
      });
    });
  });

  describe('Constants', () => {
    it('should have correct transaction types', () => {
      expect(TRANSACTION_TYPES).toEqual(['income', 'expense']);
    });

    it('should have expense categories', () => {
      expect(EXPENSE_CATEGORIES).toContain('Food');
      expect(EXPENSE_CATEGORIES).toContain('Transportation');
      expect(EXPENSE_CATEGORIES).toContain('Bills');
    });

    it('should have income categories', () => {
      expect(INCOME_CATEGORIES).toContain('Salary');
      expect(INCOME_CATEGORIES).toContain('Freelance');
      expect(INCOME_CATEGORIES).toContain('Investment');
    });

    it('should combine all categories', () => {
      expect(TRANSACTION_CATEGORIES).toEqual([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]);
    });
  });
});
