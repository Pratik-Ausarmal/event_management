// routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { requireAdmin, setUserLocals } = require('../middleware/authMiddleware');

module.exports = (db) => {
    const userModel = new User(db);
    const eventModel = new Event(db);
    const bookingModel = new Booking(db);
    const serviceModel = new Service(db);
    
    // Apply middleware
    router.use(setUserLocals);
    router.use(requireAdmin);
    
    // Admin dashboard
    router.get('/', (req, res) => {
        // Get all statistics
        Promise.all([
            new Promise(resolve => userModel.count((err, results) => resolve(results[0].count))),
            new Promise(resolve => eventModel.count((err, results) => resolve(results[0].count))),
            new Promise(resolve => bookingModel.count((err, results) => resolve(results[0].count))),
            new Promise(resolve => bookingModel.getRevenue((err, results) => resolve(results[0].total_revenue || 0)))
        ]).then(([userCount, eventCount, bookingCount, revenue]) => {
            res.render('admin/admin-panel', {
                stats: { userCount, eventCount, bookingCount, revenue },
                currentPage: 'admin'
            });
        }).catch(err => {
            console.error(err);
            res.status(500).send('Error loading admin dashboard');
        });
    });
    
    // Users management
    router.get('/users', (req, res) => {
        userModel.getAll((err, users) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error loading users');
            }
            
            res.render('admin/admin-panel', {
                users: users,
                currentPage: 'admin-users'
            });
        });
    });
    
    // Events management
    router.get('/events', (req, res) => {
        eventModel.getAll({}, (err, events) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error loading events');
            }
            
            res.render('admin/admin-panel', {
                events: events,
                currentPage: 'admin-events'
            });
        });
    });
    
    // Bookings management
    router.get('/bookings', (req, res) => {
        bookingModel.getAll((err, bookings) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error loading bookings');
            }
            
            res.render('admin/admin-panel', {
                bookings: bookings,
                currentPage: 'admin-bookings'
            });
        });
    });
    
    // Services management
    router.get('/services', (req, res) => {
        serviceModel.getAll((err, services) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error loading services');
            }
            
            res.render('admin/admin-panel', {
                services: services,
                currentPage: 'admin-services'
            });
        });
    });
    
    // Create new service
    router.post('/services/create', (req, res) => {
        const { name, description, price, category } = req.body;
        
        serviceModel.create({ name, description, price, category }, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error creating service');
            }
            
            res.redirect('/admin/services');
        });
    });
    
    // Update service
    router.post('/services/:id/update', (req, res) => {
        const serviceId = req.params.id;
        const { name, description, price, category } = req.body;
        
        serviceModel.update(serviceId, { name, description, price, category }, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error updating service');
            }
            
            res.redirect('/admin/services');
        });
    });
    
    // Delete service
    router.post('/services/:id/delete', (req, res) => {
        const serviceId = req.params.id;
        
        serviceModel.delete(serviceId, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error deleting service');
            }
            
            res.redirect('/admin/services');
        });
    });
    
    // Update user role
    router.post('/users/:id/role', (req, res) => {
        const userId = req.params.id;
        const { role } = req.body;
        
        db.query('UPDATE users SET role = ? WHERE id = ?', [role, userId], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error updating user role');
            }
            
            res.redirect('/admin/users');
        });
    });

    // Change user role (alternative route)
    router.post('/users/change-role', (req, res) => {
        const { userId, role } = req.body;
        
        db.query('UPDATE users SET role = ? WHERE id = ?', [role, userId], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error updating user role');
            }
            
            res.redirect('/admin/users');
        });
    });
    
    // Delete user
    router.post('/users/:id/delete', (req, res) => {
        const userId = req.params.id;
        
        userModel.delete(userId, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error deleting user');
            }
            
            res.redirect('/admin/users');
        });
    });
    
    // Update booking status
    router.post('/bookings/:id/status', (req, res) => {
        const bookingId = req.params.id;
        const { status } = req.body;
        
        bookingModel.updateStatus(bookingId, status, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error updating booking status');
            }
            
            res.redirect('/admin/bookings');
        });
    });

    // Delete event
    router.post('/events/:id/delete', (req, res) => {
        const eventId = req.params.id;
        
        db.query('DELETE FROM events WHERE id = ?', [eventId], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error deleting event');
            }
            
            res.redirect('/admin/events');
        });
    });
    
    return router;
};