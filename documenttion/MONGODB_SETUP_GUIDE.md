# MongoDB Setup Guide - Fix Login Issue

## 🔴 Problem
MongoDB is NOT installed on your system, causing login to fail with timeout errors.

---

## ✅ Solution: Use MongoDB Atlas (FREE Cloud Database)

### Why MongoDB Atlas?
- ✅ Free forever (512MB storage)
- ✅ No installation needed
- ✅ Works instantly
- ✅ Automatic backups
- ✅ Better than local MongoDB for development

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Free MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/GitHub/Email
3. Choose **FREE** tier (M0)

### Step 2: Create a Cluster
1. After signup, click **"Build a Database"**
2. Choose **"FREE"** (M0 Shared)
3. Select a cloud provider (AWS recommended)
4. Choose region closest to you (e.g., AWS / Africa (Cape Town))
5. Cluster Name: `omnibiz-cluster` (or any name)
6. Click **"Create"**

### Step 3: Create Database User
1. You'll see "Security Quickstart"
2. **Username**: `omnibiz_admin` (or any name)
3. **Password**: Generate or create a strong password
4. ⚠️ **SAVE THIS PASSWORD!** You'll need it
5. Click **"Create User"**

### Step 4: Add IP Address
1. Next screen: "Where would you like to connect from?"
2. Choose **"My Local Environment"**
3. Click **"Add My Current IP Address"**
4. Or add `0.0.0.0/0` to allow from anywhere (less secure but easier for dev)
5. Click **"Add Entry"**
6. Click **"Finish and Close"**

### Step 5: Get Connection String
1. Click **"Connect"** on your cluster
2. Choose **"Drivers"**
3. Select **"Node.js"** driver
4. Copy the connection string (looks like):
   ```
   mongodb+srv://omnibiz_admin:<password>@omnibiz-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Replace `<password>`** with your actual password
6. Add database name at the end: `/omnibiz`

**Final connection string:**
```
mongodb+srv://omnibiz_admin:YOUR_PASSWORD@omnibiz-cluster.xxxxx.mongodb.net/omnibiz?retryWrites=true&w=majority
```

---

## 📝 Update Your .env File

### Open .env:
```bash
nano /home/glorison/projects/omnibiz/server/.env
```

### Update MONGO_URI:
```bash
# OLD (won't work without local MongoDB)
MONGO_URI=mongodb://localhost:27017/omnibiz

# NEW (MongoDB Atlas - replace with YOUR connection string)
MONGO_URI=mongodb+srv://omnibiz_admin:YOUR_PASSWORD@omnibiz-cluster.xxxxx.mongodb.net/omnibiz?retryWrites=true&w=majority
```

### Save and Exit:
- Press `Ctrl + O` (save)
- Press `Enter`
- Press `Ctrl + X` (exit)

---

## 🎯 Start Server

```bash
cd /home/glorison/projects/omnibiz/server
pnpm run dev
```

**Expected Output:**
```
✅ Connected to MongoDB
✅ Gemini AI service initialized
🚀 Server is running on port 5000
```

---

## 🧪 Test Login

1. Go to: http://localhost:5173/login
2. Register new user or login
3. Should work without timeout! ✅

---

## 🔐 Security Tips

### Production .env (with Atlas):
```bash
# MongoDB Atlas (RECOMMENDED)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/omnibiz?retryWrites=true&w=majority

# JWT Secret (generate new one)
JWT_SECRET=your_very_secure_random_secret_key_here

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Email (Gmail)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

### Generate Secure JWT Secret:
```bash
openssl rand -base64 64
```

---

## 🆚 MongoDB Atlas vs Local MongoDB

| Feature | MongoDB Atlas | Local MongoDB |
|---------|---------------|---------------|
| **Setup** | 5 minutes | 30+ minutes |
| **Installation** | None | Required |
| **Maintenance** | Automatic | Manual |
| **Backups** | Automatic | Manual |
| **Cost (Free Tier)** | 512MB forever | Disk space |
| **Speed** | Fast (cloud) | Very fast (local) |
| **Recommended For** | Development & Production | Advanced users |

**For your use case:** MongoDB Atlas is PERFECT! ✅

---

## 📋 Quick Reference

### MongoDB Atlas Dashboard
- URL: https://cloud.mongodb.com
- View data: Database → Browse Collections
- Monitor: Database → Metrics
- Manage users: Database Access
- IP whitelist: Network Access

### Connection String Format
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

### Common Issues

**Issue 1: "Authentication failed"**
- Check username and password are correct
- Make sure password doesn't have special characters (or URL encode them)

**Issue 2: "No IP address"**
- Add `0.0.0.0/0` to IP whitelist (Network Access)

**Issue 3: "Network timeout"**
- Check your internet connection
- Verify cluster is running (should be green in dashboard)

---

## 🎓 After MongoDB is Connected

### 1. Create First User
```bash
# Use Register page or MongoDB Compass
# Or use Postman to POST to /api/auth/register
```

### 2. View Database
- Go to MongoDB Atlas Dashboard
- Click "Browse Collections"
- See your data in real-time!

### 3. Seed Data (Optional)
```bash
# Seed FAQs
node /home/glorison/projects/omnibiz/server/seeders/seedFAQs.js
```

---

## 🚀 Alternative: Install Local MongoDB (Advanced)

### Ubuntu/Debian:
```bash
# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
sudo systemctl status mongod
```

**But honestly, MongoDB Atlas is easier!** 😊

---

## ✅ Final Checklist

- [ ] Created MongoDB Atlas account
- [ ] Created free cluster
- [ ] Created database user
- [ ] Added IP to whitelist
- [ ] Copied connection string
- [ ] Replaced password in connection string
- [ ] Updated MONGO_URI in .env
- [ ] Restarted server
- [ ] Tested login - SUCCESS! ✅

---

## 🎉 Next Steps After MongoDB Works

1. ✅ Login/Register works
2. ✅ Test all features
3. ✅ Create products
4. ✅ Create orders
5. ✅ Test AI chatbot (FloatingAI)
6. ✅ Use support system

---

**Document Created**: October 17, 2025  
**Issue**: MongoDB not installed  
**Solution**: Use MongoDB Atlas (FREE)  
**Time to Fix**: 5 minutes  
**Status**: Ready to implement
