# 🧶 CRAFTORA — Handmade & Handcrafted Products Marketplace

A Modern, Real, Working Full-Stack E-Commerce Web Engineering Project built with **React 19 (Vite)**, **Python 3.14 (Flask REST API)**, and **MySQL 8.0 (InnoDB)**.

---

## 1. Project Overview & Highlights
Craftora connects traditional Indian master artisans and rural craft clusters directly with conscious patrons. Built from scratch with clean architectural separation, zero boilerplate templates, and full relational integrity.

- **Frontend**: React 19, Vite, React Router DOM, Context API (Auth, Cart, Wishlist, Toast), Lucide React Icons, Pure CSS variables design system.
- **Backend**: Python 3.14 + Flask, Blueprints architecture, PyMySQL, PyJWT authentication, Scrypt password hashing, ACID database transactions.
- **Database**: Dedicated MySQL 8.0 instance running on port 3307 with 11 normalized relational tables, foreign key constraints, indexes, and seeded data.

---

## 2. Complete Feature Set
1. **Interactive Discovery**:
   - Hero banner with real-time product search.
   - Craft categories with product count badges.
   - Comprehensive multi-filter sidebar (categories, price sliders, minimum ratings, stock availability, multi-sort).
2. **Product Details**:
   - High-resolution multi-angle image gallery.
   - Stock indicators and quantity pickers enforcing maximum limits.
   - Tabbed specifications (Materials, Dimensions, Care Instructions).
   - Artisan highlight card connecting products to their makers.
   - Patron ratings and reviews with 5-star selector.
3. **Artisan Profiles & Directory**:
   - Master artisans directory with craft specialty chips and studio search.
   - Artisan studio profile with biographical heritage, years of experience, and direct-from-studio product catalog.
4. **Patron Shopping Systems**:
   - **Persistent Wishlist**: Saved items with instant heart counters and "Move to Cart" button.
   - **Shopping Cart**: Real-time quantity controls, subtotal math, free shipping threshold (orders over ₹1,000).
   - **ACID Checkout & Orders**: Atomic transactions deducting inventory stock and freezing historical purchase prices.
   - **Patron Profile**: Account stats (orders placed, items wishlisted, reviews submitted), profile picture editor.
5. **Admin Operations Center (`/admin`)**:
   - Role-Based Access Control (`ADMIN` role guard).
   - Live revenue metrics, active orders counter, and catalog statistics.
   - Real-time order dispatch management (*Confirmed, Shipped, Delivered, Cancelled*).
   - Full catalog management with "Add New Product" modal and deletion.
   - Patron review moderation and customer account inspection.
6. **Cross-Device Responsiveness**:
   - Mobile navigation drawer, slide-out product filter drawer, and adaptive checkout layout.

---

## 3. Demo Credentials
| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@craftora.com` | `password123` |
| **Patron 1** | `ananya@example.com` | `password123` |
| **Patron 2** | `rohan@example.com` | `password123` |

---

## 4. How to Run Locally

### Prerequisites
1. **Python 3.11+** installed (`.\venv\Scripts\python.exe`)
2. **Node.js 20+** installed
3. **MySQL Server 8.0**

### 1. Start MySQL Server (Port 3307)
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --port=3307 --datadir="C:\Users\MANIKANDAN G\Documents\WE LAB Project\database\local_data" --console
```

### 2. Start Flask Backend (Port 5000)
```powershell
.\venv\Scripts\python.exe run.py
```
*Health check:* `http://127.0.0.1:5000/api/health`

### 3. Start React Frontend (Port 5173)
```powershell
cd frontend
npm run dev
```
*Marketplace UI:* `http://localhost:5173`

### 4. Run Automated Test Suite
```powershell
.\venv\Scripts\python.exe -m unittest tests\test_api_endpoints.py
```

---

## 5. Documentation Guides
- [System Architecture](docs/ARCHITECTURE.md)
- [Database Schema & ER Model](docs/DATABASE_SCHEMA.md)
- [REST API Specification](docs/API_REFERENCE.md)
- [Viva Voce Examination Questions](docs/VIVA_QUESTIONS.md)