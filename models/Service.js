// models/Service.js
class Service {
    constructor(db) {
        this.db = db;
    }

    // Get all services
    getAll(callback) {
        const query = 'SELECT * FROM services ORDER BY category, name';
        this.db.query(query, callback);
    }

    // Get service by ID
    findById(id, callback) {
        const query = 'SELECT * FROM services WHERE id = ?';
        this.db.query(query, [id], callback);
    }

    // Get services by category
    getByCategory(category, callback) {
        const query = 'SELECT * FROM services WHERE category = ? ORDER BY name';
        this.db.query(query, [category], callback);
    }

    // Create new service
    create(serviceData, callback) {
        const { name, description, price, category } = serviceData;
        const query = 'INSERT INTO services (name, description, price, category) VALUES (?, ?, ?, ?)';
        this.db.query(query, [name, description, price, category], callback);
    }

    // Update service
    update(id, serviceData, callback) {
        const { name, description, price, category } = serviceData;
        const query = 'UPDATE services SET name = ?, description = ?, price = ?, category = ? WHERE id = ?';
        this.db.query(query, [name, description, price, category, id], callback);
    }

    // Delete service
    delete(id, callback) {
        const query = 'DELETE FROM services WHERE id = ?';
        this.db.query(query, [id], callback);
    }

    // Get service categories
    getCategories(callback) {
        const query = 'SELECT DISTINCT category FROM services ORDER BY category';
        this.db.query(query, callback);
    }

    // Calculate service total
    calculateTotal(serviceIds, callback) {
        if (!serviceIds || serviceIds.length === 0) {
            return callback(null, [{ total: 0 }]);
        }
        
        const placeholders = serviceIds.map(() => '?').join(',');
        const query = `SELECT SUM(price) as total FROM services WHERE id IN (₹{placeholders})`;
        this.db.query(query, serviceIds, callback);
    }
}

module.exports = Service;