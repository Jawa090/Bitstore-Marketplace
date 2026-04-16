# BitStores - AI-Powered Electronics Marketplace

BitStores is a comprehensive e-commerce platform designed specifically for the UAE electronics market, featuring AI-powered recommendations, multi-vendor support, and a professional Amazon-style interface.

## 🏗️ Project Structure

```
BitStores/
├── frontend/           # React + TypeScript frontend application
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   └── dist/          # Build output
├── backend/           # Node.js backend API (planned)
│   └── README.md      # Backend documentation
├── docs/              # Project documentation
└── README.md          # This file
```

## 🚀 Quick Start

### Frontend Development

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

4. Open http://localhost:5173 in your browser

### Backend Development

*Backend development is planned for future implementation. See `backend/README.md` for details.*

## 🎯 Key Features

### 🛍️ E-commerce Platform
- **Product Catalog** with advanced filtering and search
- **Shopping Cart** with persistent state management
- **Checkout Process** with multiple payment options
- **Order Management** with tracking and returns
- **User Authentication** with protected routes

### 🤖 AI-Powered Features
- **BitBot Assistant** for personalized product recommendations
- **Smart Search** with AI-enhanced suggestions
- **Product Comparison** with intelligent insights
- **Dynamic Pricing** recommendations

### 👥 Multi-User System
- **Customer Portal** - Shopping, orders, wishlist management
- **Vendor Dashboard** - Product management, order fulfillment, analytics
- **Admin Panel** - Marketplace management, user control, reporting

### 🎨 Professional UI/UX
- **Amazon-style Design** with clean, professional aesthetics
- **Dark/Light Theme** support with system preference detection
- **Responsive Design** optimized for desktop, tablet, and mobile
- **Custom Animations** using Framer Motion
- **UAE-focused Features** including location selector and local delivery

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for utility-first styling
- **Shadcn/UI** for consistent component library
- **React Router** for client-side routing
- **React Query** for server state management
- **Framer Motion** for smooth animations
- **Lucide React** for consistent iconography

### Backend (Planned)
- **Node.js** with Express.js or Fastify
- **TypeScript** for full-stack type safety
- **PostgreSQL** or **MongoDB** for data persistence
- **Redis** for caching and session management
- **JWT** for secure authentication
- **Stripe** for payment processing
- **AWS S3** for file storage
- **Docker** for containerization

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop** (1920px+) - Full feature set with sidebar navigation
- **Laptop** (1024px-1919px) - Optimized layout with collapsible elements
- **Tablet** (768px-1023px) - Touch-friendly interface with adapted navigation
- **Mobile** (320px-767px) - Mobile-first design with bottom navigation

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) - Brand color for CTAs and highlights
- **Secondary**: Gray variants for backgrounds and text
- **Accent**: Red (#EF4444) for alerts and special offers
- **Success**: Green (#10B981) for positive actions
- **Warning**: Yellow (#F59E0B) for cautions

### Typography
- **Display Font**: Space Grotesk for headings
- **Body Font**: Inter for readable body text
- **Monospace**: JetBrains Mono for code elements

## 🔧 Development

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Git for version control

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd BitStores
```

2. Set up frontend:
```bash
cd frontend
npm install
cp .env.example .env.local
```

3. Configure environment variables in `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=BitStores
```

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## 🚀 Deployment

### Frontend Deployment

The frontend can be deployed to any static hosting service:

1. Build the project:
```bash
cd frontend
npm run build
```

2. Deploy the `frontend/dist` folder to your hosting service

#### Recommended Hosting Platforms
- **Vercel** (recommended for React applications)
- **Netlify** with automatic deployments
- **AWS S3 + CloudFront** for scalable hosting
- **Azure Static Web Apps**

### Backend Deployment (Future)

Backend deployment instructions will be added once the API is implemented.

## 📊 Project Status

### ✅ Completed Features
- [x] Complete frontend application structure
- [x] Responsive design system
- [x] User authentication flow
- [x] Product catalog and search
- [x] Shopping cart functionality
- [x] Order management system
- [x] Vendor dashboard
- [x] Admin panel
- [x] AI assistant integration (UI)
- [x] Location selector for UAE
- [x] Dark/light theme support

### 🚧 In Progress
- [ ] Backend API development
- [ ] Database schema design
- [ ] Payment integration
- [ ] Real AI integration
- [ ] Testing suite completion

### 📋 Planned Features
- [ ] Mobile applications (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (Arabic/English)
- [ ] Real-time notifications
- [ ] Advanced search with Elasticsearch
- [ ] Microservices architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful component names
- Add proper error handling
- Include tests for new features
- Follow the existing code structure

## 📄 License

This project is proprietary software for BitStores marketplace.

## 📞 Support

For support and questions, please contact the development team.

---

**Built with ❤️ for the UAE electronics market**