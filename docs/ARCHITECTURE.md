# Craftora — System Architecture & Design Specification

## 1. High-Level Architecture

Craftora is designed as a decoupled 3-tier full-stack application:

```
+-------------------------------------------------------------+
|                      CLIENT TIER                            |
|             React 19 + Vite + React Router DOM              |
|        - State: Context API (Auth, Cart, Wishlist, Toast)   |
|        - Icons: Lucide-React                                |
|        - Styling: Pure Modern CSS Variables                 |
|        - Port: 5173                                         |
+-------------------------------------------------------------+
                              |
                     HTTPS / JSON REST API
                              |
+-------------------------------------------------------------+
|                    APPLICATION TIER                         |
|             Python 3.14 + Flask REST API                    |
|        - Routing: Flask Blueprints                          |
|        - Auth: JSON Web Tokens (PyJWT) + Scrypt Hashing     |
|        - Middleware: @token_required, @admin_required       |
|        - DB Driver: PyMySQL (Parameterized Queries)         |
|        - Port: 5000                                         |
+-------------------------------------------------------------+
                              |
                    Raw SQL TCP (Port 3307)
                              |
+-------------------------------------------------------------+
|                      DATABASE TIER                          |
|                    MySQL 8.0 InnoDB                         |
|        - ACID Transactions for Order Placement              |
|        - 11 Normalized Tables with Foreign Keys             |
|        - Dedicated Port: 3307                               |
|        - Storage Engine: InnoDB                             |
+-------------------------------------------------------------+
```

---

## 2. Frontend State Architecture

Craftora manages global application state using React's native Context API, eliminating external state library overhead:

1. **`AuthContext`**:
   - Stores current patron object and JWT token.
   - Automatically synchronizes with browser `localStorage`.
   - Provides `login`, `register`, `logout`, and `updateUser` methods.
   - Exposes computed flags: `isAuthenticated` and `isAdmin`.

2. **`CartContext`**:
   - Connects with Flask's `/api/cart` endpoint for authenticated patrons.
   - Automatically re-calculates subtotals, item counts, shipping rules (Free over ₹1000).
   - Dynamically updates the global Navbar shopping bag badge.

3. **`WishlistContext`**:
   - Persists user product bookmarks in MySQL `wishlist` table.
   - Updates the heart counter badge in real-time.
   - Provides one-click "Move to Cart" workflow.

4. **`ToastContext`**:
   - Transient pop-up notification system (*success, error, warning, info*).
   - Dismisses automatically after 3.5 seconds.

---

## 3. Security Architecture

1. **Password Hashing**:
   - Implements Werkzeug's `generate_password_hash` utilizing `scrypt`.
   - Passwords are never stored in plaintext.

2. **Stateless Authentication (JWT)**:
   - Upon login, Flask generates an HS256-signed JWT token valid for 7 days.
   - Token payload: `{ "user_id": id, "email": email, "role": role, "exp": ... }`.
   - Client sends this token in the `Authorization: Bearer <token>` HTTP header.

3. **Role-Based Access Control (RBAC)**:
   - `@token_required`: Ensures valid token signature and active user.
   - `@admin_required`: Ensures `current_user['role'] == 'ADMIN'`, returning HTTP 403 Forbidden on violation.

4. **SQL Injection Prevention**:
   - 100% of database queries utilize parameterized format (`%s` placeholders with parameter tuples) passed directly to the MySQL binary protocol. No string concatenation (`f"{var}"`) is ever used for user input in SQL.
