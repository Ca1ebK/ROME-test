# ROME - Warehouse Management System

A mobile-first kiosk application for Scholastic warehouse operations. Built with Next.js 15, Tailwind CSS, Shadcn UI patterns, and Supabase.

## Features

- **6-Digit PIN Authentication** - Simple, fast worker identification
- **Clock In/Out** - Track worker attendance with timestamps
- **Production Logging** - Record task completion with quantity counters
- **High-Contrast UI** - Black/white/safety-orange theme for warehouse visibility
- **Offline-Resilient** - Clear retry buttons when network fails

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS with custom warehouse theme
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Notifications**: Sonner

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL schema in `supabase/schema.sql` via the SQL Editor
3. Copy `.env.local.example` to `.env.local` and add your credentials:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000/kiosk](http://localhost:3000/kiosk)

## Test PINs

After running the schema (which includes seed data):

| PIN    | Name          | Role       |
|--------|---------------|------------|
| 123456 | John Smith    | worker     |
| 234567 | Maria Garcia  | worker     |
| 345678 | James Wilson  | supervisor |
| 456789 | Sarah Johnson | worker     |
| 567890 | Michael Brown | worker     |

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Tailwind + custom warehouse styles
│   ├── layout.tsx       # Root layout with Toaster
│   ├── page.tsx         # Redirects to /kiosk
│   └── kiosk/
│       └── page.tsx     # Main kiosk interface
├── components/
│   ├── NumericKeypad.tsx   # PIN entry component
│   ├── ActionButtons.tsx   # Clock In/Out/Log buttons
│   ├── ProductionLog.tsx   # Task quantity logger
│   └── ErrorRetry.tsx      # Network error handler
├── lib/
│   ├── supabase.ts      # Supabase client & API functions
│   └── utils.ts         # Utility functions (cn, formatters)
└── types/
    └── database.ts      # TypeScript types for Supabase

supabase/
└── schema.sql           # Database schema with seed data
```

## Task List (Hardcoded)

- Box Packing
- Table Sorting
- Pallet Loading
- Shipping/Receiving

## Design Principles

1. **Touch-First** - Large buttons (min 4rem), generous tap targets
2. **High Visibility** - Safety orange on black background
3. **Fail Gracefully** - Every network error shows a clear "Retry" button
4. **Fast Flow** - PIN → Action → Done in under 10 seconds

## Database Schema

### workers
| Column    | Type        | Description              |
|-----------|-------------|--------------------------|
| id        | UUID        | Primary key              |
| pin       | CHAR(6)     | Unique 6-digit PIN       |
| full_name | VARCHAR(100)| Worker's display name    |
| role      | VARCHAR(50) | 'worker' or 'supervisor' |
| is_active | BOOLEAN     | Account status           |

### punches
| Column    | Type      | Description           |
|-----------|-----------|----------------------|
| id        | UUID      | Primary key          |
| worker_id | UUID      | Foreign key → workers|
| type      | ENUM      | 'IN' or 'OUT'        |
| timestamp | TIMESTAMPTZ| When punch occurred |

### production_logs
| Column    | Type      | Description           |
|-----------|-----------|----------------------|
| id        | UUID      | Primary key          |
| worker_id | UUID      | Foreign key → workers|
| task_name | VARCHAR   | Task completed       |
| quantity  | INTEGER   | Number completed     |
| timestamp | TIMESTAMPTZ| When logged         |

## Deployment

Build for production:

```bash
npm run build
npm start
```

Recommended: Deploy to Vercel with Supabase integration.

## License

Proprietary - Scholastic Corporation
