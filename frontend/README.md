# BitStores Frontend

This is the frontend application for BitStores - an AI-powered electronics marketplace for the UAE market.

## 🚀 Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn/UI** for components
- **React Router** for navigation
- **React Query** for data fetching
- **Framer Motion** for animations

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn/UI components
│   │   ├── admin/          # Admin dashboard components
│   │   ├── auction/        # Auction-related components
│   │   ├── bitbot/         # AI assistant components
│   │   ├── checkout/       # Checkout flow components
│   │   ├── product/        # Product display components
│   │   ├── search/         # Search and filter components
│   │   └── storefront/     # Homepage sections
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin dashboard pages
│   │   └── vendor/         # Vendor dashboard pages
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── assets/             # Static assets
│   └── data/               # Mock data and constants
├── public/                 # Public assets
└── dist/                   # Build output
```

## 🎯 Key Features

### 🛍️ E-commerce Features
- **Product Catalog** with advanced filtering
- **Shopping Cart** with persistent state
- **Checkout Process** with multiple payment options
- **Order Management** with tracking
- **User Authentication** with protected routes

### 🤖 AI-Powered Features
- **BitBot Assistant** for product recommendations
- **Smart Search** with AI suggestions
- **Product Comparison** with AI insights
- **Personalized Recommendations**

### 👨‍💼 Multi-User System
- **Customer Portal** for shopping and orders
- **Vendor Dashboard** for sellers
- **Admin Panel** for marketplace management

### 🎨 UI/UX Features
- **Amazon-style Design** with professional aesthetics
- **Dark/Light Theme** support
- **Responsive Design** for all devices
- **Custom Animations** with Framer Motion
- **Location Selector** with UAE focus

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## 🎨 Styling

The project uses **Tailwind CSS** with a custom design system:

### Color Palette
- **Primary**: Blue (#3B82F6) - Main brand color
- **Secondary**: Gray variants for backgrounds
- **Accent**: Red (#EF4444) for highlights
- **Success**: Green (#10B981) for positive actions
- **Warning**: Yellow (#F59E0B) for alerts

### Components
- **Shadcn/UI** for base components
- **Custom components** for business logic
- **Responsive design** with mobile-first approach

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=BitStores
```

### Tailwind Configuration
Custom configuration in `tailwind.config.ts` includes:
- Custom color palette
- Typography settings
- Animation utilities
- Component variants

## 📱 Features Overview

### 🏠 Homepage
- Hero section with AI assistant
- Category showcase with animations
- Brand carousel
- Featured products
- Trust indicators

### 🔍 Search & Discovery
- Advanced search with filters
- Category browsing
- Brand-specific pages
- AI-powered recommendations

### 🛒 Shopping Experience
- Product detail pages
- Add to cart functionality
- Wishlist management
- Comparison tools

### 👤 User Management
- Authentication system
- User profiles
- Order history
- Returns & exchanges

### 📊 Admin Dashboard
- Vendor management
- Product catalog management
- Order processing
- Analytics and reporting

### 🏪 Vendor Portal
- Product management
- Order fulfillment
- Analytics dashboard
- Payout management

## 🚀 Deployment

The frontend can be deployed to any static hosting service:

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service

### Recommended Hosting
- **Vercel** (recommended for React apps)
- **Netlify** 
- **AWS S3 + CloudFront**
- **Azure Static Web Apps**

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow Tailwind CSS conventions
4. Write meaningful component names
5. Add proper error handling

## 📄 License

This project is proprietary software for BitStores marketplace.