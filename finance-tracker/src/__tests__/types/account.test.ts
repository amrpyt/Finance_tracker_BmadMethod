import {
  validateAccountName,
  validateAccountType,
  validateCreateAccountRequest,
  ACCOUNT_TYPES,
} from '@/types/account';

describe('Account Type Validations', () => {
  describe('validateAccountName', () => {
    it('should accept valid names', () => {
      expect(validateAccountName('Bank Account')).toBe(true);
      expect(validateAccountName('Cash')).toBe(true);
      expect(validateAccountName('My Savings Account')).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(validateAccountName('')).toBe(false);
      expect(validateAccountName(' ')).toBe(false);
      expect(validateAccountName('A')).toBe(false); // Too short
      expect(validateAccountName('A'.repeat(51))).toBe(false); // Too long
    });

    it('should handle names with whitespace', () => {
      expect(validateAccountName('  Valid Name  ')).toBe(true);
      expect(validateAccountName('   ')).toBe(false);
    });
  });

  describe('validateAccountType', () => {
    it('should accept valid account types', () => {
      ACCOUNT_TYPES.forEach(type => {
        expect(validateAccountType(type)).toBe(true);
      });
    });

    it('should reject invalid account types', () => {
      expect(validateAccountType('invalid')).toBe(false);
      expect(validateAccountType('savings')).toBe(false);
      expect(validateAccountType('')).toBe(false);
      expect(validateAccountType('BANK')).toBe(false); // Case sensitive
    });
  });

  describe('validateCreateAccountRequest', () => {
    it('should accept valid requests', () => {
      const validRequest = {
        name: 'Test Bank',
        type: 'bank',
      };
      expect(validateCreateAccountRequest(validRequest)).toBe(true);
    });

    it('should reject requests with invalid name', () => {
      const invalidRequest = {
        name: 'A',
        type: 'bank',
      };
      expect(validateCreateAccountRequest(invalidRequest)).toBe(false);
    });

    it('should reject requests with invalid type', () => {
      const invalidRequest = {
        name: 'Test Bank',
        type: 'invalid',
      };
      expect(validateCreateAccountRequest(invalidRequest)).toBe(false);
    });

    it('should reject requests with missing fields', () => {
      expect(validateCreateAccountRequest({ name: 'Test Bank' })).toBe(false);
      expect(validateCreateAccountRequest({ type: 'bank' })).toBe(false);
      expect(validateCreateAccountRequest({})).toBe(false);
      expect(validateCreateAccountRequest(null)).toBe(false);
      expect(validateCreateAccountRequest(undefined)).toBe(false);
    });

    it('should reject requests with wrong data types', () => {
      expect(validateCreateAccountRequest({
        name: 123,
        type: 'bank',
      })).toBe(false);

      expect(validateCreateAccountRequest({
        name: 'Test Bank',
        type: 123,
      })).toBe(false);
    });
  });
});
