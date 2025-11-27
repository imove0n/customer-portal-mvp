const { initDatabase, prepare, saveDatabase } = require('./database');

async function addBookingsForUser(userId) {
  await initDatabase();

  console.log(`Adding bookings for user ID: ${userId}`);

  // Insert demo bookings
  const booking1 = prepare(`
    INSERT INTO bookings (user_id, job_number, status, service_type, scheduled_date, description, total_amount, address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    'JOB-2024-101',
    'Completed',
    'Plumbing Repair',
    '2024-01-15 10:00:00',
    'Fixed kitchen sink leak and replaced faucet',
    250.00,
    '123 Main St, Manila'
  );

  const booking2 = prepare(`
    INSERT INTO bookings (user_id, job_number, status, service_type, scheduled_date, description, total_amount, address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    'JOB-2024-102',
    'Scheduled',
    'HVAC Maintenance',
    '2024-02-20 14:00:00',
    'Annual air conditioning system inspection',
    150.00,
    '123 Main St, Manila'
  );

  const booking3 = prepare(`
    INSERT INTO bookings (user_id, job_number, status, service_type, scheduled_date, description, total_amount, address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    'JOB-2024-103',
    'In Progress',
    'Electrical Work',
    '2024-01-25 09:00:00',
    'Install new lighting fixtures in living room',
    350.00,
    '123 Main St, Manila'
  );

  console.log(`✅ Added 3 bookings for user ${userId}`);
  console.log(`Booking IDs: ${booking1.lastInsertRowid}, ${booking2.lastInsertRowid}, ${booking3.lastInsertRowid}`);

  // Add a sample message to booking 1
  const messageResult = prepare(`
    INSERT INTO messages (booking_id, user_id, message, sender_type)
    VALUES (?, ?, ?, ?)
  `).run(booking1.lastInsertRowid, userId, 'Looking forward to this service!', 'customer');

  console.log(`✅ Added sample message`);

  saveDatabase();
  process.exit(0);
}

// Get user ID from command line or use 2
const userId = process.argv[2] || 2;
addBookingsForUser(parseInt(userId));
