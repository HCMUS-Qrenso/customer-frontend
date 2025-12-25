# Qrenso Customer Frontend

A modern, mobile-first customer-facing application for restaurant QR code ordering system. Built with **Next.js 16**, **React 19**, and **Tailwind CSS 4**.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)

## Features

- 🍽️ **QR Code Table Session** - Scan QR to access your table
- 📱 **Mobile-First Design** - Optimized for smartphone experience
- 🌙 **Dark/Light Mode** - Theme toggle with system preference support
- 🌐 **Multi-language** - Vietnamese & English (i18n)
- 🛒 **Menu Browsing** - Categories, search, infinite scroll
- ⭐ **Chef Recommendations** - Featured items carousel
- 🛍️ **Cart Management** - Add items, view order summary

## Tech Stack

| Category         | Technology              |
| ---------------- | ----------------------- |
| Framework        | Next.js 16 (App Router) |
| Language         | TypeScript 5            |
| UI Library       | React 19                |
| Styling          | Tailwind CSS 4          |
| State Management | Zustand, React Query    |
| UI Components    | shadcn/ui, Radix UI     |
| Icons            | Lucide React            |
| Theming          | next-themes             |

## Project Structure

```
customer-frontend/
├── app/                    # Next.js App Router
│   ├── [tenantSlug]/       # Dynamic tenant routes
│   │   ├── page.tsx        # Table landing page
│   │   ├── menu/           # Menu browsing
│   │   └── cart/           # Shopping cart
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles & theme
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── menu/               # Menu-specific components
│   ├── TableHeroCard.tsx   # Table info display
│   ├── GuestCountStepper.tsx
│   ├── LanguageToggle.tsx
│   └── ThemeToggle.tsx
├── hooks/                  # Custom React hooks
├── lib/
│   ├── api/                # API client functions
│   ├── i18n/               # Internationalization
│   ├── stores/             # Zustand stores
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
└── providers/              # React context providers
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd customer-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Production build
npm run build

# Start production server
npm start
```

## API Integration

The app connects to the Qrenso Backend API for:

- **Menu Data** - Categories, items, modifiers
- **Session Management** - Table sessions, guest count
- **Cart Operations** - Add/remove items, checkout

Authentication is handled via JWT tokens encoded in QR codes.

## Theming

The app supports light and dark themes using `next-themes`:

- Light mode: Clean white backgrounds
- Dark mode: Slate-900 dark backgrounds
- System preference detection
- Persistent theme selection

CSS variables are defined in `globals.css` for consistent theming.

## Internationalization

Supported languages:

- 🇻🇳 Vietnamese (vi) - Default
- 🇺🇸 English (en)

Translations are managed in `lib/i18n/translations.ts`.

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Create production build  |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

## License

Private - All rights reserved.
