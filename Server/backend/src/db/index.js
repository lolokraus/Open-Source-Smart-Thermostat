const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD
});

async function testConnection() {
  let conn;
  try {
    console.log("Attempting to connect to the database...");
    conn = await pool.getConnection();
    console.log("Connected to the database. Connection id:", conn.threadId);

    const rows = await conn.query("SELECT 1 as val");
    console.log("Query result:", rows);

  } catch (err) {
    console.error("Error connecting to the database:", err);
  } finally {
    if (conn) conn.end();
  }
}

testConnection();

module.exports = pool;