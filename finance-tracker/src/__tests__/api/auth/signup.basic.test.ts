import { NextRequest } from 'next/server'

// Test basic request parsing without importing the route
describe('Signup API Basic Tests', () => {
  it('should create NextRequest properly', () => {
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: 'Test User',
        email: 'test@example.com', 
        password: 'password123' 
      })
    })
    
    expect(request.method).toBe('POST')
    expect(request.url).toBe('http://localhost:3000/api/auth/signup')
  })
  
  it('should parse JSON body correctly', async () => {
    const testData = { 
      name: 'Test User',
      email: 'test@example.com', 
      password: 'password123' 
    }
    
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    })
    
    const body = await request.json()
    expect(body).toEqual(testData)
  })
})
