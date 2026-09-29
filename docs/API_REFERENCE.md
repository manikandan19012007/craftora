# Craftora — REST API Specification

All endpoints return JSON responses. Protected endpoints expect an `Authorization: Bearer <token>` header.

---

## 1. System Health
- **`GET /api/health`**: Verifies MySQL connectivity and server status.

## 2. Authentication (`/api/auth`)
- **`POST /api/auth/register`**: Register new patron account (`name, email, password, confirm_password`).
- **`POST /api/auth/login`**: Authenticate and return JWT token (`email, password`).
- **`GET /api/auth/me`**: Get current user profile and activity stats (`orders, wishlist, reviews`). *(Protected)*
- **`PUT /api/auth/profile`**: Update display name and avatar URL. *(Protected)*
- **`GET /api/auth/users`**: List all users with activity counts. *(Admin only)*
- **`POST /api/auth/logout`**: Terminate session.

## 3. Products (`/api/products`)
- **`GET /api/products`**: Query products with filters (`category, min_price, max_price, rating, search, sort, page, limit`).
- **`GET /api/products/:id`**: Product details with category, artisan, and secondary images.
- **`POST /api/products`**: Create product. *(Admin only)*
- **`PUT /api/products/:id`**: Update product. *(Admin only)*
- **`DELETE /api/products/:id`**: Remove product. *(Admin only)*

## 4. Categories (`/api/categories`)
- **`GET /api/categories`**: List all categories with dynamic product counts.
- **`GET /api/categories/:id`**: Category details.
- **`POST /api/categories`**: Create category. *(Admin only)*
- **`DELETE /api/categories/:id`**: Delete category. *(Admin only)*

## 5. Artisans (`/api/artisans`)
- **`GET /api/artisans`**: Directory of artisans with filters (`craft, search`).
- **`GET /api/artisans/:id`**: Profile details and direct studio products.
- **`POST /api/artisans`**: Onboard artisan. *(Admin only)*
- **`PUT /api/artisans/:id`**: Update artisan profile. *(Admin only)*
- **`DELETE /api/artisans/:id`**: Delete artisan profile. *(Admin only)*

## 6. Cart (`/api/cart`) *(All Protected)*
- **`GET /api/cart`**: Retrieve current cart items and calculated pricing summary.
- **`POST /api/cart`**: Add product to cart with quantity (`product_id, quantity`).
- **`PUT /api/cart/:itemId`**: Update cart item quantity (`quantity`).
- **`DELETE /api/cart/:itemId`**: Remove item from cart.

## 7. Wishlist (`/api/wishlist`) *(All Protected)*
- **`GET /api/wishlist`**: Get user wishlist items.
- **`POST /api/wishlist`**: Save product to wishlist (`product_id`).
- **`DELETE /api/wishlist/:productId`**: Remove from wishlist.

## 8. Orders (`/api/orders`) *(Protected)*
- **`POST /api/orders`**: Checkout cart into an atomic ACID order (`shipping_address, city, state, pincode, phone`).
- **`GET /api/orders`**: Get logged-in user's orders with items.
- **`GET /api/orders/:id`**: Get single order details.
- **`GET /api/orders/all`**: Get all platform orders. *(Admin only)*
- **`PUT /api/orders/:id/status`**: Update status (`order_status: Confirmed | Shipped | Delivered | Cancelled`).

## 9. Reviews (`/api/products/:id/reviews`)
- **`GET /api/products/:id/reviews`**: Get reviews for a product.
- **`POST /api/products/:id/reviews`**: Submit review (`rating, comment`). *(Protected)*
- **`DELETE /api/reviews/:id`**: Remove review. *(Author or Admin)*
- **`GET /api/reviews`**: List all reviews for moderation. *(Admin only)*
