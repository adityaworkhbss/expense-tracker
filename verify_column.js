require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='onboarding_count';")
  .then(res => {
    console.log('Column check results:', res.rows);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
