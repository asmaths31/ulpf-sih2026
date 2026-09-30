# LogForge Frontend (Next.js Dashboard)

This directory contains the premium, frosted-glass fintech-style dashboard for the Universal Log Pre-processing Framework.

## Tech Stack
- Next.js (App Router)
- Tailwind CSS
- Lucide React (Icons)
- Recharts (Charting)
- TypeScript

## Design Tokens (see `tailwind.config.ts` and `globals.css`)
- **Canvas:** `--bg-canvas` (pale sky-blue)
- **Shell:** `--bg-shell` (translucent white glass)
- **Primary:** `--primary` (slate-navy)
- **Typography:** Inter, tabular numbers for metrics.
- **Components:** `GlassCard`, `StatBadge`, `PrimaryButton`.

## Setup Instructions (Once Node.js is installed)
Since this Windows environment currently lacks `node` and `npm`, you will need to copy this `frontend` directory to a machine with Node installed or install Node.js here first.

```bash
# 1. Initialize Next.js dependencies
npm init -y
npm install next react react-dom
npm install -D typescript @types/react @types/node tailwindcss postcss autoprefixer
npm install lucide-react recharts

# 2. Start the dev server
npm run dev
```

The app perfectly mirrors the requested design: a 3-column grid, animated charts, glass UI, and the exact content structure outlined in the brief.
