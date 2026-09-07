# System Design & Production Architecture - Frontend

## Overview

The **Mini AI E-Commerce Application Frontend** is built as a Single Page Application (SPA) using React 19, TypeScript, Redux Toolkit, TanStack Query, and Tailwind CSS, deployed on **Netlify Edge CDN**.

---

## High-Level System Architecture

```
User Browser (React 19 SPA)
       │
       ├── State Management: Redux Toolkit (Authentication & LocalStorage persistence)
       │
       ├── Data Caching: TanStack Query (Products, Cart, Order queries & mutations)
       │
       ├── AI Widget: Embedded Markdown Chat with Session & Rate Limiting
       │
       ▼ HTTP REST / Bearer JWT
Vercel Serverless Network (FastAPI Backend)
```

---

## Scalability Strategy

### 1. Static Asset Edge CDN Distribution
* **Netlify Edge CDN**: Serves immutable hashed assets (`.js`, `.css`) with global edge caching.

### 2. Code Splitting & Lazy Loading
* **React Suspense**: Routes are loaded dynamically to keep initial JS bundle size minimal.

### 3. Client Caching & Optimistic UI
* **TanStack Query Cache**: Minimizes redundant product fetch requests with stale-time management.
* **Redux State**: Manages local cart & user session state instantly.
