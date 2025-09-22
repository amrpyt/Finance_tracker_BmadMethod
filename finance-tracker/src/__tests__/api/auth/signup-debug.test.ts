// Debug version of signup test to isolate issues
describe('Signup Debug', () => {
  it('should import NextRequest', () => {
    const { NextRequest } = require('next/server')
    expect(NextRequest).toBeDefined()
  })
  
  it('should create basic request', () => {
    const { NextRequest } = require('next/server')
    const request = new NextRequest('http://localhost:3000/test', {
      method: 'POST',
      body: JSON.stringify({ test: 'data' })
    })
    expect(request.method).toBe('POST')
  })
})
