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
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Customer Site URL (for QR codes)
NEXT_PUBLIC_CUSTOMER_SITE_URL=http://localhost:3002

# Application Name
NEXT_PUBLIC_APP_NAME=Qrenso
```

**Required Variables:**

- `NEXT_PUBLIC_API_URL` - Backend API endpoint
- `NEXT_PUBLIC_CUSTOMER_SITE_URL` - Base URL for customer-facing site

**Optional Variables:**

- `NEXT_PUBLIC_APP_NAME` - Application display name (default: "Qrenso")

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

## User Flow

### 1. QR Code Scanning

1. Customer scans QR code at their table
2. Redirected to tenant-specific landing page (`/[tenantSlug]`)
3. JWT token decoded to verify table and session
4. Table information displayed (number, capacity, zone)

### 2. Session Creation

1. Enter number of guests (optional based on restaurant settings)
2. Click "Start Session" button
3. Session created via API with guest count
4. Redirected to menu page (`/[tenantSlug]/menu`)

### 3. Menu Browsing

1. View categories horizontally scrollable at top
2. Browse menu items in infinite scroll feed
3. Filter by category selection
4. Search menu items by name
5. View featured "Chef Recommendations" carousel

### 4. Item Selection

1. Click on menu item card
2. Modal/sheet opens with item details
3. Select quantity with +/- buttons
4. Choose modifiers (size, extras, etc.)
5. Add special instructions (if allowed)
6. Click "Add to Cart" to confirm

### 5. Cart Management

1. View cart icon with badge showing item count
2. Navigate to cart page (`/[tenantSlug]/cart`)
3. Review all items, quantities, and prices
4. Remove items or adjust quantities
5. See order summary (subtotal, tax, total)
6. Proceed to checkout

### 6. Order Placement

1. Review order details
2. Confirm special instructions
3. Submit order to kitchen
4. Receive order confirmation
5. View order status updates

## API Integration

The app connects to the Qrenso Backend API for:

- **QR Validation** - `POST /auth/qr/validate` - Verify QR token and table
- **Menu Data** - `GET /menu/items` - Fetch menu items with categories and modifiers
- **Session Management** - `POST /table-sessions` - Create and manage table sessions
- **Cart Operations** - Submit orders, track status
- **Profile Management** - View order history, update preferences

Authentication is handled via JWT tokens encoded in QR codes. All API requests include:

- `Authorization: Bearer <token>` header
- `X-Tenant-Id: <tenantId>` header for multi-tenant isolation

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

## State Management

### Zustand Stores

- **Cart Store** (`lib/stores/cart-store.ts`)
  - Add/remove items from cart
  - Update quantities and modifiers
  - Calculate totals with tax
  - Persist cart across page refreshes

- **Session Store** (`lib/stores/session-store.ts`)
  - Manage table session state
  - Store guest count
  - Track session expiry

### React Query

Used for server state management:

- Menu items caching
- Real-time order status updates
- Automatic background refetching
- Optimistic UI updates

## Key Components

### Table Landing Page

- `TableHeroCard` - Display table info with gradient background
- `GuestCountStepper` - Number input for guest count
- `StartSessionButton` - Initiate table session

### Menu Browsing

- `MenuCategoryTabs` - Horizontal scrollable category filter
- `MenuItemCard` - Menu item display with image, price, description
- `MenuItemSheet` - Bottom sheet for item details and customization
- `ChefRecommendations` - Carousel of featured items

### Cart & Checkout

- `CartItemCard` - Item in cart with quantity controls
- `OrderSummary` - Subtotal, tax, and total calculation
- `CheckoutButton` - Submit order action

### UI Components (shadcn/ui)

- `Button`, `Card`, `Badge`
- `Sheet`, `Dialog`, `Drawer`
- `Input`, `Select`, `Checkbox`
- `Tabs`, `Separator`, `Skeleton`

## Mobile-First Design

- Responsive breakpoints: `sm:640px`, `md:768px`, `lg:1024px`
- Touch-optimized interactions
- Bottom sheets for mobile modals
- Sticky header and floating cart button
- Swipe gestures for navigation

## Performance Optimizations

- **Next.js 16 App Router** - Server-side rendering for fast initial load
- **Image Optimization** - Next.js `Image` component with lazy loading
- **Code Splitting** - Automatic route-based splitting
- **React 19** - Concurrent rendering and transitions
- **Infinite Scroll** - Load menu items progressively
- **Memoization** - React.memo for expensive components

## Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel

# Or connect GitHub repo for automatic deployments
```

### Docker

```bash
# Build Docker image
docker build -t customer-frontend .

# Run container
docker run -p 3000:3000 customer-frontend
```

### Self-Hosted

```bash
# Build production bundle
npm run build

# Start production server
npm start
```

**Environment Variables** must be set in your deployment platform.

## License

Private - All rights reserved.
