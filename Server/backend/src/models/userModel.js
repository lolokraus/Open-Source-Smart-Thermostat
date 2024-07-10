const pool = require('../db');

class User {
  static async findByUsername(username) {
    let conn;
    try {
      conn = await pool.getConnection();
      const rows = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
      if (rows.length) return rows[0];
      return null;
    } finally {
      if (conn) conn.release();
    }
  }
}

module.exports = User;