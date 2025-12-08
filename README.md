# AI Content Studio - Frontend

## Project Description

AI Content Studio is a Next.js frontend application that enables users to create AI-generated content. Users can generate blog posts, articles, product descriptions, and social media captions with real-time updates via Server-Sent Events (SSE).

## Features

- User authentication (login/register)
- Create and manage content threads
- Generate AI content using prompts
- Real-time content updates via SSE
- Chat-like interface for content generation
- Support for multiple content types (blog posts, articles, product descriptions, social media captions)

## Prerequisites

- Node.js (version 20 or higher)
- Backend API running (see backend README)
- npm or yarn

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_ACS_ENDPOINT=http://localhost:3000
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) (or the port shown in terminal)

## Build for Production

```bash
npm run build
npm run start
```

## Project Structure

- `pages/` - Next.js pages (login, register, dashboard, content)
- `components/` - Reusable React components
- `Apis/` - API integration layer
- `hooks/` - Custom React hooks (SSE, etc.)
- `config/` - Application configuration
- `types/` - TypeScript type definitions
- `helpers/` - Utility functions

## Key Features

### Authentication
- User registration and login
- JWT token management
- Protected routes

### Content Generation
- Create new content threads or continue existing ones
- Select content type (blog post, article, product description, etc.)
- Generate content with AI prompts
- Real-time updates via SSE when content is being generated

### Real-time Updates
- Server-Sent Events (SSE) connection for live content updates
- Automatic UI updates when content generation completes
- Visual indicators for processing status

## Environment Variables

- `NEXT_PUBLIC_ACS_ENDPOINT` - Backend API base URL (without `/api/v1`)

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Sonner** - Toast notifications
- **Radix UI** - UI components
