# Customer Invite System Documentation

## Overview

The Customer Invite System allows customers to register and authenticate separately from business users when accessing a client storefront via invite links. The system maintains complete separation between User authentication (for business owners) and Customer authentication (for shoppers).

**Note:** Invite link generation is handled separately by the user. This implementation focuses only on customer authentication.

## Architecture

### Backend Components

#### 1. Models

**Customer Model** (`server/models/customer.js`)
- Separate from User model
- Fields:
  - `name`, `email`, `phone`, `password` - Basic customer info
  - `invitedBy` (ref: User) - Links customer to referring user
  - `usedInviteCode` - The invite code used during registration
  - `address` - Customer shipping/billing address
  - `preferences` - Newsletter and notification preferences
  - `isActive`, `isEmailVerified` - Account status
  - `totalOrders`, `totalSpent` - Shopping history
  - Password reset and email verification tokens

**User Model Enhancement** (`server/models/user.js`)
- Already contains `inviteCode` field for generating invite links

#### 2. Controllers

**CustomerAuthController** (`server/controllers/customerAuthController.js`)
- `registerCustomer` - Register new customer with invite code validation
- `loginCustomer` - Customer login (separate from user login)
- `getCustomerProfile` - Get customer profile
- `updateCustomerProfile` - Update customer profile
- `verifyEmail` - Email verification
- `forgotPassword` / `resetPassword` - Password recovery
- `changePassword` - Change password for authenticated customers


#### 3. Middlewares

**CustomerAuthMiddleware** (`server/middlewares/customerAuthMiddleware.js`)
- `protectCustomer` - Verify customer JWT token
- `optionalCustomerAuth` - Optional customer authentication

**Note:** Completely separate from `authMiddleware.js` which handles User authentication

#### 4. Routes

**Customer Auth Routes** (`server/routes/customerAuthRoutes.js`)
- `POST /api/customers/auth/register` - Customer registration
- `POST /api/customers/auth/login` - Customer login
- `GET /api/customers/auth/profile` - Get customer profile (protected)
- `PUT /api/customers/auth/profile` - Update profile (protected)
- `PUT /api/customers/auth/change-password` - Change password (protected)
- `POST /api/customers/auth/forgot-password` - Request password reset
- `POST /api/customers/auth/reset-password` - Reset password
- `GET /api/customers/auth/verify-email/:token` - Verify email


### Frontend Components

#### 1. Context

**CustomerAuthContext** (`client/src/context/CustomerAuthContext.jsx`)
- Manages customer authentication state
- Stores customer token in `localStorage.customerToken`
- Functions: `login`, `register`, `logout`, `updateProfile`, `checkAuth`
- Completely separate from `AuthContext` which handles User authentication

#### 2. Pages

**ClientSignup** (`client/src/pages/client/ClientSignup.jsx`)
- Customer registration page accessed via `/client/signup/:inviteCode`
- Integrated with CustomerAuthContext
- Validates invite code presence
- Features:
  - Customer registration form
  - Password visibility toggle
  - Links to login page

**ClientLogin** (`client/src/pages/client/ClientLogin.jsx`)
- Customer login page
- Integrated with CustomerAuthContext
- Redirects to storefront after successful login

**ClientStorefront** (`client/src/pages/client/ClientStorefront.jsx`)
- Main customer-facing store page at `/client/store/:inviteCode`
- Uses CustomerAuthContext for authentication
- Features:
  - Product browsing with real-time updates
  - Shopping cart
  - Services booking
  - Order history
  - Customer account management
  - Theme customization

#### 3. API Functions

**Customer API** (`client/src/lib/api.js`)
```javascript
customerAPI.register(customerData)
customerAPI.login(credentials)
customerAPI.getProfile()
customerAPI.updateProfile(profileData)
customerAPI.changePassword(passwordData)
customerAPI.forgotPassword(email)
customerAPI.resetPassword(data)
customerAPI.verifyEmail(token)
```


## Token Management

### Separation of Concerns

1. **User Tokens** - Stored in `localStorage.token`
   - Used for User authentication
   - Format: `{ id: userId }`
   - Protected by `authMiddleware.protect`

2. **Customer Tokens** - Stored in `localStorage.customerToken`
   - Used for Customer authentication
   - Format: `{ id: customerId, type: 'customer' }`
   - Protected by `customerAuthMiddleware.protectCustomer`

### API Interceptor

The API client automatically uses the correct token based on the request URL:
- Customer API requests (`/customers/auth/*`) use `customerToken`
- All other requests use regular `token`

## User Flow

### For Users (Business Owners)

1. User generates invite links (handled outside this system)
2. Share invite link with customers (e.g., `http://localhost:5174/client/store/ABC12345`)

### For Customers

1. Click on invite link (e.g., `/client/signup/ABC12345`)
2. Fill in registration form with name, email, phone, password, and invite code
3. System registers customer and links them to the referring user via `invitedBy` field
4. Customer receives email verification link
5. After authentication, customer can browse products and shop at `/client/store/:inviteCode`
6. Customer can login anytime at `/client/login/:inviteCode`

## Security Features

1. **Token Type Validation** - Customer tokens include `type: 'customer'` field
2. **Separate Sessions** - Users and Customers maintain independent sessions
3. **Invite Code Validation** - Only valid invite codes allow registration
4. **Email Verification** - Customers receive verification emails
5. **Password Security** - bcrypt hashing, minimum 6 characters
6. **Token Expiration** - Customers: 30 days, Users: 7 days

## Database Indexes

Customer model includes indexes for:
- `{ invitedBy: 1, email: 1 }` - Efficient customer lookups by user
- `{ usedInviteCode: 1 }` - Fast invite code validation

## Environment Variables

Required in `.env`:
```
CLIENT_URL=http://localhost:5174
JWT_SECRET=your-secret-key
```

## Routes Summary

### Backend Routes
- `/api/customers/auth/*` - Customer authentication

### Frontend Routes
- `/client/signup/:inviteCode` - Customer registration page
- `/client/login/:inviteCode` - Customer login page  
- `/client/store/:inviteCode` - Customer storefront

## Testing the Implementation

### 1. Generate Invite Link
```bash
# Login as a user, then:
GET /api/invites/code
```

### 2. Validate Invite Code
```bash
GET /api/invites/validate/ABC12345
```

### 3. Register Customer
```bash
POST /api/customers/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "inviteCode": "ABC12345"
}
```

### 4. Customer Login
```bash
POST /api/customers/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### 5. View Invited Customers (as User)
```bash
GET /api/invites/customers?page=1&limit=10
```

## Future Enhancements

1. **Shopping Cart** - Integrate with cart system for customers
2. **Order Management** - Link customer orders to referring user
3. **Referral Rewards** - Implement reward system for users who invite customers
4. **Customer Portal** - Dedicated customer dashboard for order history
5. **Analytics** - Detailed conversion tracking for invite links
6. **Social Sharing** - One-click sharing to social media platforms
7. **Custom Store Branding** - Allow users to customize their store appearance
8. **Multi-tier Invites** - Customers can become affiliates and invite others

## Troubleshooting

### Issue: Invite code validation fails
- Check that User model has `inviteCode` field
- Verify invite code exists in database
- Ensure route is accessible (no auth middleware on public routes)

### Issue: Customer can't login
- Verify customer was created in Customer collection (not User)
- Check that customerToken is being used
- Confirm JWT_SECRET is consistent

### Issue: User can't see invited customers
- Verify `invitedBy` field is set correctly during customer registration
- Check that user is authenticated with valid user token
- Ensure Customer model has proper indexes

## API Response Examples

### Successful Customer Registration
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "customer": {
    "id": "607f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "invitedBy": "507f1f77bcf86cd799439011",
    "isEmailVerified": false,
    "isActive": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "storeOwner": {
    "name": "Store Owner",
    "businessName": "My Business"
  }
}
```

### Get Invited Customers Stats
```json
{
  "success": true,
  "customers": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  },
  "stats": {
    "totalCustomers": 50,
    "totalOrders": 234,
    "totalRevenue": 45678.50,
    "activeCustomers": 45,
    "verifiedCustomers": 38
  }
}
```

## Conclusion

The Customer Invite System provides a complete, secure, and scalable solution for user-to-customer relationships. The system maintains strict separation between User and Customer domains while providing seamless integration with the existing e-commerce platform.
