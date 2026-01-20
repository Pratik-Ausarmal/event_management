// routes/bookings.js
const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const { requireAuth, requireAdmin, setUserLocals } = require('../middleware/authMiddleware');

module.exports = (db) => {
    const bookingController = new BookingController(db);
    
    // Apply middleware
    router.use(setUserLocals);
    
    // Protected routes (require authentication)
    router.use(requireAuth);
    
    // Create booking
    router.post('/create', (req, res) => bookingController.createBooking(req, res));
    
    // Get user bookings
    router.get('/my-bookings', (req, res) => {
        bookingController.getUserBookings(req, res);
    });
    
    // Booking details
    router.get('/:id', (req, res) => bookingController.getBookingDetails(req, res));
    
    // Cancel booking
    router.post('/:id/cancel', (req, res) => bookingController.cancelBooking(req, res));
    
    // Update payment status
    router.post('/:id/payment', (req, res) => bookingController.updatePaymentStatus(req, res));
    
    // Admin routes
    router.post('/:id/status', requireAdmin, (req, res) => bookingController.updateBookingStatus(req, res));
    
    // API routes
    router.get('/api/my-bookings', (req, res) => {
        bookingController.getUserBookings(req, res);
    });
    
    return router;
};