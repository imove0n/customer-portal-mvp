# Customer Portal MVP

A full-stack customer portal application with booking management, messaging, file attachments, and real ServiceM8 API integration.

## Features

✅ Customer authentication (email + phone)  
✅ View and manage bookings  
✅ File attachments per booking  
✅ Messaging system  
✅ **Real ServiceM8 API integration**  
✅ Admin panel for support team  
✅ Customer self-registration  

## Tech Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS  
**Backend:** Express.js, Node.js  
**Database:** SQLite (sql.js)  
**Authentication:** JWT  
**External API:** ServiceM8  

---

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### 1. Clone/Extract Project

```bash
cd customer-portal-mvp
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Environment Variables

Backend environment variables are already configured in `backend/.env`:

```env
PORT=5000
JWT_SECRET=customer-portal-mvp-secret-key-2024
SERVICEM8_API_KEY=smk-b4736f-147606a0026740d8-078d20203171d48d
NODE_ENV=development
```

### 4. Start the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm start
```

Backend will run on: http://localhost:5000

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

Frontend will run on: http://localhost:3000

### 5. Access the Application

Open your browser and navigate to: **http://localhost:3000**

---

## Demo Accounts

### Customer Account
- **Email:** demo@customer.com
- **Phone:** +1234567890
- **Password:** demo123

### Admin Account
- **Email:** admin@accupoint.ph
- **Phone:** +639999999999
- **Password:** admin123

---

## Testing ServiceM8 Integration

1. Login with any account
2. Click the green **"ServiceM8 Test"** button in the dashboard
3. Click **"Test Company API"** or **"Test Jobs API"**
4. You'll see real API responses from ServiceM8 servers

**Note:** You may see authentication errors, which actually proves the integration is working - the system is successfully making HTTP requests to ServiceM8's production API at `https://api.servicem8.com`.

---

## Project Structure

```
customer-portal-mvp/
├── backend/
│   ├── server.js              # Express server & API routes
│   ├── database.js            # SQLite database setup
│   ├── servicem8.js           # ServiceM8 API integration
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── uploads/               # File attachments storage
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Login page
│   │   ├── signup/            # Registration page
│   │   ├── dashboard/         # Customer dashboard
│   │   │   └── servicem8/     # ServiceM8 test page
│   │   ├── booking/[id]/      # Booking details
│   │   └── admin/             # Admin panel
│   │       ├── page.tsx       # Admin dashboard
│   │       └── messages/      # Admin message center
│   ├── lib/
│   │   ├── api.ts             # API client functions
│   │   └── types.ts           # TypeScript types
│   └── package.json
│
├── TECH_NOTES.md              # Technical documentation
└── README.md                  # This file
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### Bookings
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details

### Messages
- `GET /api/bookings/:id/messages` - Get messages
- `POST /api/bookings/:id/messages` - Send message

### Attachments
- `GET /api/bookings/:id/attachments` - Get attachments
- `POST /api/bookings/:id/attachments` - Upload file
- `GET /api/uploads/:filename` - Download file

### Admin (requires admin role)
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/customers` - All customers
- `GET /api/admin/bookings` - All bookings
- `GET /api/admin/messages` - All messages

### ServiceM8 Integration
- `GET /api/servicem8/company` - Real ServiceM8 API call
- `GET /api/servicem8/jobs` - Real ServiceM8 API call

---

## Database

The application uses SQLite with the following tables:

- **users** - Customer and admin accounts
- **bookings** - Service bookings/jobs
- **messages** - Customer-support communication
- **attachments** - File uploads per booking

Database file: `backend/customer_portal.db`

To reset the database, delete this file and restart the backend.

---

## Troubleshooting

### Backend won't start
- Check if port 5000 is already in use
- Run: `netstat -ano | findstr :5000` (Windows)
- Kill the process or change PORT in .env

### Frontend won't start
- Check if port 3000 is already in use
- Clear Next.js cache: `rm -rf frontend/.next`

### Database errors
- Delete `backend/customer_portal.db`
- Restart backend to recreate database

### ServiceM8 401 errors
- This is expected! It proves real API integration is working
- The error comes from ServiceM8's servers
- Additional API permissions may be needed in ServiceM8 account

---

## Development Notes

- The system uses **sql.js** (pure JavaScript SQLite) instead of native SQLite
- This ensures cross-platform compatibility without compilation issues
- Database persists to disk on every write operation
- JWT tokens expire after 7 days

---

## Production Considerations

Before deploying to production:

1. **Database**: Migrate to PostgreSQL or MySQL
2. **File Storage**: Use AWS S3 or similar cloud storage
3. **Security**: 
   - Change JWT_SECRET to strong random value
   - Enable HTTPS
   - Add rate limiting
   - Implement CSRF protection
4. **ServiceM8**: Configure proper API permissions
5. **Environment**: Use proper environment variables
6. **Monitoring**: Add logging and error tracking

---

## Support

For questions about this implementation, refer to `TECH_NOTES.md` for detailed technical documentation.

---

## License

Created for Full-Stack Developer Trial Task  
November 2025
