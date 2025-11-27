const { initDatabase, saveDatabase, getDb } = require('./database');

async function migrateAddRole() {
  await initDatabase();
  const db = getDb();

  try {
    // Check if role column exists
    const tableInfo = db.exec("PRAGMA table_info(users)");
    const columns = tableInfo[0] ? tableInfo[0].values.map(row => row[1]) : [];

    if (columns.includes('role')) {
      console.log('✅ Role column already exists');
      process.exit(0);
    }

    console.log('Adding role column to users table...');

    // Add role column with default value
    db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'customer'");

    saveDatabase();

    console.log('✅ Successfully added role column to users table');
    console.log('All existing users now have role = "customer"');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

migrateAddRole();
