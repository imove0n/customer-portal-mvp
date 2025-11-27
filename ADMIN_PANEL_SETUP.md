# Admin Panel Setup Guide

## ✅ Completed Steps

### 1. Database Schema Updated
- Added `role` column to users table (default: 'customer')
- Roles: 'customer' and 'admin'

### 2. Admin User Created
**Admin Credentials:**
- Email: `admin@accupoint.ph`
- Phone: `+639999999999`
- Password: `admin123`

### 3. Backend API Endpoints Created

#### Admin-Only Endpoints (require admin role):

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/customers` | Get all customers |
| GET | `/api/admin/bookings` | Get all bookings with customer info |
| GET | `/api/admin/messages` | Get all messages across all bookings |
| GET | `/api/admin/stats` | Get dashboard statistics |
| POST | `/api/admin/bookings` | Create new booking |
| PUT | `/api/admin/bookings/:id` | Update booking |
| DELETE | `/api/admin/bookings/:id` | Delete booking |
| POST | `/api/admin/messages/:bookingId` | Send support message |

#### Features:
- ✅ Admin middleware checks user role
- ✅ Full CRUD for bookings
- ✅ View all customers
- ✅ View all messages
- ✅ Send support replies
- ✅ Dashboard statistics

## 📋 Next Steps (To Complete)

### Frontend Admin UI Pages to Create:

1. **Admin Login Redirect**
   - Modify login to redirect admins to `/admin` instead of `/dashboard`

2. **Admin Dashboard** (`/admin/page.tsx`)
   - Display statistics cards
   - Recent messages
   - Recent bookings

3. **Message Center** (`/admin/messages/page.tsx`)
   - List all customer messages
   - Reply interface
   - Filter by booking/customer

4. **Booking Management** (`/admin/bookings/page.tsx`)
   - List all bookings
   - Create/Edit/Delete bookings
   - Filter and search

5. **Customer Management** (`/admin/customers/page.tsx`)
   - List all customers
   - View customer details
   - View customer booking history

## 🚀 Quick Start

### 1. Restart Backend Server
The backend needs to be restarted to load the new admin endpoints:

```bash
# Stop the current backend server (Ctrl+C)
cd backend
npm start
```

### 2. Test Admin API

Login as admin:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@accupoint.ph","phone":"+639999999999","password":"admin123"}'
```

Get dashboard stats (replace TOKEN with the token from login):
```bash
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer TOKEN"
```

### 3. Access Frontend (Once UI is Built)
```
Admin Panel: http://localhost:3000/admin
Admin Login: Use credentials above
```

## 📊 Admin Panel Features

### Dashboard
- Total customers count
- Total bookings count
- Total messages count
- Pending bookings count

### Message Center
- View all customer messages
- Reply to customers as support
- See booking context
- Real-time updates

### Booking Management
- View all bookings
- Create new bookings for customers
- Edit booking details
- Delete bookings
- Assign to customers

### Customer Management
- View all registered customers
- See customer details
- View booking history per customer

## 🔐 Security

- Admin routes protected by JWT + role check
- Only users with `role='admin'` can access admin endpoints
- Customer users cannot access admin panel
- Separate authentication flow

## 🗂️ Project Structure

```
customer-portal-mvp/
├── backend/
│   ├── server.js (✅ Updated with admin routes)
│   ├── database.js (✅ Updated with role column)
│   ├── create-admin.js (✅ Script to create admin user)
│   └── migrate-add-role.js (✅ Database migration)
│
└── frontend/
    └── app/
        ├── admin/ (🔲 To be created)
        │   ├── page.tsx (Dashboard)
        │   ├── messages/page.tsx (Message Center)
        │   ├── bookings/page.tsx (Booking Management)
        │   └── customers/page.tsx (Customer Management)
        │
        └── ... (existing customer pages)
```

## Current Status

✅ Database: Admin role support added
✅ Backend: All admin API endpoints created
✅ Admin User: Created and ready to use
🔲 Frontend: Admin UI pages (next step)
🔲 Testing: Full integration testing

The backend is fully ready. Next step is to create the frontend admin UI pages.
