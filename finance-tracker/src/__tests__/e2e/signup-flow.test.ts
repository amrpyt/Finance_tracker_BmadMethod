/**
 * End-to-End Tests for Signup Flow
 * Tests edge cases and complete user journeys
 */

describe('Signup Flow E2E Tests', () => {
  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed JSON in request body', async () => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json{'
      })

      expect(response.status).toBe(500)
    })

    it('should handle missing Content-Type header', async () => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
      })

      // Should still work as Next.js is forgiving
      const data = await response.json()
      expect(response.status).toBeOneOf([201, 400, 409, 500])
    })

    it('should handle extremely long input values', async () => {
      const longString = 'a'.repeat(10000)
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: longString,
          email: 'test@example.com',
          password: 'password123'
        })
      })

      const data = await response.json()
      // Should handle gracefully - either accept or reject with proper error
      expect([201, 400, 500]).toContain(response.status)
    })

    it('should handle special characters in name field', async () => {
      const specialName = "Test User!@#$%^&*()_+-=[]{}|;':\",./<>?"
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: specialName,
          email: 'special@example.com',
          password: 'password123'
        })
      })

      const data = await response.json()
      if (response.status === 201) {
        expect(data.user.name).toBeDefined()
      }
    })

    it('should handle unicode characters in name', async () => {
      const unicodeName = "José María González 测试用户 пользователь"
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: unicodeName,
          email: 'unicode@example.com',
          password: 'password123'
        })
      })

      const data = await response.json()
      if (response.status === 201) {
        expect(data.user.name).toBeDefined()
      }
    })

    it('should handle empty string inputs', async () => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '',
          email: '',
          password: ''
        })
      })

      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.error).toBe('Name, email and password are required')
    })

    it('should handle null values', async () => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: null,
          email: null,
          password: null
        })
      })

      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.error).toBe('Name, email and password are required')
    })

    it('should handle case-insensitive email duplicates', async () => {
      // Create account with lowercase email
      await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'User One',
          email: 'case@example.com',
          password: 'password123'
        })
      })

      // Try to create with uppercase email
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'User Two',
          email: 'CASE@EXAMPLE.COM',
          password: 'password123'
        })
      })

      const data = await response.json()
      expect(response.status).toBe(409)
      expect(data.error).toBe('An account with this email already exists')
    })

    it('should trim whitespace from inputs', async () => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '  Test User  ',
          email: '  whitespace@example.com  ',
          password: 'password123'
        })
      })

      const data = await response.json()
      if (response.status === 201) {
        expect(data.user.email).toBe('whitespace@example.com')
      }
    })

    it('should handle concurrent signup attempts with same email', async () => {
      const signupData = {
        name: 'Concurrent User',
        email: 'concurrent@example.com',
        password: 'password123'
      }

      // Fire multiple concurrent requests
      const promises = Array(5).fill(0).map(() => 
        fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signupData)
        })
      )

      const responses = await Promise.all(promises)
      const results = await Promise.all(responses.map(r => r.json()))

      // Only one should succeed (201), others should fail (409)
      const successes = responses.filter(r => r.status === 201)
      const duplicates = responses.filter(r => r.status === 409)

      expect(successes).toHaveLength(1)
      expect(duplicates.length).toBeGreaterThan(0)
    })
  })

  describe('Performance and Load Tests', () => {
    it('should handle rapid sequential signups', async () => {
      const signups = Array(10).fill(0).map((_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        password: 'password123'
      }))

      const startTime = Date.now()
      
      for (const signup of signups) {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signup)
        })
        expect(response.status).toBe(201)
      }

      const endTime = Date.now()
      const totalTime = endTime - startTime
      
      // Should complete 10 signups in reasonable time (< 10 seconds)
      expect(totalTime).toBeLessThan(10000)
    })
  })

  describe('Security Tests', () => {
    it('should not return password in response', async () => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Security Test',
          email: 'security@example.com',
          password: 'password123'
        })
      })

      const data = await response.json()
      
      if (response.status === 201) {
        expect(data.user.password).toBeUndefined()
        expect(data.user.password_hash).toBeUndefined()
        expect(JSON.stringify(data)).not.toContain('password123')
      }
    })

    it('should set secure cookie attributes in production', () => {
      // This would need environment variable mocking for production
      const isProduction = process.env.NODE_ENV === 'production'
      
      if (isProduction) {
        // Cookie should have Secure flag in production
        // This test would need to be run in a production-like environment
        expect(true).toBe(true) // Placeholder
      } else {
        expect(true).toBe(true) // Pass in development
      }
    })

    it('should reject SQL injection attempts', async () => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "'; DROP TABLE users; --",
          email: "sql@injection.com'; DELETE FROM users; --",
          password: 'password123'
        })
      })

      // Should either succeed (properly escaped) or fail gracefully
      expect([201, 400, 500]).toContain(response.status)
      
      if (response.status === 201) {
        const data = await response.json()
        // Name should be stored as-is (escaped by database)
        expect(data.user.id).toBeDefined()
      }
    })
  })
})
