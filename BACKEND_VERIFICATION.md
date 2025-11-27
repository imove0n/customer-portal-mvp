# Backend Verification - Express.js Implementation

## ✅ Requirement: Backend using Express.js

### Implementation Confirmation

**File:** `backend/server.js`

```javascript
const express = require('express');  // Line 2
const app = express();              // Line 9
```

The backend is **100% implemented using Express.js**.

---

## ✅ Message Persistence Feature

### How It Works

**1. Express Route Handler** (`backend/server.js` lines 235-267)

```javascript
// Send a message
app.post('/api/bookings/:id/messages', checkDbReady, authenticateToken, (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Verify booking belongs to user
    const booking = prepare(`
      SELECT * FROM bookings
      WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // PERSIST MESSAGE TO DATABASE
    const result = prepare(`
      INSERT INTO messages (booking_id, user_id, message, sender_type)
      VALUES (?, ?, ?, ?)
    `).run(req.params.id, req.user.id, message.trim(), 'customer');

    // RETRIEVE THE PERSISTED MESSAGE
    const newMessage = prepare(`
      SELECT m.*, u.first_name, u.last_name, u.email
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Database Schema

**Messages Table** (`backend/database.js` lines 74-86)

```sql
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

---

## Test Results

### Current Database State

**Users:**
| ID | Email | Phone | Name |
|----|-------|-------|------|
| 1  | demo@customer.com | +1234567890 | John Doe |
| 2  | ai@accupoint.ph | 09916945173 | AI User |

**Bookings:**
| ID | User ID | Job Number | Status | Service Type |
|----|---------|------------|--------|--------------|
| 1  | 1 | JOB-2024-001 | Completed | Plumbing Repair |
| 2  | 1 | JOB-2024-002 | Scheduled | HVAC Maintenance |
| 3  | 1 | JOB-2024-003 | In Progress | Electrical Work |
| 4  | 2 | JOB-2024-101 | Completed | Plumbing Repair |
| 5  | 2 | JOB-2024-102 | Scheduled | HVAC Maintenance |
| 6  | 2 | JOB-2024-103 | In Progress | Electrical Work |

**Messages (Persisted):**
| ID | Booking ID | User ID | Message | Type | Created At |
|----|------------|---------|---------|------|------------|
| 1  | 1 | 1 | "Hi, when will the technician arrive?" | customer | 2025-11-27 13:50:51 |
| 2  | 1 | 1 | "Our technician will arrive between 10-11 AM" | support | 2025-11-27 13:50:51 |
| 3  | 1 | 1 | "Thank you! Looking forward to it." | customer | 2025-11-27 13:50:51 |
| 4  | 2 | 1 | "Hello?" | customer | 2025-11-27 13:55:46 |
| 5  | 0 | 2 | "Looking forward to this service!" | customer | 2025-11-27 13:57:28 |
| 6  | 1 | 1 | "This is a test message to verify Express backend persistence" | customer | 2025-11-27 14:00:14 |

---

## How to Test Message Persistence

### Method 1: Using the Frontend

1. Navigate to http://localhost:3000
2. Login with credentials:
   - Email: `demo@customer.com`
   - Phone: `+1234567890`
   - Password: `demo123`
3. Click on any booking
4. Type a message in the text box and click "Send"
5. The message will be:
   - **Sent to Express backend** via POST `/api/bookings/:id/messages`
   - **Persisted to SQLite database**
   - **Retrieved and displayed** in the UI

### Method 2: Using cURL (Command Line)

```bash
# Step 1: Get auth token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@customer.com","phone":"+1234567890","password":"demo123"}'

# Step 2: Send a message (replace TOKEN with the token from step 1)
curl -X POST http://localhost:5000/api/bookings/1/messages \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Test message from cURL"}'

# Step 3: Verify message was persisted by retrieving all messages
curl -X GET http://localhost:5000/api/bookings/1/messages \
  -H "Authorization: Bearer TOKEN"
```

### Method 3: Using the Test Script

```bash
cd backend
node test-messages.js
```

This will display all messages in the database and add a test message to verify persistence.

---

## Key Features Demonstrated

✅ **Express.js Framework**: Server is built with Express.js
✅ **RESTful API**: Proper HTTP methods (POST, GET)
✅ **Authentication**: JWT token-based auth
✅ **Data Persistence**: Messages saved to SQLite database
✅ **Data Retrieval**: Messages can be fetched with user info
✅ **Validation**: Input validation and error handling
✅ **Security**: Booking ownership verification

---

## API Endpoints Summary

| Method | Endpoint | Description | Persistence |
|--------|----------|-------------|-------------|
| POST | `/api/bookings/:id/messages` | Send a message | ✅ Saves to DB |
| GET | `/api/bookings/:id/messages` | Get all messages | ✅ Reads from DB |
| POST | `/api/auth/login` | User login | ✅ Validates from DB |
| POST | `/api/auth/register` | User registration | ✅ Saves to DB |
| GET | `/api/bookings` | Get all bookings | ✅ Reads from DB |
| GET | `/api/bookings/:id` | Get single booking | ✅ Reads from DB |

All data is **persisted** in `backend/customer_portal.db` (SQLite database).
