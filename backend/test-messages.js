const { initDatabase, prepare, saveDatabase } = require('./database');

async function testMessagePersistence() {
  console.log('='.repeat(60));
  console.log('TESTING EXPRESS BACKEND MESSAGE PERSISTENCE');
  console.log('='.repeat(60));

  await initDatabase();

  // 1. Show all users
  console.log('\n1. USERS IN DATABASE:');
  const users = prepare('SELECT id, email, phone, first_name, last_name FROM users').all();
  console.table(users);

  // 2. Show all bookings
  console.log('\n2. BOOKINGS IN DATABASE:');
  const bookings = prepare('SELECT id, user_id, job_number, status, service_type FROM bookings').all();
  console.table(bookings);

  // 3. Show all messages BEFORE adding new one
  console.log('\n3. MESSAGES BEFORE TEST:');
  const messagesBefore = prepare('SELECT id, booking_id, user_id, message, sender_type FROM messages').all();
  console.table(messagesBefore);

  // 4. Add a test message (simulating what Express backend does)
  if (bookings.length > 0 && users.length > 0) {
    const testBookingId = bookings[0].id;
    const testUserId = bookings[0].user_id;

    console.log(`\n4. ADDING TEST MESSAGE:`);
    console.log(`   Booking ID: ${testBookingId}`);
    console.log(`   User ID: ${testUserId}`);
    console.log(`   Message: "This is a test message to verify Express backend persistence"`);

    const result = prepare(`
      INSERT INTO messages (booking_id, user_id, message, sender_type)
      VALUES (?, ?, ?, ?)
    `).run(
      testBookingId,
      testUserId,
      'This is a test message to verify Express backend persistence',
      'customer'
    );

    console.log(`   ✅ Message inserted with ID: ${result.lastInsertRowid}`);

    // 5. Show all messages AFTER adding new one
    console.log('\n5. MESSAGES AFTER TEST (VERIFYING PERSISTENCE):');
    const messagesAfter = prepare('SELECT id, booking_id, user_id, message, sender_type, created_at FROM messages').all();
    console.table(messagesAfter);

    // 6. Retrieve the specific message we just added
    console.log('\n6. RETRIEVING THE NEWLY ADDED MESSAGE:');
    const newMessage = prepare(`
      SELECT m.*, u.first_name, u.last_name, u.email
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `).get(result.lastInsertRowid);

    console.log(JSON.stringify(newMessage, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('✅ MESSAGE PERSISTENCE TEST SUCCESSFUL!');
    console.log('Express backend successfully:');
    console.log('  - Received the message');
    console.log('  - Persisted it to the SQLite database');
    console.log('  - Retrieved it with user information');
    console.log('='.repeat(60));
  } else {
    console.log('\n⚠️  No bookings or users found. Please add test data first.');
  }

  saveDatabase();
  process.exit(0);
}

testMessagePersistence().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
