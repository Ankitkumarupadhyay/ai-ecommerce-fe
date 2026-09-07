# API Documentation - Mini AI E-Commerce API

Base URL: `http://localhost:8000/api/v1` (Production: `https://ai-ecommerce-be.vercel.app/api/v1`)  
Swagger Interactive UI: `http://localhost:8000/docs` (Production: `https://ai-ecommerce-be.vercel.app/docs`)

---

## 1. Authentication

### POST `/auth/google`
Authenticates Google OAuth credential ID token, registers new users (default role: `customer`), or retrieves existing users, and issues a JWT access token.

* **Auth Required**: None
* **Request Body**:
  ```json
  {
    "credential": "google_id_token_string"
  }
  ```

### GET `/auth/me`
Retrieves current user details.

---

## 2. Products

### GET `/products`
Returns listing of active products with optional search query and category filtering.

* **Auth Required**: None

### GET `/products/{product_id}`
Returns product details by ID.

---

## 3. Cart Management

### GET `/cart`
Returns the user's active shopping cart.

### POST `/cart/items`
Adds item to cart.

### PUT `/cart/items/{product_id}`
Updates cart item quantity.

### DELETE `/cart/items/{product_id}`
Removes product from cart.

---

## 4. Order Management

### POST `/orders/create-from-cart`
Creates pending order from cart.

### GET `/orders`
Lists authenticated user's orders.

---

## 5. Payments & Webhooks

### POST `/payments/create-checkout-session`
Creates Stripe Checkout Session.

### POST `/payments/webhook`
Stripe Webhook signature verification & idempotent stock deduction.

---

## 6. AI Support Agent

### POST `/ai/chat`
Invokes AI Agent with tools (`get_available_products`, `search_products`, `get_my_orders`) and logs interaction with IP Geolocation.
