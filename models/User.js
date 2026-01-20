// models/User.js
class User {
    constructor(db) {
        this.db = db;
    }

    // Create new user
    create(userData, callback) {
        const { username, email, password, role, full_name, phone } = userData;
        const query = `
            INSERT INTO users (username, email, password, role, full_name, phone) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        this.db.query(query, [username, email, password, role || 'user', full_name, phone], callback);
    }

    // Find user by email
    findByEmail(email, callback) {
        const query = 'SELECT * FROM users WHERE email = ?';
        this.db.query(query, [email], callback);
    }

    // Find user by username
    findByUsername(username, callback) {
        const query = 'SELECT * FROM users WHERE username = ?';
        this.db.query(query, [username], callback);
    }

    // Find user by ID
    findById(id, callback) {
        const query = 'SELECT id, username, email, role, full_name, phone, created_at FROM users WHERE id = ?';
        this.db.query(query, [id], callback);
    }

    // Update user profile
    update(id, userData, callback) {
        const { full_name, phone, address } = userData;
        const query = `
            UPDATE users 
            SET full_name = ?, phone = ?, address = ? 
            WHERE id = ?
        `;
        this.db.query(query, [full_name, phone, address, id], callback);
    }

    // Get all users (for admin)
    getAll(callback) {
        const query = 'SELECT id, username, email, role, full_name, phone, created_at FROM users ORDER BY created_at DESC';
        this.db.query(query, callback);
    }

    // Delete user
    delete(id, callback) {
        const query = 'DELETE FROM users WHERE id = ?';
        this.db.query(query, [id], callback);
    }

    // Count total users
    count(callback) {
        const query = 'SELECT COUNT(*) as count FROM users';
        this.db.query(query, callback);
    }
}

module.exports = User;