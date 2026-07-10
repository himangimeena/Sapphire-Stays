const { query } = require('../src/db/index');

async function run() {
  try {
    const users = await query('SELECT id, email, name, role, avatar_url FROM Users');
    console.log('USERS IN DATABASE:', JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('ERROR QUERYING DB:', err);
  }
}

run();
