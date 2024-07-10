const pool = require('../db');

class Temperature {
    static async getFilteredReadings(startDate, endDate) {
        let conn;
        try {
            conn = await pool.getConnection();
            let query = 'SELECT * FROM temperature';
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
            const query = 'SELECT * FROM temperature ORDER BY device_timestamp DESC LIMIT 1';
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
            const result = await conn.query('INSERT INTO temperature(value, heating_on, device_timestamp, server_timestamp) VALUES (?, ?, ?, NOW())', [value, heatingOn, deviceTimestamp]);
            return result;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getLatest() {
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query('SELECT id, value FROM temperature ORDER BY id DESC LIMIT 1');
        if (result.length) {
            return result[0];
        }
        return null;
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}
}

module.exports = Temperature;