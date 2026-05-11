# TechTrio 🚀

**The Ultimate E-Commerce Platform for Tech Enthusiasts**

A modern, full-featured e-commerce platform built with Node.js, Express, and cutting-edge technologies designed specifically for tech lovers. Discover, browse, and purchase the latest tech gadgets and products with an intelligent, seamless shopping experience.

## 📋 Project Overview

TechTrio is a comprehensive e-commerce solution tailored for tech enthusiasts who crave innovation and cutting-edge products. Whether you're looking for the latest smartphones, laptops, accessories, or IoT devices, TechTrio delivers a smooth shopping experience powered by AI recommendations, secure payments, and blazing-fast performance.

**Why TechTrio?**
- 🤖 **AI-Powered Recommendations:** Get personalized tech product suggestions based on your preferences
- 🔍 **Vector-Based Smart Search:** Find exactly what you need with semantic product search
- ⚡ **Lightning-Fast Performance:** Redis caching ensures instant product loading
- 💳 **Secure Payments:** Stripe integration for safe, reliable transactions
- 🛡️ **Enterprise-Grade Security:** JWT authentication, encrypted passwords, and rate limiting
- 📱 **Tech-Focused Catalog:** Curated selection of gadgets, electronics, and tech accessories

**Problems Solved:**
- Personalized shopping experience through AI-driven recommendations
- Fast product discovery with semantic vector search
- Secure payment processing without data breaches
- High-performance platform that scales with your needs
- Real-time inventory management and caching
- Seamless checkout experience for tech enthusiasts

## 🛠️ Tech Stack

**Backend Architecture:**
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js 5.2.1
- **Database:** PostgreSQL
- **Cache Layer:** Redis (ioredis)
- **Vector Database:** Pinecone (AI-powered search)
- **AI Engine:** Google Generative AI

**Security & Authentication:**
- JWT (JSON Web Tokens)
- bcrypt for password hashing
- CORS enabled
- Express rate-limiting
- Secure password policies

**Integrations:**
- **Payments:** Stripe (PCI-DSS compliant)
- **Storage:** Cloudinary (optimized image delivery)
- **Email:** Nodemailer (order confirmations)
- **HTTP Client:** Axios

**Development Tools:**
- nodemon for live-reload development

## ✨ Key Features

- 🔐 **Secure Authentication:** JWT-based user authentication with encrypted passwords
- 💳 **Stripe Payment Integration:** Safe and secure payment processing
- 🤖 **AI-Powered Recommendations:** Personalized product suggestions using Google Generative AI
- 🔍 **Vector Search:** Semantic product search powered by Pinecone
- ⚡ **Redis Caching:** Optimized performance with intelligent caching strategies
- 📸 **Cloud Image Management:** Cloudinary integration for fast image delivery
- 📧 **Email Notifications:** Order confirmations and updates via Nodemailer
- 🛡️ **Rate Limiting:** Protection against abuse and DDoS attacks
- 📤 **File Uploads:** Easy product image and media uploads
- 🔑 **Enterprise Security:** Encrypted credentials and secure data handling

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (v12+)
- Redis instance
- External accounts for:
  - Stripe (payment processing)
  - Cloudinary (image hosting)
  - Google Cloud (AI features)
  - Pinecone (vector search)

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NazimRiyadh/TechTrio.git
   cd TechTrio
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables (see below)**

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
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/techtrio

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary Image Hosting
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Generative AI
GOOGLE_API_KEY=your_google_api_key

# Pinecone Vector Search
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name
PINECONE_ENVIRONMENT=your_environment

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Server Configuration
PORT=5000
NODE_ENV=development
```

## 📖 Usage Examples

### Starting the Server

**Development mode (with hot-reload):**
```bash
cd server
npm run dev
```

**Production mode:**
```bash
cd server
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

### Typical User Flow

1. **Create Account** → Register with email and password
2. **Browse Tech Products** → Search using AI-powered semantic search
3. **Get Recommendations** → Receive personalized tech suggestions
4. **Add to Cart** → Items cached in Redis for instant retrieval
5. **Secure Checkout** → Process payment via Stripe
6. **Order Confirmation** → Receive email confirmation

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/products` | Get all tech products |
| POST | `/api/products/search` | AI-powered product search |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/cart` | Add product to cart |
| GET | `/api/cart` | Get user's shopping cart |
| POST | `/api/payment/checkout` | Process Stripe payment |
| GET | `/api/orders` | Get user order history |
| POST | `/api/recommendations` | Get AI product recommendations |

*For complete API documentation, refer to the API docs included in the repository.*

## 📁 Project Structure

```
TechTrio/
├── server/
│   ├── package.json              # Dependencies & scripts
│   ├── server.js                 # Application entry point
│   ├── routes/                   # API route definitions
│   ├── controllers/              # Business logic
│   ├── models/                   # Database models
│   ├── middleware/               # Auth, validation, error handling
│   ├── config/                   # Configuration files
│   ├── utils/                    # Helper functions & utilities
│   ├── services/                 # External service integrations
│   └── .env                      # Environment variables (not committed)
├── client/                       # Frontend application (if applicable)
└── README.md                     # This file
```

## 🚢 Deployment

### Cloud Deployment Options

Deploy TechTrio on your preferred platform:
- **Heroku** - Traditional PaaS
- **Railway** - Modern alternatives
- **Render** - Developer-friendly hosting
- **AWS** - Enterprise-grade infrastructure
- **DigitalOcean** - Simple VPS deployment

### Deployment Steps

1. **Set environment variables** on your hosting platform
2. **Deploy the application:**
   ```bash
   git push heroku main
   ```
3. **Verify deployment:**
   ```bash
   curl https://your-app-url/api/health
   ```

### Docker Deployment

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

Build and run:
```bash
docker build -t techtrio .
docker run -p 5000:5000 --env-file .env techtrio
```

## ⚡ Performance Features

- **Redis Caching:** Reduces database load by 80%+
- **Vector Search:** Sub-second product discovery
- **CDN Integration:** Lightning-fast image delivery
- **Rate Limiting:** DDoS protection & API security
- **Connection Pooling:** Efficient resource management
- **Async Processing:** Non-blocking operations

## 🤝 Contributing

We welcome contributions from tech enthusiasts! Here's how:

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add AmazingFeature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙋 Support & Community

- **Issues:** Report bugs or request features via GitHub Issues
- **Discussions:** Join our community discussions
- **Email:** Contact the maintainers for support

---

**Built with ❤️ for Tech Enthusiasts by NazimRiyadh**

*TechTrio - Where Tech Enthusiasts Find Everything They Need*
