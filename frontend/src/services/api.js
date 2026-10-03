const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('craftora_token');
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }
  return data;
}

// 1. Health
export const checkHealth = () => request('/health');

// 2. Auth APIs
export const registerUser = (userData) => request('/auth/register', {
  method: 'POST',
  body: JSON.stringify(userData)
});
export const loginUser = (credentials) => request('/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials)
});
export const getMe = () => request('/auth/me');
export const updateProfileApi = (profileData) => request('/auth/profile', {
  method: 'PUT',
  body: JSON.stringify(profileData)
});
export const logoutUser = () => request('/auth/logout', { method: 'POST' });

// Upload avatar image file
export const uploadAvatar = (file) => {
  const url = `${API_BASE_URL}/auth/avatar`;
  const token = localStorage.getItem('craftora_token');
  const formData = new FormData();
  formData.append('avatar', file);
  return fetch(url, {
    method: 'POST',
    headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    body: formData,
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
    return data;
  });
};

// 3. Wishlist APIs
export const getWishlist = () => request('/wishlist');
export const addToWishlist = (productId) => request('/wishlist', {
  method: 'POST',
  body: JSON.stringify({ product_id: productId })
});
export const removeFromWishlist = (productId) => request(`/wishlist/${productId}`, {
  method: 'DELETE'
});

// 4. Cart APIs
export const getCart = () => request('/cart');
export const addToCartApi = (productId, quantity = 1, options = {}) => request('/cart', {
  method: 'POST',
  body: JSON.stringify({ product_id: productId, quantity, ...options })
});
export const updateCartItemApi = (itemId, updateData) => request(`/cart/${itemId}`, {
  method: 'PUT',
  body: JSON.stringify(typeof updateData === 'number' ? { quantity: updateData } : updateData)
});
export const removeCartItemApi = (itemId) => request(`/cart/${itemId}`, {
  method: 'DELETE'
});

// 4.5 User Address APIs
export const getUserAddresses = () => request('/addresses');
export const createAddress = (addressData) => request('/addresses', {
  method: 'POST',
  body: JSON.stringify(addressData)
});
export const deleteAddress = (addressId) => request(`/addresses/${addressId}`, {
  method: 'DELETE'
});

// 5. Orders & Checkout APIs
export const createOrderApi = (deliveryData) => request('/orders', {
  method: 'POST',
  body: JSON.stringify(deliveryData)
});
export const getOrders = () => request('/orders');
export const getSellerOrdersApi = () => request('/orders/seller');
export const getOrderById = (id) => request(`/orders/${id}`);
export const cancelOrderApi = (id) => request(`/orders/${id}/cancel`, {
  method: 'PUT'
});
export const updateOrderStatusApi = (id, status) => request(`/orders/${id}/status`, {
  method: 'PUT',
  body: JSON.stringify({ order_status: status })
});

// 6. Reviews APIs
export const getProductReviews = (productId) => request(`/products/${productId}/reviews`);
export const submitProductReview = (productId, reviewData) => request(`/products/${productId}/reviews`, {
  method: 'POST',
  body: JSON.stringify(reviewData)
});
export const deleteReviewApi = (reviewId) => request(`/reviews/${reviewId}`, {
  method: 'DELETE'
});
export const getAllReviewsAdmin = () => request('/reviews');

// 7. Categories APIs
export const getCategories = () => request('/categories');
export const getCategoryById = (id) => request(`/categories/${id}`);

// 8. Artisans APIs
export const getArtisans = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/artisans${query ? `?${query}` : ''}`);
};
export const getArtisanById = (id) => request(`/artisans/${id}`);

// 9. Products APIs
export const getProducts = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/products${query ? `?${query}` : ''}`);
};
export const getProductById = (id) => request(`/products/${id}`);
export const createProductApi = (data) => request('/products', {
  method: 'POST',
  body: JSON.stringify(data)
});
export const updateProductApi = (id, data) => request(`/products/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
});
export const deleteProductApi = (id) => request(`/products/${id}`, {
  method: 'DELETE'
});

// 10. Admin Endpoints
export const getAllOrdersAdmin = () => request('/orders/all');
export const getAllUsersAdmin = () => request('/auth/users');
export const createArtisanApi = (data) => request('/artisans', {
  method: 'POST',
  body: JSON.stringify(data)
});
export const updateArtisanApi = (id, data) => request(`/artisans/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
});
export const deleteArtisanApi = (id) => request(`/artisans/${id}`, {
  method: 'DELETE'
});
export const createCategoryApi = (data) => request('/categories', {
  method: 'POST',
  body: JSON.stringify(data)
});
export const deleteCategoryApi = (id) => request(`/categories/${id}`, {
  method: 'DELETE'
});