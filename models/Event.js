// models/Event.js
class Event {
    constructor(db) {
        this.db = db;
    }

    // Original callback-based methods (keep for compatibility)
    getAll(filters = {}, callback) {
        let query = 'SELECT * FROM events WHERE 1=1';
        const params = [];
        
        // Apply filters
        if (filters.type && filters.type !== 'all') {
            query += ' AND type = ?';
            params.push(filters.type);
        }
        
        if (filters.date) {
            query += ' AND DATE(date) = ?';
            params.push(filters.date);
        }
        
        if (filters.minPrice) {
            query += ' AND price >= ?';
            params.push(parseFloat(filters.minPrice));
        }
        
        if (filters.maxPrice) {
            query += ' AND price <= ?';
            params.push(parseFloat(filters.maxPrice));
        }
        
        // Only show upcoming events by default
        query += ' AND (date >= CURDATE() OR date IS NULL)';
        
        query += ' ORDER BY date ASC';
        
        this.db.query(query, params, callback);
    }

    findById(id, callback) {
        this.db.query('SELECT * FROM events WHERE id = ?', [id], callback);
    }

    getUpcoming(limit, callback) {
        this.db.query(
            'SELECT * FROM events WHERE date >= CURDATE() ORDER BY date ASC LIMIT ?',
            [limit],
            callback
        );
    }

    search(keyword, callback) {
        const searchTerm = `%${keyword}%`;
        this.db.query(
            'SELECT * FROM events WHERE (title LIKE ? OR description LIKE ? OR location LIKE ?) AND date >= CURDATE() ORDER BY date ASC',
            [searchTerm, searchTerm, searchTerm],
            callback
        );
    }

    getByType(type, callback) {
        this.db.query(
            'SELECT * FROM events WHERE type = ? AND date >= CURDATE() ORDER BY date ASC',
            [type],
            callback
        );
    }

    create(eventData, callback) {
        const {
            title, description, type, date, time, location,
            price, capacity, image_url, images, organizer_id, status
        } = eventData;
        
        // Convert images array to JSON string if it's an array
        const imagesJson = Array.isArray(images) ? JSON.stringify(images) : images;
        
        this.db.query(
            'INSERT INTO events (title, description, type, date, time, location, price, capacity, image_url, images, organizer_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [title, description, type, date, time, location, price, capacity, image_url, imagesJson, organizer_id, status],
            callback
        );
    }

    update(id, eventData, callback) {
        const {
            title, description, type, date, time, location,
            price, capacity, image_url, images
        } = eventData;
        
        // Convert images array to JSON string if it's an array
        const imagesJson = Array.isArray(images) ? JSON.stringify(images) : images;
        
        this.db.query(
            'UPDATE events SET title = ?, description = ?, type = ?, date = ?, time = ?, location = ?, price = ?, capacity = ?, image_url = ?, images = ?, updated_at = NOW() WHERE id = ?',
            [title, description, type, date, time, location, price, capacity, image_url, imagesJson, id],
            callback
        );
    }

    delete(id, callback) {
        this.db.query('DELETE FROM events WHERE id = ?', [id], callback);
    }

    count(callback) {
        this.db.query('SELECT COUNT(*) as count FROM events', callback);
    }

    // NEW: Async versions of all methods
    getAllAsync(filters = {}) {
        return new Promise((resolve, reject) => {
            this.getAll(filters, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    // Parse images JSON string to array
                    const events = results.map(event => {
                        if (event.images && typeof event.images === 'string') {
                            try {
                                event.images = JSON.parse(event.images);
                            } catch (e) {
                                event.images = [];
                            }
                        } else if (!event.images) {
                            event.images = [];
                        }
                        return event;
                    });
                    resolve(events);
                }
            });
        });
    }

    findByIdAsync(id) {
        return new Promise((resolve, reject) => {
            this.findById(id, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    // Parse images JSON string to array
                    const events = results.map(event => {
                        if (event.images && typeof event.images === 'string') {
                            try {
                                event.images = JSON.parse(event.images);
                            } catch (e) {
                                event.images = [];
                            }
                        } else if (!event.images) {
                            event.images = [];
                        }
                        return event;
                    });
                    resolve(events);
                }
            });
        });
    }

    getUpcomingAsync(limit) {
        return new Promise((resolve, reject) => {
            this.getUpcoming(limit, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    // Parse images JSON string to array
                    const events = results.map(event => {
                        if (event.images && typeof event.images === 'string') {
                            try {
                                event.images = JSON.parse(event.images);
                            } catch (e) {
                                event.images = [];
                            }
                        } else if (!event.images) {
                            event.images = [];
                        }
                        return event;
                    });
                    resolve(events);
                }
            });
        });
    }

    searchAsync(keyword) {
        return new Promise((resolve, reject) => {
            this.search(keyword, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    // Parse images JSON string to array
                    const events = results.map(event => {
                        if (event.images && typeof event.images === 'string') {
                            try {
                                event.images = JSON.parse(event.images);
                            } catch (e) {
                                event.images = [];
                            }
                        } else if (!event.images) {
                            event.images = [];
                        }
                        return event;
                    });
                    resolve(events);
                }
            });
        });
    }

    getByTypeAsync(type) {
        return new Promise((resolve, reject) => {
            this.getByType(type, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    // Parse images JSON string to array
                    const events = results.map(event => {
                        if (event.images && typeof event.images === 'string') {
                            try {
                                event.images = JSON.parse(event.images);
                            } catch (e) {
                                event.images = [];
                            }
                        } else if (!event.images) {
                            event.images = [];
                        }
                        return event;
                    });
                    resolve(events);
                }
            });
        });
    }

    createAsync(eventData) {
        return new Promise((resolve, reject) => {
            this.create(eventData, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    updateAsync(id, eventData) {
        return new Promise((resolve, reject) => {
            this.update(id, eventData, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    deleteAsync(id) {
        return new Promise((resolve, reject) => {
            this.delete(id, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    countAsync() {
        return new Promise((resolve, reject) => {
            this.count((err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0].count);
                }
            });
        });
    }

    // Additional helper methods
    getEventsByOrganizer(organizerId) {
        return new Promise((resolve, reject) => {
            this.db.query(
                'SELECT * FROM events WHERE organizer_id = ? ORDER BY date DESC',
                [organizerId],
                (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        // Parse images JSON string to array
                        const events = results.map(event => {
                            if (event.images && typeof event.images === 'string') {
                                try {
                                    event.images = JSON.parse(event.images);
                                } catch (e) {
                                    event.images = [];
                                }
                            } else if (!event.images) {
                                event.images = [];
                            }
                            return event;
                        });
                        resolve(events);
                    }
                }
            );
        });
    }

    getEventStatistics() {
        return new Promise((resolve, reject) => {
            this.db.query(
                `SELECT 
                    COUNT(*) as total_events,
                    SUM(CASE WHEN date >= CURDATE() THEN 1 ELSE 0 END) as upcoming_events,
                    SUM(CASE WHEN date < CURDATE() THEN 1 ELSE 0 END) as past_events,
                    AVG(price) as avg_price,
                    SUM(capacity) as total_capacity
                FROM events`,
                (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results[0]);
                    }
                }
            );
        });
    }
}

module.exports = Event;