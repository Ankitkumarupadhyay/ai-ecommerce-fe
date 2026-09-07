# One-Page System Design & Architecture - Frontend

## 📌 Deliverables & Project Summary

| Deliverable | Details / Link |
| :--- | :--- |
| **Live Frontend URL** | [https://ai-e-com.netlify.app](https://ai-e-com.netlify.app) |
| **Live Backend API** | [https://ai-ecommerce-be.vercel.app](https://ai-ecommerce-be.vercel.app) |
| **API Swagger Documentation** | [https://ai-ecommerce-be.vercel.app/docs](https://ai-ecommerce-be.vercel.app/docs) |
| **GitHub Repository** | [https://github.com/Ankit0090/AI-E-Commerce](https://github.com/Ankit0090/AI-E-Commerce) |
| **Database Schema** | [docs/database-schema.md](file:///Users/ankit/Projects/Moksha%20Media/AI%20E-Commerce/frontend/docs/database-schema.md) |
| **API Documentation** | [docs/api-documentation.md](file:///Users/ankit/Projects/Moksha%20Media/AI%20E-Commerce/frontend/docs/api-documentation.md) |
| **Total Time Taken** | `4.5 Hours` |
| **AI Tools Used** | `Gemini 3.6 Flash (Antigravity AI Coding Assistant)`, `OpenAI GPT-4o-mini`, `LangChain / LangGraph` |

---

## 🏗️ 1. Core Architecture Overview

The system is designed around six integrated services:

1. **Frontend (Client Layer)**: Built with React 19, TypeScript, Vite, Redux Toolkit, TanStack Query, and Tailwind CSS. Deployed on **Netlify Edge CDN**.
2. **FastAPI Backend**: Python asynchronous framework handling JWT auth, cart synchronization, orders, Stripe session generation, and AI agent execution. Deployed on **Vercel Serverless**.
3. **MongoDB Database**: Entity persistence storing users, products, active carts, orders, Stripe webhook audit events, and AI chat logs on **MongoDB Atlas**.
4. **AI Support Agent Widget**: Real-time floating chat widget (`react-markdown` + `remark-gfm`) executing backend tool queries (`get_available_products`, `search_products`, `get_my_orders`) with guest rate-limiting (3 free messages).
5. **Google Authentication**: Integrated with `@react-oauth/google` for seamless OAuth2 login and token exchange.
6. **Stripe Payment Gateway**: Direct checkout redirection to Stripe Checkout with backend price snapshotting and idempotent webhook confirmation.

---

## 📐 2. System Architecture Flow

```mermaid
graph TD
    User["🌐 End User Browser"]
    
    subgraph FrontendApp["Frontend Application (Netlify Edge CDN)"]
        UI["React 19 Components (Navbar, ProductList, CartDrawer, Orders)"]
        ReduxStore["Redux Toolkit Store (authSlice + localStorage)"]
        QueryClient["TanStack Query Cache (products, cart, orders)"]
        AIChat["AI Chat Widget (React Markdown + Rate Limiter)"]
    end

    subgraph BackendServices["Backend API & External Integrations (Vercel)"]
        API["FastAPI REST API (Vercel Serverless)"]
        Google["Google OAuth2 Provider"]
        Stripe["Stripe Payments Gateway"]
        LLM["LangChain / OpenAI Agent"]
    end

    User -->|Interacts| UI
    UI <-->|Auth State| ReduxStore
    UI <-->|Data Cache| QueryClient
    
    UI -->|1. Google Login Token| API
    API -->|2. Verify Token| Google
    API -->|3. Issue JWT Token| ReduxStore

    QueryClient <-->|4. Fetch / Mutate (Bearer JWT)| API
    
    UI -->|5. Checkout Redirect| Stripe
    
    AIChat -->|6. Chat Query (Session ID)| API
    API <-->|7. LLM Tool Execution| LLM
    API -->|8. Formatted Response| AIChat
```

---

## ☁️ 3. Production Deployment Approach (Netlify + Vercel)

```
                               ┌──────────────────────────────────────────────────┐
                               │                 User Web Browser                 │
                               └────────────────────────┬─────────────────────────┘
                                                        │
                      ┌─────────────────────────────────┴─────────────────────────────────┐
                      │                                                                   │
                      ▼                                                                   ▼
       ┌───────────────────────────────┐                                   ┌───────────────────────────────┐
       │ Netlify Edge CDN              │                                   │ Vercel Serverless Network     │
       │ (Frontend Static SPA Build)   │                                   │ (FastAPI Python Runtime)      │
       └───────────────────────────────┘                                   └───────────────────────────────┘
```

* **Global Netlify CDN Distribution**: The compiled React SPA static assets (`index.html`, bundle `.js`, `.css`, media assets) are served via Netlify's global edge network for sub-100ms initial page loads.
* **Cache Control Strategy**: `index.html` is served with `no-cache, no-store` to force immediate update detection on new deployments, while hashed static assets (`/assets/*.js`, `/assets/*.css`) are cached indefinitely (`max-age=31536000, immutable`).
* **SPA Routing Rules**: Configured via `netlify.toml` (`/* -> /index.html 200`) ensuring proper client-side routing on hard reloads and deep links.

---

## 🚀 4. How to Scale Frontend Strategy

When scaling to handle heavy concurrent user traffic and frequent AI interactions, the frontend utilizes the following optimization techniques:

### A. Static Asset & CDN Optimization
1. **Netlify Edge Caching & Compression**: Static files are compressed with Gzip/Brotli and cached at global Netlify edge CDN nodes, reducing origin server load to zero for static asset delivery.
2. **Code Splitting & Route Lazy Loading**: Routes (`HomePage`, `ProductDetailPage`, `CartPage`, `OrdersPage`, `AdminDashboardPage`) are code-split using `React.lazy()` and `Suspense`, loading bundle chunks on demand.

### B. Client-Side State & Query Caching
1. **TanStack Query (React Query) Caching**: Product catalog queries are cached on the client with a `staleTime` of 5 minutes. Subsequent navigation between home and detail pages reads from local memory cache without making redundant HTTP GET requests.
2. **Optimistic Cart & UI Updates**: Cart quantity adjustments update local Redux / Query cache optimistically before server round-trips complete, ensuring instant interface responsiveness.

### C. AI Chat Widget Performance Scaling
1. **Local Rate-Limiting & Message Guard**: Guest user chat limits (3 messages max) are enforced client-side via `localStorage` before initiating network requests to protect backend resources.
2. **Virtualization for Long Conversations**: Chat history messages utilize lightweight memoization (`React.memo`) to avoid re-rendering entire conversation streams on every keystroke.
3. **Debounced User Input**: Search fields and AI prompt inputs use debouncing to eliminate unnecessary API requests while typing.
