const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'customer_portal.db');
let db = null;

// Initialize SQL.js and load/create database
async function initializeDatabase() {
  const SQL = await initSqlJs();

  try {
    // Try to load existing database
    const filebuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(filebuffer);
    console.log('✅ Loaded existing database');
  } catch (err) {
    // Create new database if file doesn't exist
    db = new SQL.Database();
    console.log('✅ Created new database');
  }

  return db;
}

// Save database to file
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Initialize database schema
async function initDatabase() {
  if (!db) {
    await initializeDatabase();
  }

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bookings table
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      servicem8_uuid TEXT,
      job_number TEXT,
      status TEXT NOT NULL,
      service_type TEXT,
      scheduled_date DATETIME,
      completed_date DATETIME,
      description TEXT,
      total_amount DECIMAL(10,2),
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Messages table
  db.run(`
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
  `);

  // File attachments table
  db.run(`
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    )
  `);

  saveDatabase();

  // Seed demo data
  await seedDemoData();

  console.log('✅ Database initialized successfully');
}

async function seedDemoData() {
  const result = db.exec('SELECT COUNT(*) as count FROM users');
  const count = result.length > 0 ? result[0].values[0][0] : 0;

  if (count === 0) {
    const password = bcrypt.hashSync('demo123', 10);

    // Insert demo user
    db.run(
      `INSERT INTO users (email, phone, password_hash, first_name, last_name)
       VALUES (?, ?, ?, ?, ?)`,
      ['demo@customer.com', '+1234567890', password, 'John', 'Doe']
    );
    saveDatabase();

    // Get the user ID
    const userResult = db.exec('SELECT id FROM users WHERE email = ?', ['demo@customer.com']);
    const userId = userResult[0].values[0][0];

    // Insert demo bookings
    db.run(
      `INSERT INTO bookings (user_id, job_number, status, service_type, scheduled_date, description, total_amount, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, 'JOB-2024-001', 'Completed', 'Plumbing Repair', '2024-01-15 10:00:00',
       'Fixed kitchen sink leak and replaced faucet', 250.00, '123 Main St, Springfield']
    );

    db.run(
      `INSERT INTO bookings (user_id, job_number, status, service_type, scheduled_date, description, total_amount, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, 'JOB-2024-002', 'Scheduled', 'HVAC Maintenance', '2024-02-20 14:00:00',
       'Annual air conditioning system inspection', 150.00, '123 Main St, Springfield']
    );

    db.run(
      `INSERT INTO bookings (user_id, job_number, status, service_type, scheduled_date, description, total_amount, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, 'JOB-2024-003', 'In Progress', 'Electrical Work', '2024-01-25 09:00:00',
       'Install new lighting fixtures in living room', 350.00, '123 Main St, Springfield']
    );
    saveDatabase();

    // Get booking IDs
    const bookingResults = db.exec('SELECT id FROM bookings ORDER BY id');
    const booking1Id = bookingResults[0].values[0][0];
    const booking2Id = bookingResults[0].values[1][0];
    const booking3Id = bookingResults[0].values[2][0];

    // Insert demo messages
    db.run(
      `INSERT INTO messages (booking_id, user_id, message, sender_type)
       VALUES (?, ?, ?, ?)`,
      [booking1Id, userId, 'Hi, when will the technician arrive?', 'customer']
    );
    db.run(
      `INSERT INTO messages (booking_id, user_id, message, sender_type)
       VALUES (?, ?, ?, ?)`,
      [booking1Id, userId, 'Our technician will arrive between 10-11 AM', 'support']
    );
    db.run(
      `INSERT INTO messages (booking_id, user_id, message, sender_type)
       VALUES (?, ?, ?, ?)`,
      [booking1Id, userId, 'Thank you! Looking forward to it.', 'customer']
    );

    // Insert demo attachments
    db.run(
      `INSERT INTO attachments (booking_id, file_name, file_url, file_type, file_size)
       VALUES (?, ?, ?, ?, ?)`,
      [booking1Id, 'invoice_job001.pdf', '/uploads/invoice_job001.pdf', 'application/pdf', 45678]
    );
    db.run(
      `INSERT INTO attachments (booking_id, file_name, file_url, file_type, file_size)
       VALUES (?, ?, ?, ?, ?)`,
      [booking1Id, 'before_photo.jpg', 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400', 'image/jpeg', 123456]
    );
    db.run(
      `INSERT INTO attachments (booking_id, file_name, file_url, file_type, file_size)
       VALUES (?, ?, ?, ?, ?)`,
      [booking1Id, 'after_photo.jpg', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400', 'image/jpeg', 134567]
    );

    saveDatabase();
    console.log('✅ Demo data seeded successfully');
  }
}

// Helper function to execute queries and return results
function query(sql, params = []) {
  try {
    const result = db.exec(sql, params);
    saveDatabase();
    return result;
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
}

// Helper function for prepared statements (compatible with better-sqlite3 API)
function prepare(sql) {
  return {
    run: (...params) => {
      // Execute the SQL statement
      db.run(sql, params);

      // Get the last insert ID - must query immediately after insert
      const idResult = db.exec('SELECT last_insert_rowid() as id');
      let lastId = null;

      if (idResult.length > 0 && idResult[0].values.length > 0) {
        lastId = idResult[0].values[0][0];
      }

      saveDatabase();
      return { lastInsertRowid: lastId };
    },
    get: (...params) => {
      const result = db.exec(sql, params);
      if (result.length > 0 && result[0].values.length > 0) {
        const columns = result[0].columns;
        const values = result[0].values[0];
        const obj = {};
        columns.forEach((col, i) => {
          obj[col] = values[i];
        });
        return obj;
      }
      return null;
    },
    all: (...params) => {
      const result = db.exec(sql, params);
      if (result.length > 0) {
        const columns = result[0].columns;
        return result[0].values.map(values => {
          const obj = {};
          columns.forEach((col, i) => {
            obj[col] = values[i];
          });
          return obj;
        });
      }
      return [];
    }
  };
}

module.exports = {
  initDatabase,
  saveDatabase,
  query,
  prepare,
  getDb: () => db
};
