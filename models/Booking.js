// models/Booking.js

class Booking {
    constructor(db) {
        this.db = db;
    }

    // Create new booking
    create(data, callback) {
        const sql = `
            INSERT INTO bookings (
                user_id, event_id, guest_count, budget, services
            ) VALUES (?, ?, ?, ?, ?)
        `;
        const params = [
            data.user_id,
            data.event_id,
            data.guest_count,
            data.budget,
            data.services
        ];
        this.db.query(sql, params, callback);
    }

    // Get bookings for a user
    getByUser(userId, callback) {
        const sql = `
            SELECT 
                b.id,
                b.guest_count,
                b.budget,
                b.status,
                b.created_at,
                e.title AS event_title,
                e.date AS event_date,
                e.location AS event_location,
                e.image_url
            FROM bookings b
            JOIN events e ON b.event_id = e.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
            LIMIT 5
        `;
        console.log("[SQL] getByUser:", sql, userId);
        this.db.query(sql, [userId], callback);
    }

    // Get stats for dashboard
    getStats(userId, callback) {
        const sql = `
            SELECT
                COUNT(*) AS total_bookings,
                SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_bookings,
                COALESCE(SUM(budget), 0) AS total_spent
            FROM bookings
            WHERE user_id = ?
        `;
        console.log("[SQL] getStats:", sql, userId);
        this.db.query(sql, [userId], callback);
    }

    // Find a booking by ID
    findById(id, callback) {
        const sql = `SELECT * FROM bookings WHERE id = ?`;
        this.db.query(sql, [id], callback);
    }

    // Update booking status
    updateStatus(id, status, callback) {
        const sql = `UPDATE bookings SET status = ? WHERE id = ?`;
        this.db.query(sql, [status, id], callback);
    }
}

module.exports = Booking;
