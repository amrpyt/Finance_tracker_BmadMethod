# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Story 2.2: Edit and Delete Financial Accounts (In Development)

## [0.2.0] - 2025-09-23

### Added
- Complete GitOps setup with CI/CD pipeline
- GitHub Actions workflow for automated testing and deployment
- Comprehensive PR and issue templates
- Security policy and contributing guidelines
- Professional README with feature overview
- Vercel deployment configuration with security headers
- Enhanced .gitignore for Next.js and Supabase projects

### Changed
- Improved repository structure and documentation
- Enhanced security practices and vulnerability reporting
- Updated development workflow documentation

## [0.1.1] - 2025-09-23

### Added
- Story 2.1: Complete accounts CRUD functionality
- React UI components for account management
- Comprehensive test coverage (unit + component + functional)
- QA gates and quality assessment framework
- Architecture documentation (coding standards, tech stack, source tree)

### Fixed
- Story numbering conflicts (BetterAuth stories moved to Epic 1: 1.6-1.8)
- TypeScript compilation issues with auth imports
- Component import path corrections

### Changed
- Enhanced account management system with real-time updates
- Improved form validation and error handling
- Better currency formatting for EGP

## [0.1.0] - 2025-09-20

### Added
- Epic 1: Foundation & User Onboarding (Complete)
  - Story 1.1: Project setup with Next.js 15.5.3
  - Story 1.2: Database schema creation
  - Story 1.3: User signup functionality
  - Story 1.4: User login and session management
  - Story 1.5: Basic billing and subscription setup
  - Story 1.6: BetterAuth infrastructure setup
  - Story 1.7: Backend authentication replacement
  - Story 1.8: Frontend authentication integration

### Technical Stack
- Next.js 15.5.3 with App Router
- React 19.1.0 with TypeScript 5.x
- Supabase (PostgreSQL) database
- BetterAuth 1.3.13 authentication
- Tailwind CSS 4.x styling
- Jest + React Testing Library for testing

### Security
- BetterAuth with scrypt password hashing
- Dual authentication system (BetterAuth + Legacy JWT)
- HTTP-only cookies for session management
- Row Level Security (RLS) implementation

---

## Release Notes Format

### Added
- New features and capabilities

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Features removed in this release

### Fixed
- Bug fixes

### Security
- Vulnerability fixes and security improvements

---

## Development Phases

### Phase 1: Foundation ✅ (Stories 1.1-1.8)
Complete infrastructure, authentication, and project setup

### Phase 2: Core Financial Management 🏗️ (Stories 2.1-2.4)
Manual finance tracking with accounts and transactions

### Phase 3: AI-Powered Features ⏳ (Stories 3.1-3.4)
Voice input, receipt scanning, and smart categorization

### Phase 4: Analytics & Insights ⏳ (Stories 4.1-4.4)
Dashboard, reporting, and financial trend analysis
