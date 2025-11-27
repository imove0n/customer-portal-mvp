const { initDatabase, prepare, saveDatabase } = require('./database');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  await initDatabase();

  const email = 'admin@accupoint.ph';
  const phone = '+639999999999';
  const password = 'admin123';
  const firstName = 'Admin';
  const lastName = 'User';

  // Check if admin already exists
  const existing = prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (existing) {
    console.log('⚠️  Admin user already exists');
    console.log('Email:', email);
    console.log('Phone:', phone);
    process.exit(0);
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const result = prepare(`
    INSERT INTO users (email, phone, password_hash, first_name, last_name, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(email, phone, passwordHash, firstName, lastName, 'admin');

  saveDatabase();

  console.log('✅ Admin user created successfully!');
  console.log('');
  console.log('Admin Credentials:');
  console.log('  Email:', email);
  console.log('  Phone:', phone);
  console.log('  Password:', password);
  console.log('');
  console.log('Access admin panel at: http://localhost:3000/admin');

  process.exit(0);
}

createAdmin().catch(err => {
  console.error('Failed to create admin:', err);
  process.exit(1);
});
