# Craftora — College Web Engineering Viva Voce Master Guide

This guide prepares the student for questions during project presentation and viva evaluation.

---

### Q1: What is the overall architecture of Craftora?
> **Answer**: Craftora is a 3-tier full-stack e-commerce marketplace:
> 1. **Client Tier**: React 19 Single Page Application (SPA) bundled via Vite with React Router DOM for client-side routing and Context API for global state management.
> 2. **Application Tier**: Python Flask RESTful API organized with Flask Blueprints, JWT stateless authentication, custom security middleware decorators (`@token_required`, `@admin_required`), and CORS.
> 3. **Database Tier**: MySQL 8.0 relational database with 11 normalized tables using InnoDB engine to support foreign key referential integrity and ACID transactions.

---

### Q2: How does Craftora prevent race conditions during concurrent checkouts?
> **Answer**: We utilize MySQL's **ACID Transaction control (`conn.commit()` / `conn.rollback()`)**:
> During `POST /api/orders`, the server begins a database transaction:
> 1. Reads current stock of all items in cart.
> 2. Verifies `item['quantity'] <= item['stock_quantity']`.
> 3. If any item is out of stock, it triggers `conn.rollback()` and returns an immediate 400 error.
> 4. If all items are available, it creates the order, inserts snapshots into `order_items`, subtracts inventory in `products` (`stock_quantity = stock_quantity - %s`), empties the user's cart, and commits all changes together.

---

### Q3: Why did you choose JWT over traditional server-side Sessions?
> **Answer**: 
> 1. **Stateless Scalability**: The server doesn't need to allocate memory or query a session store/Redis on every HTTP request.
> 2. **Decoupled Architecture**: Since React runs on port 5173 and Flask runs on port 5000, JWT tokens sent via the `Authorization: Bearer` header circumvent cross-origin cookie security restrictions and allow seamless microservice communication.
> 3. **Tamper-Proof Signature**: The payload is signed with a server-side secret key using the HS256 HMAC algorithm.

---

### Q4: How is SQL Injection prevented across the application?
> **Answer**: Craftora strictly uses **parameterized SQL queries** via PyMySQL. Values passed from client inputs are sent separately as parameter tuples to `cursor.execute(query, tuple(params))` rather than interpolated into strings. The MySQL driver handles escaping and treats input strictly as data values, neutralizing SQL injection attempts.

---

### Q5: How is password storage secured?
> **Answer**: Passwords are never stored in plaintext. We implement the `scrypt` key derivation function via Werkzeug (`generate_password_hash` and `check_password_hash`), which incorporates salting and is computationally hard against brute-force and GPU dictionary attacks.
