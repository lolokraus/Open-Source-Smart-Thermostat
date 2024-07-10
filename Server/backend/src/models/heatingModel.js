const pool = require('../db');

class Heating {
  static async getSettings() {
    let conn;
    try {
      conn = await pool.getConnection();
      const rows = await conn.query('SELECT * FROM heating WHERE id = 1');
      if (rows.length) return rows[0];
      return null;
    } catch (error) {
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  static async updateSettings(manualActive, manualTemperature, highTemperature, lowTemperature, highStart, highEnd, scheduleActive) {
    let conn;
    try {
      conn = await pool.getConnection();
      const sql = 'UPDATE heating SET manual_active = ?, manual_temperature = ?, high_temperature = ?, low_temperature = ?, high_start = ?, high_end = ?, schedule_active = ? WHERE id = 1';
      await conn.query(sql, [manualActive, manualTemperature, highTemperature, lowTemperature, highStart, highEnd, scheduleActive]);
    } catch (error) {
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }
}

module.exports = Heating;