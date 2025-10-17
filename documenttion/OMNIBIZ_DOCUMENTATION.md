# OmniBiz Business Management Platform - Technical Documentation

**Version:** 2.0
**Last Updated:** October 16, 2025
**Document Type:** Technical Specification & User Guide

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Core Features](#core-features)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Subscription Tiers](#subscription-tiers)
6. [Technical Stack](#technical-stack)
7. [API Documentation](#api-documentation)
8. [Database Schema](#database-schema)
9. [Security Implementation](#security-implementation)
10. [Installation Guide](#installation-guide)

---

## 1. System Overview

### 1.1 Introduction

OmniBiz is a comprehensive business management platform designed to streamline operations for businesses of all sizes. The platform integrates inventory management, e-commerce, financial tracking, team collaboration, and AI-powered insights into a unified system.

### 1.2 Key Objectives

- Centralize business operations
- Provide real-time analytics and insights
- Enable efficient team collaboration
- Automate routine business processes
- Ensure data security and compliance

### 1.3 Target Users

| User Type | Description | Primary Use Cases |
|-----------|-------------|-------------------|
| Business Owners | Decision makers | Strategic planning, overview monitoring |
| Managers | Department heads | Team management, resource allocation |
| Staff | Operations team | Daily operations, data entry |
| Clients | Invited users | Limited access, view-only permissions |

---

## 2. Architecture

### 2.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   React UI   │  │   PWA App    │  │ Mobile View  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     API GATEWAY LAYER                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Authentication │ Rate Limiting │ Request Validation       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │ Inventory│ │ Orders │ │Financials│ │Analytics│         │
│  │ Service  │ │Service │ │ Service  │ │ Service │         │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   MongoDB    │  │    Redis     │  │  File Store  │    │
│  │  (Primary)   │  │   (Cache)    │  │   (Media)    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Component Interaction Flow

```
User Request
     │
     ▼
[Authentication Middleware]
     │
     ▼
[Authorization Check]
     │
     ▼
[Business Logic Layer]
     │
     ├─► [Database Query]
     │         │
     │         ▼
     │   [Data Validation]
     │         │
     │         ▼
     │   [Response Format]
     │
     ▼
[API Response to Client]
```

---

## 3. Core Features

### 3.1 Dashboard Module

**Purpose:** Centralized overview of business metrics and KPIs

**Key Components:**
- Real-time order statistics
- Inventory status overview
- Financial summary cards
- Recent activities feed
- Quick action buttons
- Performance charts

**Data Refresh Rate:** Real-time via WebSocket connection

### 3.2 Inventory Management

**Capabilities:**

| Feature | Description | Access Level |
|---------|-------------|--------------|
| Product Management | Add, edit, delete products | Standard+ |
| Stock Tracking | Real-time stock levels | All tiers |
| Low Stock Alerts | Automated notifications | Professional+ |
| Barcode Scanning | Product identification | Professional+ |
| Supplier Management | Track suppliers and orders | Professional+ |
| Batch Operations | Bulk product updates | Premium+ |

**Inventory Workflow:**

```
Product Creation
     │
     ▼
Stock Assignment
     │
     ▼
Price Configuration
     │
     ▼
Category Assignment
     │
     ▼
Publish to Store
     │
     ▼
Real-time Sync
```

### 3.3 Order Processing

**Order Lifecycle:**

```
┌──────────────┐
│  New Order   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Processing  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Payment    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Shipping   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Delivered   │
└──────────────┘
```

### 3.4 Financial Management (Wallet)

**Payment Gateways Integrated:**

| Gateway | Type | Transaction Fee | Settlement Time |
|---------|------|-----------------|-----------------|
| M-Pesa | Mobile Money | 1.5% | Instant |
| Airtel Money | Mobile Money | 1.5% | Instant |
| PayPal | Digital Wallet | 2.9% + $0.30 | 1-2 days |
| Stripe | Card Processing | 2.9% + $0.30 | 2-7 days |
| Bank Transfer | Direct | Free | 1-3 days |

**Wallet Features:**
- Transaction history
- Payment processing
- Invoice generation
- Expense tracking
- Financial reporting
- Budget management
- Multi-currency support

### 3.5 Analytics & Reporting

**Available Reports:**

| Report Type | Frequency | Format | Access Level |
|-------------|-----------|--------|--------------|
| Sales Summary | Daily/Weekly/Monthly | PDF/Excel | Standard+ |
| Inventory Report | Weekly | PDF/Excel | Standard+ |
| Financial Statement | Monthly | PDF | Professional+ |
| Customer Analytics | Monthly | Dashboard | Professional+ |
| Predictive Insights | Weekly | Dashboard | Premium+ |

**Analytics Metrics:**
- Revenue trends
- Top-selling products
- Customer demographics
- Inventory turnover
- Profit margins
- Sales forecasting

### 3.6 AI Integration

**AI Capabilities:**

```
┌─────────────────────────────────────────┐
│          AI Assistant Features          │
├─────────────────────────────────────────┤
│                                         │
│  Context-Aware Responses                │
│         │                               │
│         ▼                               │
│  Natural Language Processing            │
│         │                               │
│         ▼                               │
│  Learning from Interactions             │
│         │                               │
│         ▼                               │
│  Personalized Recommendations           │
│         │                               │
│         ▼                               │
│  Predictive Analytics                   │
│                                         │
└─────────────────────────────────────────┘
```

**AI Learning System:**
- Stores last 100 user interactions
- Tracks query frequency
- Pattern recognition
- Personalized responses
- Context retention

---

## 4. User Roles & Permissions

### 4.1 Role Hierarchy

```
┌──────────────────┐
│  Super Admin     │  Full system access
└────────┬─────────┘
         │
    ┌────▼────┐
    │  Admin  │  Business owner access
    └────┬────┘
         │
    ┌────▼────┐
    │ Manager │  Department management
    └────┬────┘
         │
    ┌────▼────┐
    │  Staff  │  Operational access
    └────┬────┘
         │
    ┌────▼────┐
    │ Client  │  Read-only access
    └─────────┘
```

### 4.2 Permission Matrix

| Feature | Client | Staff | Manager | Admin |
|---------|--------|-------|---------|-------|
| View Dashboard | Yes | Yes | Yes | Yes |
| View Products | Limited | Yes | Yes | Yes |
| Add Products | No | Yes | Yes | Yes |
| Edit Products | No | Yes | Yes | Yes |
| Delete Products | No | No | Yes | Yes |
| View Orders | No | Yes | Yes | Yes |
| Process Orders | No | Yes | Yes | Yes |
| Cancel Orders | No | No | Yes | Yes |
| View Finances | No | No | Yes | Yes |
| Manage Wallet | No | No | Yes | Yes |
| View Team | No | No | Yes | Yes |
| Manage Team | No | No | No | Yes |
| System Settings | No | No | No | Yes |
| User Management | No | No | No | Yes |

---

## 5. Subscription Tiers

### 5.1 Tier Comparison Table

| Feature | Client | Standard | Professional | Premium | Enterprise |
|---------|--------|----------|--------------|---------|------------|
| **Price** | Free | Free | $29/month | $49/month | Custom |
| **Products** | 10 | 100 | Unlimited | Unlimited | Unlimited |
| **Orders** | 50 | 500 | Unlimited | Unlimited | Unlimited |
| **Team Members** | 0 | 5 | Unlimited | Unlimited | Unlimited |
| **Storage** | 500MB | 5GB | 100GB | Unlimited | Unlimited |
| **API Calls** | 0 | 1,000/mo | 10,000/mo | Unlimited | Unlimited |
| **Locations** | 1 | 1 | 5 | Unlimited | Unlimited |
| **Analytics** | No | Basic | Advanced | Advanced | Advanced |
| **AI Features** | No | No | Yes | Yes | Yes |
| **Custom Reports** | No | No | Yes | Yes | Yes |
| **Priority Support** | No | No | Yes | Yes | Yes |
| **API Access** | No | Limited | Yes | Yes | Yes |
| **White Label** | No | No | No | Yes | Yes |
| **SLA Guarantee** | No | No | No | No | Yes |

### 5.2 Feature Access Control

```
Client Tier
    │
    ├── Dashboard (View Only)
    ├── Limited Product View (10 items)
    └── Email Support

Standard Tier
    │
    ├── All Client Features
    ├── Inventory Management (100 products)
    ├── Order Processing (500 orders)
    ├── Basic Analytics
    ├── Team Management (5 members)
    └── Email Support

Professional Tier
    │
    ├── All Standard Features
    ├── Unlimited Products & Orders
    ├── Advanced Analytics
    ├── AI Insights & Chat
    ├── Multi-location Support
    ├── API Access
    ├── Payment Gateway Integration
    ├── Custom Reports
    └── Priority Support

Premium Tier
    │
    ├── All Professional Features
    ├── Unlimited Everything
    ├── Developer Tools
    ├── White-label Options
    ├── Custom Branding
    └── 24/7 Support

Enterprise Tier
    │
    ├── All Premium Features
    ├── Dedicated Account Manager
    ├── On-premise Deployment
    ├── Custom Development
    ├── SLA Guarantee
    └── Phone Support
```

---

## 6. Technical Stack

### 6.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Framework |
| Vite | 5.x | Build Tool |
| TailwindCSS | 3.x | Styling |
| Shadcn/UI | Latest | Component Library |
| Lucide React | Latest | Icons |
| React Router | 6.x | Routing |
| Socket.io Client | 4.x | Real-time Communication |

### 6.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.x+ | Runtime Environment |
| Express | 4.x | Web Framework |
| MongoDB | 6.x | Primary Database |
| Redis | 7.x | Caching Layer |
| JWT | Latest | Authentication |
| Passport.js | Latest | OAuth Integration |

### 6.3 Development Tools

| Tool | Purpose |
|------|---------|
| Git | Version Control |
| ESLint | Code Linting |
| Prettier | Code Formatting |
| Jest | Unit Testing |
| Playwright | E2E Testing |

---

## 7. API Documentation

### 7.1 Authentication Endpoints

```
POST /api/auth/register
Request Body:
{
  "name": "string",
  "email": "string",
  "password": "string",
  "businessName": "string",
  "phone": "string",
  "role": "string"
}

Response:
{
  "success": true,
  "token": "jwt_token",
  "user": { user_object }
}
```

```
POST /api/auth/login
Request Body:
{
  "email": "string",
  "password": "string"
}

Response:
{
  "success": true,
  "token": "jwt_token",
  "user": { user_object }
}
```

```
POST /api/auth/forgot-password
Request Body:
{
  "email": "string"
}

Response:
{
  "success": true,
  "message": "Password reset link sent"
}
```

### 7.2 Product Endpoints

```
GET /api/products
Query Parameters:
- page: number
- limit: number
- category: string
- search: string

Response:
{
  "products": [product_array],
  "total": number,
  "page": number,
  "pages": number
}
```

```
POST /api/products
Request Body:
{
  "name": "string",
  "description": "string",
  "price": number,
  "stock": number,
  "category": "string",
  "images": [string_array]
}

Response:
{
  "success": true,
  "product": { product_object }
}
```

### 7.3 Order Endpoints

```
GET /api/orders
Query Parameters:
- status: string
- page: number
- limit: number

Response:
{
  "orders": [order_array],
  "total": number
}
```

```
POST /api/orders
Request Body:
{
  "products": [
    {
      "productId": "string",
      "quantity": number
    }
  ],
  "customer": { customer_object },
  "paymentMethod": "string"
}

Response:
{
  "success": true,
  "order": { order_object }
}
```

### 7.4 Wallet Endpoints

```
GET /api/wallet/balance
Response:
{
  "balance": number,
  "currency": "string"
}
```

```
POST /api/wallet/transaction
Request Body:
{
  "amount": number,
  "type": "credit" | "debit",
  "description": "string",
  "category": "string"
}

Response:
{
  "success": true,
  "transaction": { transaction_object }
}
```

### 7.5 Subscription Endpoints

```
GET /api/subscriptions/current
Response:
{
  "subscription": {
    "plan": "string",
    "status": "string",
    "startDate": "date",
    "nextBilling": "date"
  }
}
```

```
POST /api/subscriptions/subscribe
Request Body:
{
  "planId": "string",
  "isAnnual": boolean,
  "paymentMethod": { payment_details }
}

Response:
{
  "success": true,
  "subscription": { subscription_object }
}
```

---

## 8. Database Schema

### 8.1 Users Collection

```javascript
{
  "_id": ObjectId,
  "name": String,
  "email": String (unique, indexed),
  "password": String (hashed),
  "businessName": String,
  "phone": String,
  "role": String (enum: ['client', 'staff', 'manager', 'admin']),
  "subscriptionTier": String,
  "profilePicture": String,
  "googleId": String,
  "githubId": String,
  "createdAt": Date,
  "updatedAt": Date
}
```

### 8.2 Products Collection

```javascript
{
  "_id": ObjectId,
  "name": String (indexed),
  "description": String,
  "price": Number,
  "cost": Number,
  "stock": Number,
  "category": String (indexed),
  "images": [String],
  "barcode": String,
  "sku": String (unique),
  "supplier": ObjectId (ref: 'Supplier'),
  "status": String (enum: ['active', 'inactive', 'out_of_stock']),
  "userId": ObjectId (ref: 'User'),
  "createdAt": Date,
  "updatedAt": Date
}
```

### 8.3 Orders Collection

```javascript
{
  "_id": ObjectId,
  "orderNumber": String (unique, indexed),
  "customer": {
    "name": String,
    "email": String,
    "phone": String,
    "address": String
  },
  "products": [{
    "productId": ObjectId (ref: 'Product'),
    "name": String,
    "quantity": Number,
    "price": Number,
    "subtotal": Number
  }],
  "totalAmount": Number,
  "status": String (enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  "paymentMethod": String,
  "paymentStatus": String,
  "userId": ObjectId (ref: 'User'),
  "createdAt": Date,
  "updatedAt": Date
}
```

### 8.4 Transactions Collection

```javascript
{
  "_id": ObjectId,
  "transactionId": String (unique, indexed),
  "userId": ObjectId (ref: 'User'),
  "amount": Number,
  "type": String (enum: ['credit', 'debit']),
  "category": String,
  "description": String,
  "paymentMethod": String,
  "status": String,
  "orderId": ObjectId (ref: 'Order'),
  "createdAt": Date
}
```

### 8.5 Subscriptions Collection

```javascript
{
  "_id": ObjectId,
  "userId": ObjectId (ref: 'User', unique),
  "plan": String (enum: ['client', 'standard', 'professional', 'premium', 'enterprise']),
  "status": String (enum: ['active', 'cancelled', 'expired', 'trial']),
  "startDate": Date,
  "endDate": Date,
  "nextBilling": Date,
  "billingCycle": String (enum: ['monthly', 'annual']),
  "amount": Number,
  "paymentMethod": Object,
  "features": [String],
  "limits": Object,
  "createdAt": Date,
  "updatedAt": Date
}
```

---

## 9. Security Implementation

### 9.1 Authentication Flow

```
User Login Request
     │
     ▼
Credentials Validation
     │
     ├─► Invalid ──► Error Response
     │
     ▼ Valid
Password Hash Verification
     │
     ▼
Generate JWT Token
     │
     ▼
Return Token + User Data
     │
     ▼
Client Stores Token
     │
     ▼
Subsequent Requests Include Token
     │
     ▼
Server Validates Token
     │
     ├─► Invalid/Expired ──► 401 Response
     │
     ▼ Valid
Process Request
```

### 9.2 Security Measures

| Measure | Implementation | Purpose |
|---------|----------------|---------|
| Password Hashing | bcrypt (10 rounds) | Secure password storage |
| JWT Tokens | 7-day expiration | Stateless authentication |
| HTTPS | SSL/TLS encryption | Secure data transmission |
| Input Validation | Express Validator | Prevent injection attacks |
| Rate Limiting | 100 requests/15min | DDoS protection |
| CORS | Whitelist domains | Cross-origin security |
| SQL Injection | Parameterized queries | Database security |
| XSS Protection | Content sanitization | Prevent script injection |

### 9.3 Data Protection

**Encryption Standards:**
- Data at rest: AES-256 encryption
- Data in transit: TLS 1.3
- Database: MongoDB encryption
- File storage: Encrypted S3 buckets

**Access Control:**
- Role-based access control (RBAC)
- Subscription-based feature gating
- IP whitelisting for admin access
- Two-factor authentication (optional)

---

## 10. Installation Guide

### 10.1 Prerequisites

**System Requirements:**
- Node.js 18.x or higher
- MongoDB 6.x or higher
- Redis 7.x or higher
- 4GB RAM minimum
- 10GB free disk space

**Development Tools:**
- Git
- npm or yarn
- Code editor (VS Code recommended)

### 10.2 Backend Setup

```bash
# Clone repository
git clone https://github.com/your-repo/omnibiz.git
cd omnibiz/server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB and Redis
mongod --dbpath /data/db
redis-server

# Run database migrations
npm run migrate

# Start development server
npm run dev

# Production build
npm run build
npm start
```

### 10.3 Frontend Setup

```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Production build
npm run build
npm run preview
```

### 10.4 Environment Variables

**Backend (.env):**
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/omnibiz
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Payment Gateways
STRIPE_SECRET_KEY=your_stripe_key
PAYPAL_CLIENT_ID=your_paypal_id
MPESA_CONSUMER_KEY=your_mpesa_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_ENABLE_PWA=true
```

### 10.5 Deployment

**Production Checklist:**
- [ ] Environment variables configured
- [ ] Database backup system in place
- [ ] SSL certificates installed
- [ ] CDN configured for static assets
- [ ] Monitoring tools configured
- [ ] Error logging enabled
- [ ] Rate limiting configured
- [ ] Security headers set
- [ ] Database indexes optimized
- [ ] Redis cache configured

**Deployment Platforms:**
- Frontend: Vercel, Netlify, AWS S3
- Backend: AWS EC2, DigitalOcean, Heroku
- Database: MongoDB Atlas, AWS DocumentDB
- Cache: Redis Cloud, AWS ElastiCache

---

## Appendix A: API Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Server maintenance |

---

## Appendix B: Support & Maintenance

**Support Channels:**
- Email: support@omnibiz.com
- Phone: +254 700 000 000
- Documentation: https://docs.omnibiz.com
- Community: https://community.omnibiz.com

**Maintenance Schedule:**
- Database backup: Daily at 2:00 AM UTC
- System updates: Weekly on Sundays
- Security patches: As needed
- Feature releases: Monthly

---

**Document Prepared By:** OmniBiz Technical Team
**Review Date:** Monthly
**Next Review:** November 16, 2025

---

END OF DOCUMENT
