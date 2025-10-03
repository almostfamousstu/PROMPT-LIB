# Prompt Library

Production-ready Next.js 14 prompt library with Supabase auth, AI optimization, tagging, and versioning.

## Features

- Supabase email/OAuth auth with secure RLS policies
- Prompt CRUD with tags, folders, duplication, versions, and restore
- Markdown editor with toolbar, command snippets, live preview, and OpenAI "Optimize" workflow
- Unified diff review and version history
- Search, fuzzy filter, sidebar navigation, and command palette
- Prompt playground with variable inputs and quick export/copy
- Tailwind + shadcn/ui components, dark mode, toasts, optimistic updates

## Getting Started

```bash
pnpm install
pnpm dev
```

### Environment

Copy `.env.example` to `.env.local` and update:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5
```

### Database

Run Supabase migrations:

```bash
supabase db push
```

### Testing & Linting

```bash
pnpm test
pnpm lint
```

## Tech Stack

- Next.js 14 App Router, Server Actions
- TypeScript, Tailwind CSS, shadcn/ui, lucide-react icons
- Supabase (Postgres + Auth)
- OpenAI API
- Vitest for unit tests

## Folder Structure

Key directories:

- `src/app` – App Router pages and layouts
- `src/components` – Reusable UI and prompt-specific components
- `src/actions` – Server actions for prompt CRUD
- `src/lib` – Supabase, AI client, utilities, schemas
- `supabase/migrations` – SQL schema and RLS policies
- `tests` – Vitest unit tests

## Deployment

1. Set environment variables in your hosting platform.
2. Provision Supabase database and run migrations.
3. Deploy with `pnpm build` and `pnpm start`.

