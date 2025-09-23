# Contributing to Finance Tracker

Thank you for your interest in contributing! This document provides guidelines for contributing to the Finance Tracker project.

## 🏗️ **Development Workflow**

### Story-Driven Development
We follow the BMAD methodology with story-driven development:

1. **Epic Planning** → Stories are defined in `/docs/prd/4-epic-story-structure.md`
2. **Story Creation** → Detailed stories in `/docs/stories/X.X.story-name.story.md`
3. **Implementation** → Development follows story acceptance criteria
4. **QA Review** → Quality gates in `/docs/qa/gates/`

### Branch Strategy
- **`master`**: Production-ready code
- **Feature branches**: `feature/story-X.X-description`
- **Hotfix branches**: `hotfix/description`

## 🔧 **Setup Instructions**

### Prerequisites
- Node.js 20+
- npm
- Git

### Local Development
```bash
# Clone repository
git clone https://github.com/amrpyt/Finance_tracker_BmadMethod.git
cd Finance_tracker_BmadMethod

# Install dependencies
cd finance-tracker
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev

# Run tests
npm test
npm run test:coverage
```

## 📋 **Coding Standards**

### TypeScript
- Strict mode enabled
- No `any` types unless absolutely necessary
- Proper type annotations
- Export types from `/src/types/`

### React
- Functional components with hooks
- Follow React 19.1.0 patterns
- Proper dependency arrays in useEffect
- Error boundaries for critical components

### File Structure
```
finance-tracker/src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                # Utility functions and services
├── types/              # TypeScript type definitions
└── __tests__/          # Test files
```

### Naming Conventions
- Components: `PascalCase` (e.g., `AccountCard.tsx`)
- Hooks: `camelCase` with `use` prefix (e.g., `useAuth.ts`)
- Utilities: `camelCase` (e.g., `authClient.ts`)
- Test files: `*.test.tsx` or `*.test.ts`

## 🧪 **Testing Requirements**

### Test Coverage
- Minimum 80% code coverage
- Unit tests for all utilities and services
- Component tests using React Testing Library
- Integration tests for API endpoints

### Test Structure
```
__tests__/
├── components/         # Component tests
├── lib/               # Service/utility tests
├── types/             # Type validation tests
└── integration/       # API integration tests
```

## 📝 **Pull Request Process**

### Before Creating a PR
- [ ] Tests are passing (`npm test`)
- [ ] Code is linted (`npm run lint`)
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Story acceptance criteria are met
- [ ] Documentation is updated

### PR Requirements
- Use the provided PR template
- Link to the related story file
- Include test coverage for new features
- Add screenshots for UI changes
- Follow commit message conventions

### Commit Messages
```
type(scope): description

feat(accounts): implement account creation form
fix(auth): resolve login session timeout
test(accounts): add AccountCard component tests
docs(stories): update Story 2.1 documentation
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `style`, `chore`

## 🛡️ **Security Guidelines**

- Never commit sensitive data (API keys, passwords)
- Use environment variables for configuration
- Validate all user inputs
- Follow OWASP security guidelines
- Report security vulnerabilities privately

## 📚 **Documentation**

### Story Documentation
Each story should include:
- Clear acceptance criteria
- Technical implementation details
- Testing requirements
- QA review results

### Code Documentation
- JSDoc comments for complex functions
- README updates for new features
- Architecture documentation for major changes

## 🤝 **Code Review Guidelines**

### As a Reviewer
- Check story acceptance criteria are met
- Verify test coverage and quality
- Ensure code follows established patterns
- Test the functionality locally
- Provide constructive feedback

### As an Author
- Respond to feedback promptly
- Make requested changes
- Update tests and documentation
- Ensure CI passes before requesting re-review

## 🐛 **Bug Reports**

Use the bug report template and include:
- Clear reproduction steps
- Expected vs actual behavior
- Environment information
- Screenshots or console errors
- Related story context

## 💡 **Feature Requests**

Use the feature request template with:
- User story format
- Business value justification
- Technical considerations
- Acceptance criteria
- Epic/story context

## ❓ **Questions?**

- Check existing documentation first
- Search closed issues for similar questions
- Create a new issue with the question label
- Tag relevant team members

## 📊 **Project Structure**

### Key Directories
- `/docs/` - All project documentation
- `/finance-tracker/` - Next.js application
- `/.github/` - GitHub workflows and templates
- `/.bmad-core/` - BMAD methodology resources

Thank you for contributing! 🚀
