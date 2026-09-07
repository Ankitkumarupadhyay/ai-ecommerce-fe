# Frontend - Mini AI E-Commerce Application

React 19 Single Page Application (SPA) built with TypeScript, Vite, Tailwind CSS v4, Redux Toolkit, TanStack Query, React Markdown, and Lucide Icons. Deployed on **Netlify**.

---

## 📌 Deliverables & Live Links

| Deliverable | Location / URL |
| :--- | :--- |
| **Live Frontend App** | [https://ai-e-com.netlify.app](https://ai-e-com.netlify.app) |
| **Live Backend API** | [https://ai-ecommerce-be.vercel.app](https://ai-ecommerce-be.vercel.app) |
| **API Swagger Documentation** | [https://ai-ecommerce-be.vercel.app/docs](https://ai-ecommerce-be.vercel.app/docs) |
| **GitHub Repository** | [https://github.com/Ankit0090/AI-E-Commerce](https://github.com/Ankit0090/AI-E-Commerce) |
| **One-Page System Design** | [SYSTEM_DESIGN.md](file:///Users/ankit/Projects/Moksha%20Media/AI%20E-Commerce/frontend/SYSTEM_DESIGN.md) |
| **Database Schema** | [docs/database-schema.md](file:///Users/ankit/Projects/Moksha%20Media/AI%20E-Commerce/frontend/docs/database-schema.md) |
| **API Documentation** | [docs/api-documentation.md](file:///Users/ankit/Projects/Moksha%20Media/AI%20E-Commerce/frontend/docs/api-documentation.md) |
| **Total Time Taken** | `4.5 Hours` |
| **AI Tools Used** | `Gemini 3.6 Flash (Antigravity AI Coding Assistant)`, `OpenAI GPT-4o-mini`, `LangChain / LangGraph` |

---

## 🛠️ Technology Stack

* **Framework & Tooling**: React 19, TypeScript, Vite, Tailwind CSS v4.
* **Global State Management**: **Redux Toolkit** (`@reduxjs/toolkit` & `react-redux`) for authentication (`authSlice`) with automatic `localStorage` persistence.
* **Data Fetching & Cache**: **TanStack Query (React Query)** for product listings, cart state, and order history caching.
* **AI Support Widget**: Built-in floating chat interface powered by `react-markdown` and `remark-gfm` for rich markdown formatting, session tracking, and guest rate-limiting (3 free messages).
* **Authentication**: Google OAuth2 integration (`@react-oauth/google`).
* **Hosting**: Netlify Edge CDN with SPA redirect configuration (`netlify.toml`).

---

## 📂 Directory Structure

```
frontend/
├── src/
│   ├── api/          # Axios client & service endpoints (productsApi, cartApi, ordersApi, aiApi)
│   ├── components/   # Navbar, Footer, ProtectedRoute, AdminRoute, AIChatWidget
│   ├── pages/        # HomePage, ProductDetailPage, CartPage, OrdersPage, AdminDashboardPage
│   ├── store/        # Redux Toolkit store (authSlice.ts, store.ts, hooks.ts)
│   ├── lib/          # Helper utilities & currency formatters
│   ├── App.tsx       # Router, FAB button toggle, QueryClientProvider setup
│   └── main.tsx      # Application entrypoint with Redux Provider & GoogleOAuthProvider
├── docs/             # Frontend system design & documentation
│   ├── api-documentation.md
│   ├── database-schema.md
│   └── system-design.md
├── SYSTEM_DESIGN.md  # One-page system design & deployment guide
├── netlify.toml      # Netlify SPA redirect rules
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── .env
```

---

## ✨ Key Features

1. **Google Sign-In**:
   - Integrates Google OAuth2 popup login.
   - Posts ID token to backend `/api/v1/auth/google` to receive a JWT access token.
   - Dispatches `setAuth` action to Redux store with automatic token persistence.
2. **Product Catalog & Filters**:
   - Browse items by category (`Electronics`, `Clothing`, `Accessories`, `Home`).
   - Keyword search filtering across name, description, and tags.
3. **Cart & Checkout Workflow**:
   - Slide-over shopping cart drawer and dedicated cart page.
   - Synchronizes cart state via TanStack Query.
   - Redirection to Stripe Checkout Session created by backend.
4. **Order History**:
   - Inspect customer order history, status (`pending`, `confirmed`, `shipped`, `delivered`), and payment states.
5. **AI Customer Support Assistant**:
   - Floating AI chat widget accessible on all pages.
   - Formats rich markdown text including bold, lists, and code blocks.
   - Enforces a 3-message limit for guest users before prompting Google Sign-In.

---

## ⚡ Setup & Local Development

### 1. Installation

```bash
cd frontend

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create `.env` file in `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

### 3. Run Development Server

```bash
npm run dev
```

Application will run locally at: `http://localhost:5173`

### 4. Build Production Bundle

```bash
npm run build
```

The compiled output will be generated in the `dist/` directory.

---

## 🚀 How to Scale the Frontend

When application user volume increases significantly, the frontend scales using the following strategies:

### 1. Netlify Edge CDN Hosting & Asset Distribution
* **Global Netlify CDN**: Distribute static assets across global edge nodes.
* **Cache Control Headers**: `index.html` served with `no-cache, no-store` for instant update deployment, while fingerprinted JS/CSS chunks (`/assets/*.js`) are cached with `max-age=31536000, immutable`.
* **Gzip / Brotli Compression**: Assets are compressed during build to minimize bandwidth consumption.

### 2. Code Splitting & Lazy Loading
* **Dynamic Route Imports**: Route components (`HomePage`, `CartPage`, `AdminDashboardPage`) are imported dynamically via `React.lazy()` and wrapped in `Suspense` fallbacks.
* **Vendor Chunking**: Separate third-party dependencies (`react`, `redux`, `lucide-react`, `react-markdown`) into dedicated chunks using Vite Rollup manual chunking settings.

### 3. Client State & Query Cache Optimization
* **TanStack Query Invalidation**: Set optimal `staleTime` (e.g. 5 minutes for product catalog data) to prevent unnecessary background refetches on screen switches.
* **Optimistic UI Updates**: Instantly increment cart badge counts and line items in local store state while backend sync runs in the background.

### 4. AI Chat Widget Resource Scaling
* **Client Rate Limiting**: Guest query limits (3 messages max) are checked in local state prior to sending API requests, shielding the backend from guest spam.
* **Message Virtualization**: Chat conversation streams utilize memoization (`React.memo`) to avoid re-rendering entire thread histories on new messages.
