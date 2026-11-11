# Bowles Docs

A lightweight collaborative document editor built with Next.js 15, Tiptap, and
Supabase.

## Features

- Create, rename, edit, save, and reopen rich-text documents.
- Format text with bold, italic, underline, headings, and ordered or bulleted
  lists.
- Import `.txt`, `.md`, or `.markdown` files up to 1 MB. Markdown headings and
  lists are converted to editor formatting; other text is imported as
  paragraphs.
- Share documents with an existing user by email. Recipients can view the
  document; only the owner can edit it.
- Supabase Auth and row-level security protect documents and sharing records.

## Local setup

1. Install Node.js 20+ and the Supabase CLI.
2. Copy `.env.example` to `.env.local` and set your Supabase project URL and
   publishable key. Never use a service-role key in the browser or commit
   `.env.local`.
3. Initialize the Supabase CLI configuration, link your project, and apply the
   database migrations:

   ```bash
   npx supabase init
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```

4. Enable Email authentication in the Supabase dashboard. Users must sign up
   before an owner can share a document with them.
5. Install dependencies, run the tests, then start the app:

   ```bash
   npm install
   npm test
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` starts the development server.
- `npm run build` creates a production build.
- `npm run start` serves the production build.
- `npm test` runs the document import and content validation tests.

## Architecture and priorities

- **Next.js App Router** renders protected document routes and handles writes
  with server actions, keeping Supabase credentials and authorization checks on
  the server.
- **Tiptap JSON** is stored in the `documents.content` column so formatting
  survives saves and reloads. Imported Markdown headings and lists are mapped
  to the corresponding editor blocks.
- **Supabase Auth + Postgres RLS** provide persistence and enforce that owners
  control writes. A narrowly scoped `SECURITY DEFINER` function validates
  ownership before resolving a recipient email and creating a share record.
- The scope favors reliable single-user editing and explicit read-only sharing
  over real-time co-editing, comments, and a complex permission system.

## Deployment

The app is ready for Vercel deployment:

1. Import this repository into Vercel and select the Next.js framework preset.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in
   the Vercel project environment settings for Production and Preview.
3. Apply all Supabase migrations to the production project with
   `npx supabase db push`.
4. Deploy, then configure the Supabase Auth site URL and redirect URLs to use
   the deployed domain.

A hosted URL still needs to be created from an account with access to the
hosting project; no deployment credentials are stored in this repository.

## AI-native workflow

- **Tool used:** Copilot SDK in VS Code.
- AI assistance accelerated the initial App Router setup, document/editor
  integration, Supabase actions, and test scaffolding.
- Generated approaches were adjusted to keep authorization in server actions
  and RLS, restrict sharing to document owners, constrain imports to UTF-8 text
  formats and a size limit, and avoid using service-role credentials.
- Verification includes automated tests for Markdown import and editor-content
  validation, plus a production Next.js build. Live Supabase flows need to be
  exercised against a configured project after migrations are applied.
