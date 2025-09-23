# Coding Standards

## TypeScript Standards
- Use strict TypeScript configuration
- All files must have proper type annotations
- No `any` types unless absolutely necessary
- Use interfaces for object shapes
- Use type unions for discriminated unions
- Export types from dedicated `types/` directory

## React Standards
- Use functional components with hooks
- Follow React 19.1.0 patterns
- Use proper dependency arrays in useEffect
- Implement error boundaries for critical components
- Use React.memo for performance optimization when needed

## Next.js App Router Standards
- Use App Router (not Pages Router)
- Server components by default, client components when needed
- Proper metadata configuration
- Use loading.tsx and error.tsx files
- Follow Next.js 15.5.3 conventions

## File Naming Conventions
- Components: PascalCase (e.g., `AuthProvider.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`)
- Utilities: camelCase (e.g., `authClient.ts`)
- Types: PascalCase with descriptive names
- Test files: `*.test.tsx` or `*.test.ts`

## Code Organization
- Group related functionality in directories
- Use barrel exports (index.ts) for clean imports
- Separate concerns (UI, logic, data)
- Keep components small and focused
- Extract custom hooks for reusable logic

## Error Handling
- Use try-catch blocks for async operations
- Implement proper error boundaries
- Provide meaningful error messages
- Log errors appropriately
- Handle loading and error states in UI

## Testing Standards
- Use Jest and React Testing Library
- Test user interactions, not implementation details
- Mock external dependencies
- Achieve meaningful test coverage
- Write integration tests for critical flows

## Security Standards
- Never expose sensitive data in client code
- Use environment variables for secrets
- Implement proper authentication checks
- Validate all user inputs
- Use HTTPS in production
- Follow OWASP security guidelines

## Performance Standards
- Use React.memo and useMemo judiciously
- Implement proper loading states
- Optimize bundle size
- Use Next.js Image component for images
- Implement proper caching strategies
