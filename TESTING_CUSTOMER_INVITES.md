# Testing Guide: Customer Invite System

## Prerequisites

1. MongoDB running
2. Server running on port 5000
3. Client running on port 5174 (storefront)
4. Valid JWT_SECRET in `.env`

## Step-by-Step Testing

### Step 1: Start the Server

```bash
cd server
npm install  # or pnpm install
npm run dev
```

Verify server logs show:
- MongoDB connected
- Server listening on port 5000
- All routes registered including `/api/invites` and `/api/customers/auth`

### Step 2: Start the Client

```bash
cd client
npm install  # or pnpm install
npm run dev
```

Client should start on port 5173 (dashboard) or 5174 (storefront)

### Step 3: Create/Login as a User

1. Navigate to `http://localhost:5173/loginpage`
2. Login with existing user or create new account at `/signup`
3. Verify you're logged in to the dashboard

### Step 4: Generate Invite Link

**Option A: Using Dashboard UI**
1. Navigate to `http://localhost:5173/dashboard/invites`
2. System should auto-generate an invite code
3. Copy the invite link (e.g., `http://localhost:5174/store/A1B2C3D4`)

**Option B: Using API**
```bash
# Get your auth token from localStorage after login
curl -X GET http://localhost:5000/api/invites/code \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

Expected Response:
```json
{
  "success": true,
  "inviteCode": "A1B2C3D4",
  "inviteLink": "http://localhost:5174/store/A1B2C3D4",
  "message": "Share this link with customers to invite them to your store"
}
```

### Step 5: Validate Invite Code (No Auth Required)

```bash
curl -X GET http://localhost:5000/api/invites/validate/A1B2C3D4
```

Expected Response:
```json
{
  "valid": true,
  "storeOwner": {
    "name": "John Doe",
    "businessName": "My Business",
    "email": "john@example.com"
  },
  "message": "You're invited to shop at My Business's store"
}
```

### Step 6: Customer Registration via Invite Link

**Option A: Using UI**
1. Open invite link in new browser/incognito window: `http://localhost:5174/store/A1B2C3D4`
2. System validates code and shows store owner info
3. Click "Get Started" or "Login / Sign Up"
4. Fill in registration form:
   - Name: Customer Name
   - Email: customer@example.com
   - Phone: +1234567890 (optional)
   - Password: password123 (min 6 chars)
5. Click "Sign Up"
6. Should see success message and products page

**Option B: Using API**
```bash
curl -X POST http://localhost:5000/api/customers/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "email": "customer@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "inviteCode": "A1B2C3D4"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "customer": {
    "id": "...",
    "name": "Test Customer",
    "email": "customer@example.com",
    "phone": "+1234567890",
    "invitedBy": "...",
    "isEmailVerified": false,
    "isActive": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "storeOwner": {
    "name": "John Doe",
    "businessName": "My Business"
  }
}
```

### Step 7: Customer Login

**Option A: Using UI**
1. Navigate to invite link if not already there
2. Switch to "Login" tab
3. Enter email and password
4. Click "Login"

**Option B: Using API**
```bash
curl -X POST http://localhost:5000/api/customers/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123"
  }'
```

### Step 8: View Customer Profile

```bash
curl -X GET http://localhost:5000/api/customers/auth/profile \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```

### Step 9: View Invited Customers (as User)

**Option A: Using Dashboard UI**
1. Login as user (not customer)
2. Navigate to `http://localhost:5173/dashboard/invites`
3. Should see table of invited customers
4. Should see statistics: total customers, orders, revenue, etc.

**Option B: Using API**
```bash
curl -X GET "http://localhost:5000/api/invites/customers?page=1&limit=10" \
  -H "Authorization: Bearer USER_TOKEN"
```

Expected Response:
```json
{
  "success": true,
  "customers": [
    {
      "_id": "...",
      "name": "Test Customer",
      "email": "customer@example.com",
      "phone": "+1234567890",
      "isActive": true,
      "isEmailVerified": false,
      "totalOrders": 0,
      "totalSpent": 0,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  },
  "stats": {
    "totalCustomers": 1,
    "totalOrders": 0,
    "totalRevenue": 0,
    "activeCustomers": 1,
    "verifiedCustomers": 0
  }
}
```

### Step 10: Test Error Cases

**Invalid Invite Code**
```bash
curl -X POST http://localhost:5000/api/customers/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "password": "password123",
    "inviteCode": "INVALID"
  }'
```
Expected: 400 error with message "Invalid invite code"

**Duplicate Email**
Try registering with same email twice - should get error

**Missing Fields**
Try registration without required fields - should get validation error

**Wrong Password on Login**
Should get "Invalid email or password"

## Database Verification

### Check Customer Collection
```javascript
// In MongoDB shell or Compass
use omnibiz  // or your database name

// View all customers
db.customers.find().pretty()

// View customers for specific user
db.customers.find({ invitedBy: ObjectId("USER_ID") }).pretty()

// Check invite codes
db.users.find({ inviteCode: { $exists: true } }, { name: 1, email: 1, inviteCode: 1 })
```

### Verify Relationships
```javascript
// Find a customer and populate invitedBy
db.customers.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "invitedBy",
      foreignField: "_id",
      as: "referringUser"
    }
  }
])
```

## Common Issues and Solutions

### Issue: "Invalid invite code" on valid code
**Solution:** Check that User model has inviteCode field and it's populated

### Issue: Customer can't login after registration
**Solution:** Verify Customer was created in customers collection, not users collection

### Issue: User sees no invited customers
**Solution:** Check invitedBy field is set correctly during registration

### Issue: Token errors
**Solution:** 
- Verify JWT_SECRET is set in .env
- Check token is being sent in Authorization header
- Ensure correct token is being used (customerToken for customers)

### Issue: CORS errors
**Solution:** Verify CORS is enabled in server.js and client URL is correct

## Success Criteria

✅ User can generate unique invite code
✅ Invite code validates correctly
✅ Customer can register with valid invite code
✅ Customer registration fails with invalid code
✅ Customer can login with credentials
✅ Customer and User tokens are separate
✅ User can view list of invited customers
✅ Customer data is linked to inviting user via `invitedBy`
✅ Email verification emails are sent
✅ Password reset flow works for customers
✅ Customer profile can be updated
✅ Statistics are calculated correctly

## Performance Testing

### Test Multiple Customers
Register 10-20 customers using the same invite code and verify:
- All appear in user's invited customers list
- Pagination works correctly
- Search functionality works
- Statistics are accurate

### Test Concurrent Access
- Multiple customers browsing same store simultaneously
- User viewing customers while new customer registers
- Verify no race conditions or data corruption

## Security Testing

### Test Token Separation
1. Login as customer, copy token
2. Try accessing user endpoints with customer token - should fail
3. Login as user, copy token
4. Try accessing customer endpoints with user token - should fail

### Test Authorization
1. Customer A tries to access Customer B's profile - should fail
2. User A tries to view User B's invited customers - should fail
3. Unauthenticated requests to protected endpoints - should fail

## Next Steps After Testing

1. Set up email service for verification emails
2. Implement shopping cart for customers
3. Create order management system
4. Add referral analytics
5. Implement reward system
6. Add customer portal for order history

---

## Quick Test Script

Save this as `test-invites.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:5000/api"

echo "1. Register a user..."
USER_RES=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "password123",
    "businessName": "Test Business"
  }')

USER_TOKEN=$(echo $USER_RES | jq -r '.token')
echo "User Token: $USER_TOKEN"

echo -e "\n2. Get invite code..."
INVITE_RES=$(curl -s -X GET $API_URL/invites/code \
  -H "Authorization: Bearer $USER_TOKEN")

INVITE_CODE=$(echo $INVITE_RES | jq -r '.inviteCode')
echo "Invite Code: $INVITE_CODE"

echo -e "\n3. Validate invite code..."
curl -s -X GET $API_URL/invites/validate/$INVITE_CODE | jq

echo -e "\n4. Register customer..."
CUSTOMER_RES=$(curl -s -X POST $API_URL/customers/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Customer\",
    \"email\": \"testcustomer@example.com\",
    \"password\": \"password123\",
    \"inviteCode\": \"$INVITE_CODE\"
  }")

CUSTOMER_TOKEN=$(echo $CUSTOMER_RES | jq -r '.token')
echo "Customer Token: $CUSTOMER_TOKEN"

echo -e "\n5. Get customer profile..."
curl -s -X GET $API_URL/customers/auth/profile \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" | jq

echo -e "\n6. View invited customers (as user)..."
curl -s -X GET $API_URL/invites/customers \
  -H "Authorization: Bearer $USER_TOKEN" | jq

echo -e "\n✅ All tests completed!"
```

Make executable and run:
```bash
chmod +x test-invites.sh
./test-invites.sh
```
