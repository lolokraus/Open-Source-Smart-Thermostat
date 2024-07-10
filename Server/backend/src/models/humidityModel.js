const pool = require('../db');

class Humidity {
    static async getFilteredReadings(startDate, endDate) {
        let conn;
        try {
            conn = await pool.getConnection();
            let query = 'SELECT * FROM humidity';
            const parameters = [];

            if (startDate) {
                query += ' WHERE device_timestamp >= ?';
                parameters.push(startDate);
            }

            if (endDate) {
                query += parameters.length ? ' AND' : ' WHERE';
                query += ' device_timestamp <= ?';
                parameters.push(endDate);
            }

            const result = await conn.query(query, parameters);
            return result;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getLatestReading() {
        let conn;
        try {
            conn = await pool.getConnection();
            const query = 'SELECT * FROM humidity ORDER BY device_timestamp DESC LIMIT 1';
            const result = await conn.query(query);
            return result;
        } finally {
            if (conn) conn.release();
        }
    }

    static async addReading(value, heatingOn, deviceTimestamp) {
        let conn;
        try {
            conn = await pool.getConnection();
            const result = await conn.query('INSERT INTO humidity(value, heating_on, device_timestamp, server_timestamp) VALUES (?, ?, ?, NOW())', [value, heatingOn, deviceTimestamp]);
            return result;
        } finally {
            if (conn) conn.release();
        }
    }
}

module.exports = Humidity;