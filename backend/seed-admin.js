const bcrypt = require('bcryptjs');
const { initDatabase, prepare, saveDatabase } = require('./database');

async function seedAdmin() {
  await initDatabase();

  const password = bcrypt.hashSync('admin123', 10);

  try {
    // Insert admin user
    prepare(`INSERT INTO users (email, phone, password_hash, first_name, last_name, role)
             VALUES (?, ?, ?, ?, ?, ?)`)
      .run('admin@portal.com', '+1234567890', password, 'Admin', 'User', 'admin');

    console.log('✅ Admin user created:');
    console.log('   Email: admin@portal.com');
    console.log('   Phone: +1234567890');
    console.log('   Password: admin123');

    saveDatabase();
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      console.log('Admin user already exists');
    } else {
      console.error('Error creating admin:', err);
    }
  }
}

seedAdmin();
