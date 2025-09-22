# AI Personal Finance Tracker

An AI-powered personal finance tracking application built with Next.js, Prisma, and Supabase.

## Features

- AI-powered transaction input via text, voice, and receipt images
- Multi-account financial management
- Real-time dashboard with visualizations
- Automated categorization and insights

## Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes  
- **Database**: Supabase (PostgreSQL) with Prisma ORM
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **AI Services**: Internal STT, LLM, and OCR APIs

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase project

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials in `.env.local`

4. **Database setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

- `GET /api/health` - Health check endpoint
- Future endpoints for auth, transactions, accounts, and billing

## Project Structure

```
src/
├── app/                 # Next.js 13+ App Router
├── components/          # React components
├── lib/                # Utilities and configurations
├── types/              # TypeScript type definitions
└── generated/          # Generated Prisma client
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

This project follows the BMAD development methodology with structured story-driven development.
