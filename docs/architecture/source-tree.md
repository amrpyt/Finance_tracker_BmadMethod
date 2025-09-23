# Source Tree Structure

## Project Root
```
Finance_tracker_BmadMethod/
├── .bmad-core/           # BMAD framework configuration
├── .windsurf/           # Windsurf IDE workflows
├── docs/                # Project documentation
├── finance-tracker/     # Main application directory
├── node_modules/        # Dependencies (auto-generated)
├── package.json         # Root package configuration
└── package-lock.json    # Dependency lock file
```

## Main Application Structure (`finance-tracker/`)
```
finance-tracker/
├── public/              # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   └── window.svg
├── scripts/             # Database and deployment scripts
│   ├── migrations/      # Database migration scripts
│   ├── DEPLOYMENT-INSTRUCTIONS.md
│   ├── create-betterauth-schema.sql
│   └── [other scripts]
├── src/                 # Source code
│   ├── __tests__/       # Test files
│   ├── app/             # Next.js App Router pages
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React context providers
│   ├── lib/             # Utility libraries and configurations
│   └── types/           # TypeScript type definitions
├── .gitignore
├── .swc/                # SWC compiler configuration
├── eslint.config.mjs    # ESLint configuration
├── jest.config.js       # Jest testing configuration
├── next.config.mjs      # Next.js configuration
├── package.json         # Application dependencies
├── postcss.config.mjs   # PostCSS configuration
├── README.md
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Source Directory Structure (`src/`)
```
src/
├── __tests__/           # Test files organized by feature
│   ├── components/      # Component tests
│   │   └── auth/        # Authentication component tests
│   ├── lib/             # Library/utility tests
│   └── integration/     # Integration tests
├── app/                 # Next.js App Router structure
│   ├── (auth)/          # Authentication route group
│   │   ├── login/       # Login page
│   │   └── signup/      # Signup page
│   ├── dashboard/       # Dashboard page
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout component
│   └── page.tsx         # Home page
├── components/          # Reusable UI components
│   ├── auth/            # Authentication-related components
│   ├── ui/              # Generic UI components
│   └── layout/          # Layout components
├── contexts/            # React context providers
│   └── auth-context.tsx # Authentication context
├── lib/                 # Utility libraries and configurations
│   ├── auth-client.ts   # BetterAuth client configuration
│   ├── supabase.ts      # Supabase client configuration
│   ├── database.ts      # Database utilities
│   ├── auth.ts          # Authentication utilities
│   └── utils.ts         # General utilities
└── types/               # TypeScript type definitions
    ├── auth.ts          # Authentication types
    ├── database.ts      # Database types
    └── index.ts         # Barrel exports
```

## Documentation Structure (`docs/`)
```
docs/
├── architecture/        # Technical architecture documentation
│   ├── coding-standards.md
│   ├── tech-stack.md
│   ├── source-tree.md
│   ├── 1-system-overview.md
│   ├── 2-high-level-architecture.md
│   ├── 3-database-schema.md
│   ├── 4-api-design.md
│   └── 5-deployment-architecture.md
├── epics/               # Epic documentation
│   └── epic-1-betterauth-migration.md
├── prd/                 # Product Requirements Documents
│   ├── 1-goals-background-context.md
│   ├── 2-requirements.md
│   ├── 3-user-interface-design-goals.md
│   ├── 4-technical-requirements.md
│   ├── 5-success-metrics.md
│   └── 6-timeline-milestones.md
├── qa/                  # Quality Assurance documentation
│   └── gates/           # QA gate results
├── stories/             # User story documentation
└── [other docs]
```

## Key File Purposes

### Application Entry Points
- `src/app/layout.tsx` - Root layout with providers
- `src/app/page.tsx` - Home page component
- `src/app/globals.css` - Global styles and Tailwind imports

### Authentication System
- `src/lib/auth-client.ts` - BetterAuth client configuration
- `src/contexts/auth-context.tsx` - Authentication state management
- `src/app/(auth)/` - Authentication pages (login, signup)

### Configuration Files
- `next.config.mjs` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript compiler options
- `jest.config.js` - Testing configuration
- `eslint.config.mjs` - Code linting rules

### Database & Scripts
- `scripts/migrations/` - Database migration scripts
- `scripts/create-betterauth-schema.sql` - BetterAuth schema setup
- `src/lib/supabase.ts` - Supabase client configuration
