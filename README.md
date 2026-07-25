# CSSA - Computer Science Student Association Website

A modern web application built with Next.js for the Computer Science Student Association. Features include event management, blog posts, user authentication, and markdown rendering.

## Features

- **User Authentication**: Secure login and signup system with NextAuth.js
- **Event Calendar**: Browse upcoming and past events with detailed pages
- **Blog Posts**: Create and read posts with markdown support
- **Markdown Rendering**: Full markdown support for event details and blog posts
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Database ORM**: Type-safe database queries with Prisma

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: NextAuth.js v5
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS v4
- **Markdown**: react-markdown with GitHub Flavored Markdown

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or cloud-hosted)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

### Environment Configuration

Edit the `.env` file with your configuration:

#### Database Configuration

You have several options for the database:

**Option 1: Prisma Postgres (Easiest for Development)**
```bash
npx prisma dev
```
This command will start a local Prisma Postgres instance and automatically configure the `DATABASE_URL`.

**Option 2: Local PostgreSQL**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/cssa"
```
Replace `user`, `password`, and `cssa` with your PostgreSQL credentials and database name.

**Option 3: Cloud Database**

For Supabase:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

For Neon:
```env
DATABASE_URL="postgresql://[user]:[password]@[endpoint].neon.tech/[database]"
```

For Railway, Heroku, or other providers, use the connection string they provide.

#### NextAuth Configuration

```env
# Generate a random secret with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-here-replace-with-random-string"

# Use http://localhost:3000 for development, your production URL for production
NEXTAUTH_URL="http://localhost:3000"
```

**Important**: Always generate a new `NEXTAUTH_SECRET` for production using:
```bash
openssl rand -base64 32
```

#### GitHub OAuth Configuration

Authentication uses GitHub OAuth. You need to create a GitHub OAuth App for local development:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name**: `CSSA Dev` (or any name)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click **"Register application"**
5. Copy the **Client ID**
6. Click **"Generate a new client secret"** and copy it

Add these to your `.env` file:

```env
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

> **Note**: For production, create a separate GitHub OAuth App with the production callback URL (e.g., `https://your-domain.com/api/auth/callback/github`). GitHub OAuth apps only support one callback URL per app, so you need separate apps for development and production.

### Database Setup

Run the Prisma migration to create database tables:
```bash
npx prisma migrate dev --name init
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating an Account

1. Navigate to the signup page
2. Enter your name, email, and password
3. You'll be automatically signed in after registration

### Creating Events

1. Sign in to your account
2. Click "New Event" in the navigation
3. Fill in the event details (markdown supported for the content)
4. Choose whether to publish immediately
5. Submit the form

### Creating Posts

1. Sign in to your account
2. Click "New Post" in the navigation
3. Write your post using markdown syntax
4. Choose whether to publish immediately
5. Submit the form

## Project Structure

```
cssa/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── events/       # Event API
│   │   └── posts/        # Post API
│   ├── calendar/         # Calendar page
│   ├── events/           # Event pages
│   │   ├── [id]/         # Event detail page
│   │   └── new/          # Create event page
│   ├── login/            # Login page
│   ├── posts/            # Post pages
│   │   ├── [id]/         # Post detail page
│   │   └── new/          # Create post page
│   ├── signup/           # Signup page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   └── prisma.ts         # Prisma client singleton
├── prisma/
│   └── schema.prisma     # Database schema
└── types/                # TypeScript type definitions
```

## Database Schema

### User
- Authentication and profile information
- Relations to posts and events

### Post
- Blog posts with markdown content
- Published/draft status
- Author relationship

### Event
- Event details with start/end dates
- Location information
- Markdown content for detailed pages
- Published/draft status
- Author relationship

## Markdown Support

Both events and posts support GitHub Flavored Markdown, including:
- Headings
- Lists (ordered and unordered)
- Code blocks with syntax highlighting
- Links and images
- Tables
- Blockquotes
- And more!

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### K3s with ArgoCD (Recommended)

Refer to [The Helm Chart](./helm/README.md) for instructions on deploying with K3s and ArgoCD.

### Other Platforms

Make sure to:
1. Set all environment variables
2. Run database migrations: `npx prisma migrate deploy`
3. Build the application: `npm run build`
