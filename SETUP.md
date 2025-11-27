# Quick Setup Guide

Follow these steps to get the Customer Portal running in under 5 minutes.

## Step 1: Install Dependencies

Open two terminal windows.

**Terminal 1 - Backend:**
```bash
cd customer-portal-mvp/backend
npm install
```

**Terminal 2 - Frontend:**
```bash
cd customer-portal-mvp/frontend
npm install
```

## Step 2: Start the Servers

**Terminal 1 - Backend:**
```bash
npm run dev
```
✅ Backend should start on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
✅ Frontend should start on `http://localhost:3000`

## Step 3: Open the Application

1. Open browser to: `http://localhost:3000`
2. Login with:
   - **Email**: `demo@customer.com`
   - **Phone**: `+1234567890`
   - **Password**: `demo123`

## Step 4: Explore Features

### Dashboard
- View all bookings
- Search by job number or service type
- Filter by status
- See statistics

### Booking Details
- Click any booking to see details
- View attachments
- Download files
- Send messages

## Optional: ServiceM8 Integration

If you have ServiceM8credentials:

1. Open `backend/.env`
2. Add your credentials:
   ```
   SERVICEM8_API_KEY=your-key
   SERVICEM8_SECRET=your-secret
   ```
3. Restart backend server
4. Login again - real data will be fetched!

## Troubleshooting

**Port already in use?**
```bash
# In backend/.env, change:
PORT=5001

# In frontend/.env.local, change:
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

**Dependencies won't install?**
```bash
# Clear cache and try again
npm cache clean --force
npm install
```

**Database errors?**
```bash
# Delete and recreate
cd backend
rm customer_portal.db
npm run dev
```

## What's Next?

- Read [README.md](README.md) for full documentation
- Check [TECH_NOTES.md](TECH_NOTES.md) for technical details
- Customize the design to match your brand
- Add ServiceM8 credentials for real data

---

That's it! You're ready to go. 🚀
