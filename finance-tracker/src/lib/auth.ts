import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export function generateJWT(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyJWT(token: string): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
  } catch {
    return null
  }
}

export function isValidEmail(email: string): boolean {
  // More comprehensive email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  
  // Basic format check
  if (!emailRegex.test(email)) return false
  
  // Additional checks for edge cases
  if (email.includes('..')) return false  // No consecutive dots
  if (email.startsWith('.') || email.endsWith('.')) return false  // No leading/trailing dots
  if (email.includes('@.') || email.includes('.@')) return false  // No dots adjacent to @
  if (email.includes('@@')) return false  // No consecutive @ symbols
  if (email.includes(' ')) return false  // No spaces
  
  return true
}
