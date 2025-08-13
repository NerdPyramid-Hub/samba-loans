# Samba Loans - Loan Application System

## Overview

Samba Loans is a full-stack web application for managing loan applications, approvals, repayments, and analytics. Built with Next.js, TypeScript, Tailwind CSS, and Supabase, it provides a modern, responsive interface for both users and administrators.

## Features

- User registration and authentication
- Loan application submission and tracking
- Admin dashboard for managing applications
- Analytics for loan performance
- Repayment status tracking
- Role-based access control
- Responsive UI with reusable components

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes, Supabase
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth
- **UI Components:** Custom and Shadcn UI components

## Project Structure

```
components/         # Reusable UI and feature components
hooks/              # Custom React hooks
lib/                # Utility and API logic
app/                # Next.js app directory (pages, layouts, API routes)
public/             # Static assets
scripts/            # SQL setup and seed scripts
styles/             # Global styles
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- pnpm (or npm/yarn)
- Supabase project (for backend)

### Installation

```powershell
pnpm install
```

### Environment Setup

1. Copy `.env.example` to `.env.local` and fill in your Supabase credentials.
2. Run SQL scripts in `scripts/` to set up your database.

### Running the App

```powershell
pnpm run dev
```

The app will be available at `http://localhost:3000`.

## Scripts

- `scripts/01-create-tables.sql` - Create database tables
- `scripts/02-seed-data.sql` - Seed initial data
- `scripts/03-setup-storage.sql` - Set up storage buckets

## Customization

- UI components can be found in `components/ui/`
- Admin and user dashboards in `components/admin/` and `components/user/`
- API logic in `app/api/`

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature-name`)
3. Commit your changes
4. Push to your branch and open a pull request

## License

MIT

## Contact

For questions or support, please contact the project owner or open an issue.
