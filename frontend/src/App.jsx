import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Categories from './pages/Categories';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Artisans from './pages/Artisans';
import ArtisanProfile from './pages/ArtisanProfile';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import SellerDashboard from './pages/SellerDashboard';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import './styles/index.css';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <WishlistProvider>
          <CartProvider>
            <Router>
              <div className="craftora-app">
                <Navbar />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetails />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/artisans" element={<Artisans />} />
                    <Route path="/artisans/:id" element={<ArtisanProfile />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/seller" element={<SellerDashboard />} />
                    <Route path="/admin" element={<Admin />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
          </CartProvider>
        </WishlistProvider>
      </ToastProvider>
    </AuthProvider>
  );
}