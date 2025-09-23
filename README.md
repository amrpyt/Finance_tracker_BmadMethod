# 💰 Finance Tracker - AI-Powered Personal Finance Management

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase)
![BetterAuth](https://img.shields.io/badge/BetterAuth-1.3.13-orange?style=for-the-badge)

[![CI/CD](https://github.com/amrpyt/Finance_tracker_BmadMethod/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/amrpyt/Finance_tracker_BmadMethod/actions)
[![Coverage](https://codecov.io/gh/amrpyt/Finance_tracker_BmadMethod/branch/master/graph/badge.svg)](https://codecov.io/gh/amrpyt/Finance_tracker_BmadMethod)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

*A modern, AI-powered personal finance management application built with Next.js, featuring voice input, receipt scanning, and intelligent transaction categorization.*

[🚀 Live Demo](https://finance-tracker-bmad.vercel.app) • [📖 Documentation](docs/) • [🐛 Report Bug](https://github.com/amrpyt/Finance_tracker_BmadMethod/issues) • [💡 Request Feature](https://github.com/amrpyt/Finance_tracker_BmadMethod/issues)

</div>

---

## ✨ Features

### 🏦 **Core Financial Management**
- ✅ **Account Management** - Create, view, edit, and delete financial accounts
- ✅ **Transaction Tracking** - Manual transaction entry with categorization
- ⏳ **Balance Calculation** - Real-time balance updates across accounts
- ⏳ **Multi-Currency Support** - EGP primary with international currencies

### 🤖 **AI-Powered Input Methods**
- ⏳ **Voice Transactions** - "I spent 50 EGP on lunch at McDonald's"
- ⏳ **Receipt Scanning** - OCR processing of receipt images
- ⏳ **Smart Categorization** - AI-powered expense categorization
- ⏳ **Natural Language Processing** - Plain text to structured transaction data

### 📊 **Dashboard & Analytics**
- ⏳ **Account Overview** - Real-time balance summaries
- ⏳ **Transaction Feed** - Recent transaction activity
- ⏳ **Category Breakdown** - Expense analysis by category
- ⏳ **Trend Analysis** - Income vs expense visualization

### 🔐 **Security & Authentication**
- ✅ **BetterAuth Integration** - Modern authentication with scrypt hashing
- ✅ **Dual Auth System** - Legacy JWT + BetterAuth migration support
- ✅ **Session Management** - Secure HTTP-only cookies
- ✅ **Row Level Security** - Supabase RLS for data isolation

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 15.5.3 with App Router
- **UI Library**: React 19.1.0 with Hooks
- **Styling**: Tailwind CSS 4.x
- **Language**: TypeScript 5.x (Strict Mode)
- **State Management**: React Context + Hooks

### **Backend**
- **Database**: Supabase (PostgreSQL)
- **Authentication**: BetterAuth 1.3.13
- **API**: Next.js API Routes
- **Validation**: TypeScript + Custom Validators

### **DevOps & Quality**
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint 9.x
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel
- **Security**: npm audit + Snyk scanning

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20+ 
- **npm** or **yarn**
- **Supabase** account

### Installation

```bash
# Clone the repository
git clone https://github.com/amrpyt/Finance_tracker_BmadMethod.git
cd Finance_tracker_BmadMethod

# Install dependencies
cd finance-tracker
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run the development server
npm run dev
```

### Environment Variables

Create a `.env.local` file in the `finance-tracker` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# BetterAuth Configuration
BETTER_AUTH_SECRET=your_better_auth_secret
DATABASE_URL=your_postgresql_connection_string

# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

1. Create a new Supabase project
2. Run the database migrations:
   ```bash
   cd finance-tracker/scripts
   node run-migrations.js
   ```
3. Enable Row Level Security (RLS) on all tables

---

## 📚 Project Structure

```
Finance_tracker_BmadMethod/
├── 📁 .github/              # GitHub workflows and templates
├── 📁 .bmad-core/           # BMAD methodology resources
├── 📁 docs/                 # Project documentation
│   ├── 📁 architecture/     # Technical architecture docs
│   ├── 📁 epics/           # Feature epics
│   ├── 📁 prd/             # Product requirements
│   ├── 📁 qa/              # Quality assurance
│   └── 📁 stories/         # User stories
├── 📁 finance-tracker/      # Next.js application
│   ├── 📁 src/
│   │   ├── 📁 app/         # Next.js App Router pages
│   │   ├── 📁 components/  # React components
│   │   ├── 📁 lib/         # Utilities and services
│   │   ├── 📁 types/       # TypeScript definitions
│   │   └── 📁 __tests__/   # Test files
│   ├── 📄 package.json
│   └── 📄 next.config.js
├── 📄 README.md
├── 📄 CONTRIBUTING.md
└── 📄 LICENSE
```

---

## 🧪 Development Workflow

### Story-Driven Development
We follow the **BMAD methodology** with story-driven development:

1. **📋 Epic Planning** → Features defined in `/docs/prd/`
2. **📝 Story Creation** → Detailed stories in `/docs/stories/`
3. **⚙️ Implementation** → Development follows acceptance criteria
4. **🔍 QA Review** → Quality gates in `/docs/qa/gates/`

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Code Quality
```bash
# Lint code
npm run lint

# Type checking
npx tsc --noEmit

# Build application
npm run build
```

---

## 🎯 Roadmap

### 📅 **Current Phase: Epic 2 - Core Financial Management**
- ✅ **Story 2.1**: Create and View Financial Accounts
- ⏳ **Story 2.2**: Edit and Delete Financial Accounts
- ⏳ **Story 2.3**: Manual Transaction Entry
- ⏳ **Story 2.4**: Transaction Management

### 📅 **Next Phase: Epic 3 - AI-Powered Features**
- ⏳ **Story 3.1**: Voice Transaction Input
- ⏳ **Story 3.2**: Receipt Image Processing
- ⏳ **Story 3.3**: Smart Categorization
- ⏳ **Story 3.4**: Natural Language Processing

### 📅 **Future Phase: Epic 4 - Analytics & Insights**
- ⏳ **Story 4.1**: Dashboard Overview
- ⏳ **Story 4.2**: Transaction Analytics
- ⏳ **Story 4.3**: Category Insights
- ⏳ **Story 4.4**: Financial Trends

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on:

- 📋 Development workflow
- 🧪 Testing requirements
- 📝 Code standards
- 🔍 PR process

### Quick Contributing Steps
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/story-X.X-description`)
3. Follow the story acceptance criteria
4. Add comprehensive tests
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **BMAD Methodology** - Story-driven development approach
- **BetterAuth** - Modern authentication solution
- **Supabase** - Backend-as-a-Service platform
- **Vercel** - Deployment and hosting platform
- **Next.js Team** - Amazing React framework

---

## 📞 Support

- 📖 **Documentation**: [docs/](docs/)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/amrpyt/Finance_tracker_BmadMethod/issues)
- 💡 **Feature Requests**: [GitHub Issues](https://github.com/amrpyt/Finance_tracker_BmadMethod/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/amrpyt/Finance_tracker_BmadMethod/discussions)

---

<div align="center">

**[⭐ Star this repository](https://github.com/amrpyt/Finance_tracker_BmadMethod)** if you find it helpful!

Made with ❤️ by the Finance Tracker Team

</div>
