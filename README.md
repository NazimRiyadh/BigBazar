# BigBazar

A modern, full-featured e-commerce platform built with Node.js, Express, and cutting-edge technologies for seamless shopping and payment processing.

## 📋 Project Overview

BigBazar is a comprehensive e-commerce solution designed to provide users with a smooth shopping experience. The platform integrates intelligent AI capabilities, real-time caching, secure payment processing, and robust authentication to create a production-ready marketplace.

**Problem Solved:**
- Streamlined online shopping with AI-powered recommendations
- Secure payment processing via Stripe integration
- High-performance data retrieval with Redis caching
- Vector-based product search using Pinecone
- Secure user authentication and authorization

## 🛠️ Tech Stack

**Backend:**
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js 5.2.1
- **Database:** PostgreSQL
- **Cache:** Redis (ioredis)
- **Vector DB:** Pinecone
- **AI:** Google Generative AI

**Security & Authentication:**
- JWT (JSON Web Tokens)
- bcrypt for password hashing
- CORS enabled
- Rate limiting with express-rate-limit

**Integrations:**
- **Payments:** Stripe
- **Storage:** Cloudinary (image hosting)
- **Email:** Nodemailer
- **HTTP Client:** Axios

**Development:**
- nodemon for development server

## ✨ Features

- 🔐 Secure user authentication with JWT tokens
- 💳 Stripe payment integration for safe transactions
- 🤖 AI-powered product recommendations via Google Generative AI
- 🔍 Vector-based semantic search using Pinecone
- ⚡ Redis caching for optimized performance
- 📸 Cloud-based image management with Cloudinary
- 📧 Email notifications via Nodemailer
- 🛡️ Rate limiting to prevent abuse
- 📤 File upload support with express-fileupload
- 🔑 Password encryption with bcrypt

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database
- Redis instance
- Accounts for: Stripe, Cloudinary, Google Cloud, Pinecone

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NazimRiyadh/BigBazar.git
   cd BigBazar
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Set up environment variables (see below)**

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm start
   ```

## 🔐 Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bigbazar

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Generative AI
GOOGLE_API_KEY=your_google_api_key

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name
PINECONE_ENVIRONMENT=your_environment

# Nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Server
PORT=5000
NODE_ENV=development
```

## 📖 Usage Examples

### Starting the Server

**Development mode (with auto-reload):**
```bash
cd server
npm run dev
```

**Production mode:**
```bash
cd server
npm start
```

The server will start on `http://localhost:5000` (or the specified PORT).

### Basic API Flow

1. **User Registration/Login** → JWT token issued
2. **Browse Products** → Vector search via Pinecone
3. **Add to Cart** → Cached in Redis
4. **Checkout** → Stripe payment processing
5. **Order Confirmation** → Email notification via Nodemailer

## 🔌 API Endpoints (Common)

Typical endpoints include:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/products` | Get all products |
| POST | `/api/products/search` | AI-powered product search |
| POST | `/api/cart` | Add to cart |
| POST | `/api/payment/checkout` | Process Stripe payment |
| GET | `/api/orders` | Get user orders |

*Refer to your API documentation for complete endpoint details.*

## 📁 Folder Structure

```
BigBazar/
├── server/
│   ├── package.json           # Server dependencies
│   ├── server.js              # Main server entry point
│   ├── routes/                # API route definitions
│   ├── controllers/           # Business logic
│   ├── models/                # Database models
│   ├── middleware/            # Authentication, validation, etc.
│   ├── config/                # Configuration files
│   ├── utils/                 # Helper functions
│   └── .env                   # Environment variables (not committed)
├── client/                    # Frontend application (if applicable)
└── README.md                  # This file
```

## 🚢 Deployment Instructions

### Prerequisites
- Cloud provider account (Heroku, Railway, Render, etc.)
- PostgreSQL hosting (AWS RDS, Railway, etc.)
- Redis hosting (Redis Labs, Railway, etc.)

### Steps for Heroku/Railway/Render

1. **Set environment variables** on your hosting platform
2. **Deploy the application:**
   ```bash
   git push heroku main  # or git push to your deployment branch
   ```
3. **Run database migrations** (if applicable)
4. **Verify the deployment:**
   ```bash
   curl https://your-app-url.herokuapp.com/api/health
   ```

### Docker Deployment (Optional)

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app/server
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Build and deploy:
```bash
docker build -t bigbazar .
docker run -p 5000:5000 --env-file .env bigbazar
```

## 📊 Performance Optimizations

- **Redis Caching:** Reduces database queries
- **Pinecone Vector DB:** Fast semantic search
- **Cloudinary CDN:** Optimized image delivery
- **Rate Limiting:** Prevents abuse and DDoS
- **Connection Pooling:** Efficient database connections

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 📞 Support

For issues, questions, or feature requests, please open an GitHub issue or contact the maintainers.

---

**Built with ❤️ by NazimRiyadh**
