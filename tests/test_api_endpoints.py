import unittest
import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:5000/api"

class TestCraftoraBackend(unittest.TestCase):

    def api_request(self, endpoint, method="GET", data=None, token=None):
        url = f"{BASE_URL}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f"Bearer {token}"

        encoded_data = json.dumps(data).encode('utf-8') if data else None
        req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)

        try:
            with urllib.request.urlopen(req) as res:
                body = res.read().decode('utf-8')
                return res.status, json.loads(body) if body else {}
        except urllib.error.HTTPError as e:
            body = e.read().decode('utf-8')
            return e.code, json.loads(body) if body else {}

    # 1. Health Endpoint
    def test_01_health_check(self):
        status, data = self.api_request('/health')
        self.assertEqual(status, 200)
        self.assertEqual(data.get('status'), 'healthy')
        self.assertTrue(data.get('database', {}).get('connected'))

    # 2. Categories Listing
    def test_02_categories_endpoint(self):
        status, data = self.api_request('/categories')
        self.assertEqual(status, 200)
        self.assertIn('categories', data)
        self.assertGreater(len(data['categories']), 0)
        first = data['categories'][0]
        self.assertIn('name', first)
        self.assertIn('product_count', first)

    # 3. Artisans Directory
    def test_03_artisans_endpoint(self):
        status, data = self.api_request('/artisans')
        self.assertEqual(status, 200)
        self.assertIn('artisans', data)
        self.assertGreater(len(data['artisans']), 0)
        artisan = data['artisans'][0]
        self.assertIn('specialty', artisan)
        self.assertIn('location', artisan)

    # 4. Products Listing & Filtering
    def test_04_products_discovery(self):
        status, data = self.api_request('/products?limit=10')
        self.assertEqual(status, 200)
        self.assertIn('products', data)
        self.assertIn('total', data)
        self.assertGreaterEqual(len(data['products']), 1)

    # 5. Product Details by ID
    def test_05_product_details(self):
        status, data = self.api_request('/products/1')
        self.assertEqual(status, 200)
        self.assertIn('product', data)
        prod = data['product']
        self.assertEqual(prod['id'], 1)
        self.assertIn('name', prod)
        self.assertIn('price', prod)

    # 6. Auth Login (Patron)
    def test_06_patron_login(self):
        payload = {"email": "ananya@example.com", "password": "password123"}
        status, data = self.api_request('/auth/login', method='POST', data=payload)
        self.assertEqual(status, 200)
        self.assertIn('token', data)
        self.assertIn('user', data)
        self.assertEqual(data['user']['role'], 'USER')

    # 7. Auth Login (Admin)
    def test_07_admin_login(self):
        payload = {"email": "admin@craftora.com", "password": "password123"}
        status, data = self.api_request('/auth/login', method='POST', data=payload)
        self.assertEqual(status, 200)
        self.assertIn('token', data)
        self.assertEqual(data['user']['role'], 'ADMIN')

    # 8. User Profile & Dynamic Stats
    def test_08_user_profile_stats(self):
        # Login first
        _, login_data = self.api_request('/auth/login', method='POST', data={"email": "ananya@example.com", "password": "password123"})
        token = login_data['token']

        status, data = self.api_request('/auth/me', token=token)
        self.assertEqual(status, 200)
        self.assertIn('user', data)
        self.assertIn('stats', data['user'])
        self.assertIn('orders', data['user']['stats'])
        self.assertIn('wishlist', data['user']['stats'])
        self.assertIn('reviews', data['user']['stats'])

    # 9. RBAC Protection on Admin Endpoint
    def test_09_rbac_protection(self):
        # Regular user trying to access admin endpoint
        _, login_data = self.api_request('/auth/login', method='POST', data={"email": "ananya@example.com", "password": "password123"})
        user_token = login_data['token']

        status, data = self.api_request('/orders/all', token=user_token)
        self.assertEqual(status, 403)
        self.assertIn('error', data)

    # 10. Admin Endpoints Success
    def test_10_admin_access_allowed(self):
        # Admin accessing admin endpoint
        _, login_data = self.api_request('/auth/login', method='POST', data={"email": "admin@craftora.com", "password": "password123"})
        admin_token = login_data['token']

        status, data = self.api_request('/orders/all', token=admin_token)
        self.assertEqual(status, 200)
        self.assertIn('orders', data)

        status2, data2 = self.api_request('/auth/users', token=admin_token)
        self.assertEqual(status2, 200)
        self.assertIn('users', data2)

    # 11. Address Management
    def test_11_address_management(self):
        _, login_data = self.api_request('/auth/login', method='POST', data={"email": "ananya@example.com", "password": "password123"})
        token = login_data['token']

        # Create Address
        addr_payload = {
            "full_name": "Ananya Sharma Test",
            "phone": "9876543210",
            "house_street": "Flat 101, Test Residency",
            "area_city": "Jaipur",
            "state": "Rajasthan",
            "pincode": "302001",
            "is_default": True
        }
        status, data = self.api_request('/addresses', method='POST', data=addr_payload, token=token)
        self.assertEqual(status, 201)
        self.assertIn('id', data)
        addr_id = data['id']

        # Get Addresses
        status, data = self.api_request('/addresses', token=token)
        self.assertEqual(status, 200)
        self.assertIn('addresses', data)
        self.assertGreaterEqual(len(data['addresses']), 1)

        # Delete Address
        status, data = self.api_request(f'/addresses/{addr_id}', method='DELETE', token=token)
        self.assertEqual(status, 200)

    # 12. Cart & Place Order Flow with Custom Options
    def test_12_cart_and_order_flow(self):
        _, login_data = self.api_request('/auth/login', method='POST', data={"email": "ananya@example.com", "password": "password123"})
        token = login_data['token']

        # Add to cart with variant
        cart_payload = {
            "product_id": 2,
            "quantity": 1,
            "selected_color": "Natural",
            "selected_size": "M",
            "custom_text": "Ananya Special",
            "customization_fee": 50
        }
        status, data = self.api_request('/cart', method='POST', data=cart_payload, token=token)
        self.assertIn(status, [200, 201])

        # View Cart
        status, data = self.api_request('/cart', token=token)
        self.assertEqual(status, 200)
        self.assertIn('items', data)

        # Place Order
        order_payload = {
            "full_name": "Ananya Sharma",
            "phone": "9876543210",
            "house_street": "42 Weaver Colony",
            "area_city": "Jaipur",
            "state": "Rajasthan",
            "pincode": "302001",
            "payment_method": "upi",
            "payment_service": "demo",
            "transaction_id": "DEMO-TXN-12345"
        }
        status, data = self.api_request('/orders', method='POST', data=order_payload, token=token)
        self.assertEqual(status, 201)
        self.assertIn('order_id', data)
        self.assertIn('order_code', data)

if __name__ == '__main__':
    unittest.main()
