# 🛍️ Riviera Monaco E-Commerce Backend

Complete Node.js/Express/MongoDB e-commerce platform with Stripe integration.

## 📦 Setup

### 1. Installation

```bash
npm install
```

### 2. Environment Variables

Create `.env` file from `.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/riviera-monaco
JWT_SECRET=your_super_secret_jwt_key_here
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
CLIENT_URL=http://localhost:3000
```

### 3. Start Server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

---

## 🗂️ Project Structure

```
├── models/
│   ├── Product.js      # Product schema
│   ├── User.js         # User schema with auth
│   ├── Cart.js         # Shopping cart
│   └── Order.js        # Orders
├── routes/
│   ├── auth.js         # Register, Login
│   ├── products.js     # CRUD operations
│   ├── cart.js         # Cart management
│   ├── orders.js       # Order creation & tracking
│   └── payment.js      # Stripe integration
├── middleware/
│   └── auth.js         # JWT verification
├── server.js           # Express app setup
├── package.json
└── .env                # Environment variables
```

---

## 🔑 API Endpoints

### 🔐 Authentication

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

---

### 📦 Products

#### Get All Products
```
GET /api/products?category=Hoodies&sort=price-asc&search=hoodie
```

#### Get Single Product
```
GET /api/products/:id
```

#### Create Product (Admin)
```
POST /api/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Hoodie Navy Classic",
  "category": "Hoodies",
  "description": "Premium cotton hoodie",
  "price": 79,
  "color": "Navy",
  "material": "Premium Cotton",
  "sku": "HN-001",
  "sizes": [
    { "size": "XS", "stock": 10 },
    { "size": "S", "stock": 15 }
  ]
}
```

#### Update Product (Admin)
```
PUT /api/products/:id
Authorization: Bearer <admin-token>
```

#### Delete Product (Admin)
```
DELETE /api/products/:id
Authorization: Bearer <admin-token>
```

---

### 🛒 Shopping Cart

#### Get Cart
```
GET /api/cart
Authorization: Bearer <token>
# OR for guest:
GET /api/cart?sessionId=session-id-123
```

#### Add to Cart
```
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "quantity": 1,
  "size": "M",
  "sessionId": "session-id-123" // for guests
}
```

#### Update Cart Item
```
PUT /api/cart/update/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 2,
  "sessionId": "session-id-123"
}
```

#### Remove from Cart
```
POST /api/cart/remove/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "session-id-123"
}
```

#### Clear Cart
```
POST /api/cart/clear
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "session-id-123"
}
```

---

### 💳 Payment (Stripe)

#### Create Payment Intent
```
POST /api/payment/create-payment-intent
Content-Type: application/json

{
  "amount": 79.00,
  "email": "customer@example.com",
  "metadata": {
    "orderId": "order-123"
  }
}
```

#### Confirm Payment
```
POST /api/payment/confirm-payment
Content-Type: application/json

{
  "paymentIntentId": "pi_xxx"
}
```

---

### 📋 Orders

#### Create Order
```
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "customer@example.com",
  "items": [
    {
      "productId": "64a1b2c3d4e5f6g7h8i9j0k1",
      "productName": "Hoodie Navy",
      "quantity": 1,
      "size": "M",
      "price": 79
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "street": "123 Main St",
    "city": "Monaco",
    "postalCode": "98000",
    "country": "Monaco",
    "phone": "+377 12 34 56 78"
  },
  "billingAddress": { ... },
  "totalPrice": 79.00,
  "paymentIntentId": "pi_xxx",
  "sessionId": "session-id-123"
}
```

#### Get My Orders
```
GET /api/orders
Authorization: Bearer <token>
```

#### Get Order by Number
```
GET /api/orders/RM-1234567890-1
```

#### Update Order Status (Admin)
```
PUT /api/orders/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "orderStatus": "shipped",
  "paymentStatus": "completed"
}
```

#### Get All Orders (Admin)
```
GET /api/orders/admin/all
Authorization: Bearer <admin-token>
```

---

## 🗄️ MongoDB Setup

### Option 1: MongoDB Atlas (Cloud - Recommended)
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster
4. Get connection string
5. Add to `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/riviera-monaco
```

### Option 2: Local MongoDB

```bash
# Install MongoDB locally
# Then start service and update .env:
MONGODB_URI=mongodb://localhost:27017/riviera-monaco
```

---

## 🔑 Stripe Setup

1. Go to [stripe.com](https://stripe.com)
2. Create account
3. Get API keys from Dashboard
4. Add to `.env`:

```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

---

## 🚀 Deployment

### Deploy to Heroku

```bash
npm install -g heroku
heroku login
heroku create riviera-monaco
git push heroku ecommerce-setup:main
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
heroku config:set STRIPE_SECRET_KEY=your_stripe_key
```

---

## 📝 Sample Data (Seeds)

Create `seeds.js` to populate initial products:

```javascript
import Product from './models/Product.js';
import mongoose from 'mongoose';

const products = [
  {
    name: 'Hoodie Navy Classic',
    category: 'Hoodies',
    description: 'Premium cotton hoodie in classic navy',
    price: 79,
    color: 'Navy',
    material: 'Premium Cotton',
    sku: 'HN-001',
    sizes: [
      { size: 'XS', stock: 10 },
      { size: 'S', stock: 15 },
      { size: 'M', stock: 20 }
    ]
  },
  // ... more products
];

await Product.insertMany(products);
```

---

## 🛡️ Security Notes

- Always use HTTPS in production
- Keep `.env` secret (never commit to git)
- Validate all inputs on backend
- Use strong JWT_SECRET
- Enable CORS only for your frontend domain
- Implement rate limiting for production

---

## 📞 Support

For issues, check:
- MongoDB connection
- Stripe test keys
- CORS settings
- JWT secret consistency

---

Made with ❤️ for Riviera Monaco
