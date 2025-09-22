import '@testing-library/jest-dom'

// Mock window.matchMedia for jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
import React from 'react'

// Mock React to handle hooks properly
React.useState = jest.fn()
React.useEffect = jest.fn()

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}))

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Global test utilities
global.fetch = jest.fn()

// Setup React hooks for testing
beforeEach(() => {
  let stateIndex = 0
  const states = []
  
  React.useState.mockImplementation((initialValue) => {
    const currentIndex = stateIndex++
    if (states[currentIndex] === undefined) {
      states[currentIndex] = initialValue
    }
    const setter = (newValue) => {
      states[currentIndex] = typeof newValue === 'function' ? newValue(states[currentIndex]) : newValue
    }
    return [states[currentIndex], setter]
  })
  
  React.useEffect.mockImplementation((effect, deps) => {
    if (typeof effect === 'function') {
      effect()
    }
  })
})

afterEach(() => {
  React.useState.mockClear()
  React.useEffect.mockClear()
})

// Extend Jest matchers
expect.extend({
  toBeOneOf(received, expected) {
    const pass = expected.includes(received)
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${expected.join(', ')}`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be one of ${expected.join(', ')}`,
        pass: false,
      }
    }
  },
})
