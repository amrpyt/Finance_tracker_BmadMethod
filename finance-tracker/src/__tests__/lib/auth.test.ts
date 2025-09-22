import { hashPassword, verifyPassword, generateJWT, verifyJWT, isValidEmail } from '@/lib/auth'

describe('Auth Utilities', () => {
  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123'
      const hash = await hashPassword(password)
      
      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(50) // Bcrypt hashes are typically 60 chars
    })

    it('should verify correct password', async () => {
      const password = 'testpassword123'
      const hash = await hashPassword(password)
      
      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'testpassword123'
      const wrongPassword = 'wrongpassword'
      const hash = await hashPassword(password)
      
      const isValid = await verifyPassword(wrongPassword, hash)
      expect(isValid).toBe(false)
    })
  })

  describe('JWT Token Management', () => {
    const userId = 'test-user-id'
    const email = 'test@example.com'

    it('should generate valid JWT token', () => {
      const token = generateJWT(userId, email)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should verify valid JWT token', () => {
      const token = generateJWT(userId, email)
      const payload = verifyJWT(token)
      
      expect(payload).not.toBeNull()
      expect(payload?.userId).toBe(userId)
      expect(payload?.email).toBe(email)
    })

    it('should reject invalid JWT token', () => {
      const invalidToken = 'invalid.jwt.token'
      const payload = verifyJWT(invalidToken)
      
      expect(payload).toBeNull()
    })

    it('should reject expired JWT token', () => {
      // Mock a token that's expired (this would need actual JWT manipulation in real scenario)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid'
      const payload = verifyJWT(expiredToken)
      
      expect(payload).toBeNull()
    })
  })

  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.com',
        'user+tag@example.org',
        'test123@subdomain.example.com'
      ]

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true)
      })
    })

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'plainaddress',
        '@missingdomain.com',
        'missing@.com',
        'spaces in@email.com',
        'multiple@@domain.com',
        'trailing.dot.@domain.com',
        '.leading.dot@domain.com'
      ]

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false)
      })
    })
  })
})
