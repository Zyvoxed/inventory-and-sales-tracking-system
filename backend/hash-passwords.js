// Script to hash existing plaintext passwords in `users` table.
// Run: node hash-passwords.js
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'inventory_db',
});

db.connect((err) => {
  if (err) return console.error('DB connection error:', err);
  console.log('Connected to DB');

  db.query('SELECT user_id, password FROM users', (err, rows) => {
    if (err) return console.error('Select error:', err);

    const tasks = rows.map((r) => ({ id: r.user_id, pass: r.password }));

    (async function process() {
      for (const t of tasks) {
        const p = t.pass || '';
        // Skip if already bcrypt hash (starts with $2)
        if (p.startsWith('$2')) {
          console.log(`Skipping user ${t.id}: already hashed`);
          continue;
        }

        try {
          const hash = await bcrypt.hash(p, SALT_ROUNDS);
          await new Promise((resolve, reject) => {
            db.query('UPDATE users SET password = ? WHERE user_id = ?', [hash, t.id], (uErr, res) => {
              if (uErr) return reject(uErr);
              console.log(`Updated user ${t.id}`);
              resolve();
            });
          });
        } catch (e) {
          console.error(`Error updating user ${t.id}:`, e);
        }
      }

      console.log('Done.');
      db.end();
    })();
  });
});
