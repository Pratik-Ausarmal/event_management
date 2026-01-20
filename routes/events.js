const express = require('express');
const router = express.Router();
const EventController = require('../controllers/eventController');
const { requireAuth, requireAdmin, requireOrganizer, setUserLocals } = require('../middleware/authMiddleware');

module.exports = (db) => {
    const eventController = new EventController(db);
    
    // Apply middleware
    router.use(setUserLocals);
    
    // Public routes
    router.get('/', (req, res) => eventController.getAllEvents(req, res));
    router.get('/search', (req, res) => eventController.searchEvents(req, res));
    router.get('/type/:type', (req, res) => eventController.getEventsByType(req, res));
    router.get('/:id', (req, res) => eventController.getEventDetails(req, res));
    
    // Protected routes (organizer/admin only)
    router.post('/', requireOrganizer, (req, res) => eventController.createEvent(req, res));
    router.post('/:id/update', requireOrganizer, (req, res) => eventController.updateEvent(req, res));
    router.post('/:id/delete', requireAdmin, (req, res) => eventController.deleteEvent(req, res));
    
    // API routes (Fixed: Added callback)
    router.get('/api/upcoming', (req, res) => {
        eventController.getUpcomingEvents(req, res, 10);
    });
    
    // API route for getting events with filters (NEW)
    router.get('/api/events', async (req, res) => {
        try {
            const filters = req.query;
            const events = await eventController.getEventsWithFilters(filters);
            res.json({
                success: true,
                data: events,
                count: events.length
            });
        } catch (error) {
            console.error('API Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching events'
            });
        }
    });
    
    return router;
};