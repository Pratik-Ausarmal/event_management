const Event = require('../models/Event');
const Service = require('../models/Service');

class EventController {
    constructor(db) {
        this.eventModel = new Event(db);
        this.serviceModel = new Service(db);
    }

    // Normalize image paths (prefix relative filenames with /images/)
    normalizeImagePath(url) {
        if (!url || typeof url !== 'string') return url;
        if (url.startsWith('http') || url.startsWith('/')) return url;
        return `/images/${url}`;
    }

    // Get all events with filters (Fixed with async/await)
    async getAllEvents(req, res) {
        try {
            const filters = req.query;
            
            // Get events from database
            const events = await this.eventModel.getAllAsync(filters);
            
            // Process events to ensure image_url exists
            const processedEvents = events.map(event => {
                // Ensure event has image_url
                if (!event.image_url && event.images && event.images.length > 0) {
                    event.image_url = event.images[0];
                } else if (!event.image_url) {
                    // Set default image based on type
                    const defaultImages = {
                        wedding: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=250&fit=crop',
                        corporate: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop',
                        birthday: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=250&fit=crop',
                        concert: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=250&fit=crop',
                        conference: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=250&fit=crop'
                    };
                    event.image_url = defaultImages[event.type] || 
                                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop';
                }

                // Normalize image paths and the images array
                event.image_url = this.normalizeImagePath(event.image_url);
                if (event.images && Array.isArray(event.images)) {
                    event.images = event.images.map(img => this.normalizeImagePath(img));
                }
                // Local fallback image (expanded pool)
                try {
                    const imagePool = ['/images/img1.jpg','/images/img2.jpg','/images/img3.jpg','/images/img4.jpg','/images/img5.jpg','/images/img6.svg','/images/img7.svg','/images/img8.svg','/images/img9.svg','/images/photo2.jpg','/images/photo3.jpg','/images/photo4.jpg'];
                    const idx = Math.abs(Number(event.id) || 0) % imagePool.length;
                    event.localFallback = imagePool[idx];
                } catch (e) {
                    event.localFallback = '/images/img1.jpg';
                }
                
                // Ensure location is a string
                if (event.location && typeof event.location === 'object') {
                    event.location = `${event.location.address || ''} ${event.location.city || ''}`.trim();
                }
                
                // Ensure capacity exists
                if (!event.capacity) {
                    event.capacity = 'Unlimited';
                }
                
                // Add formatted date
                if (event.date) {
                    event.formattedDate = new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                }
                
                return event;
            });
            
            // Debug log: show first few processed events image fields
            console.log('[EVENTS] processedEvents sample:', processedEvents.slice(0,5).map(e => ({ id: e.id, image_url: e.image_url, images: e.images, localFallback: e.localFallback })));

            res.render('pages/events', {
                user: req.session.user,
                events: processedEvents,
                filters: filters,
                currentPage: 'events'
            });
            
        } catch (error) {
            console.error('Error in getAllEvents:', error);
            res.render('pages/events', {
                user: req.session.user,
                events: [],
                filters: {},
                currentPage: 'events',
                error: 'Failed to load events'
            });
        }
    }

    // Get event details (Fixed)
    async getEventDetails(req, res) {
        try {
            const eventId = req.params.id;
            
            // Find event by ID
            const eventResults = await this.eventModel.findByIdAsync(eventId);
            
            if (!eventResults || eventResults.length === 0) {
                return res.status(404).render('pages/404', {
                    user: req.session.user,
                    currentPage: '404',
                    message: 'Event not found'
                });
            }
            
            const event = eventResults[0];
            
            // Ensure event has image_url
            if (!event.image_url && event.images && event.images.length > 0) {
                event.image_url = event.images[0];
            } else if (!event.image_url) {
                // Set default image based on type
                const defaultImages = {
                    wedding: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=400&fit=crop',
                    corporate: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
                    birthday: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=400&fit=crop',
                    concert: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop',
                    conference: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=400&fit=crop'
                };
                event.image_url = defaultImages[event.type] || 
                                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop';
            }

            // Normalize image paths and gallery
            event.image_url = this.normalizeImagePath(event.image_url);
            if (event.images && Array.isArray(event.images)) {
                event.images = event.images.map(img => this.normalizeImagePath(img));
            }
            // Local fallback image (expanded pool)
            try {
                const imagePool = ['/images/img1.jpg','/images/img2.jpg','/images/img3.jpg','/images/img4.jpg','/images/img5.jpg','/images/img6.svg','/images/img7.svg','/images/img8.svg','/images/img9.svg','/images/photo2.jpg','/images/photo3.jpg','/images/photo4.jpg'];
                const idx = Math.abs(Number(event.id) || 0) % imagePool.length;
                event.localFallback = imagePool[idx];
            } catch (e) {
                event.localFallback = '/images/img1.jpg';
            }
            
            // Add gallery images
            event.gallery_images = event.images && event.images.length > 0 
                ? event.images.slice(0, 5) 
                : [event.image_url];
            
            // Format location
            if (event.location && typeof event.location === 'object') {
                event.location_display = `${event.location.address || ''}, ${event.location.city || ''}`.trim();
            } else {
                event.location_display = event.location || 'Online';
            }
            
            // Format date and time
            if (event.date) {
                event.formatted_date = new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            
            event.formatted_time = event.time || 'To be announced';
            
            // Get available services for this event
            const services = await this.serviceModel.getAllAsync();
            
            // If AJAX/JSON request, return JSON
            if (req.xhr || (req.headers.accept && req.headers.accept.includes('json'))) {
                return res.json({ success: true, data: event });
            }

            res.render('pages/event-details', {
                user: req.session.user,
                event: event,
                services: services || [],
                currentPage: 'event-details'
            });
            
        } catch (error) {
            console.error('Error in getEventDetails:', error);
            res.status(500).render('pages/error', {
                user: req.session.user,
                currentPage: 'error',
                message: 'Failed to load event details'
            });
        }
    }

    // Get upcoming events for homepage (Fixed)
    async getUpcomingEvents(req, res, limit = 6) {
        try {
            const events = await this.eventModel.getUpcomingAsync(limit);
            
            // Process events to ensure image_url exists
            const processedEvents = events.map(event => {
                if (!event.image_url && event.images && event.images.length > 0) {
                    event.image_url = event.images[0];
                } else if (!event.image_url) {
                    // Set default image (local)
                    const defaultImages = {
                        wedding: '/images/img1.jpg',
                        corporate: '/images/img2.jpg',
                        birthday: '/images/img3.jpg'
                    };
                    event.image_url = defaultImages[event.type] || '/images/img1.jpg';
                }

                // Normalize path and images
                event.image_url = this.normalizeImagePath(event.image_url);
                if (event.images && Array.isArray(event.images)) {
                    event.images = event.images.map(img => this.normalizeImagePath(img));
                } else {
                    event.images = [];
                }

                // Local fallback (expanded pool)
                try {
                    const imagePool = ['/images/img1.jpg','/images/img2.jpg','/images/img3.jpg','/images/img4.jpg','/images/img5.jpg','/images/img6.svg','/images/img7.svg','/images/img8.svg','/images/img9.svg','/images/photo2.jpg','/images/photo3.jpg','/images/photo4.jpg'];
                    const idx = Math.abs(Number(event.id) || 0) % imagePool.length;
                    event.localFallback = imagePool[idx];
                } catch(e) { event.localFallback = '/images/img1.jpg'; }

                return event;
            });
            
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                // API request
                return res.json({
                    success: true,
                    data: processedEvents
                });
            }
            
            // Regular request
            return processedEvents;
            
        } catch (error) {
            console.error('Error in getUpcomingEvents:', error);
            
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching upcoming events'
                });
            }
            
            return [];
        }
    }

    // Search events (Fixed)
    async searchEvents(req, res) {
        try {
            const { keyword } = req.query;
            
            if (!keyword || keyword.trim() === '') {
                return res.redirect('/events');
            }
            
            const events = await this.eventModel.searchAsync(keyword.trim());
            
            // Process events
            const processedEvents = events.map(event => {
                if (!event.image_url && event.images && event.images.length > 0) {
                    event.image_url = event.images[0];
                } else if (!event.image_url) {
                    // Set default image
                    event.image_url = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop';
                }
                return event;
            });
            
            res.render('pages/events', {
                user: req.session.user,
                events: processedEvents,
                searchKeyword: keyword,
                currentPage: 'events'
            });
            
        } catch (error) {
            console.error('Error in searchEvents:', error);
            res.redirect('/events');
        }
    }

    // Create new event (admin/organizer only) - Fixed
    async createEvent(req, res) {
        try {
            if (!req.session.user || (req.session.user.role !== 'admin' && req.session.user.role !== 'organizer')) {
                return res.status(403).render('pages/403', {
                    user: req.session.user,
                    currentPage: '403'
                });
            }
            
            const eventData = {
                title: req.body.title,
                description: req.body.description,
                type: req.body.type,
                date: req.body.date,
                time: req.body.time || 'To be announced',
                location: req.body.location,
                price: parseFloat(req.body.price) || 0,
                capacity: parseInt(req.body.capacity) || 0,
                image_url: req.body.image_url || null,
                images: req.body.images ? JSON.parse(req.body.images) : [],
                organizer_id: req.session.user.id,
                status: 'upcoming',
                created_at: new Date(),
                updated_at: new Date()
            };
            
            // Validate required fields
            if (!eventData.title || !eventData.description || !eventData.type || !eventData.date) {
                return res.status(400).render('pages/error', {
                    user: req.session.user,
                    currentPage: 'error',
                    message: 'Missing required fields'
                });
            }
            
            // Create event in database
            const result = await this.eventModel.createAsync(eventData);
            
            if (!result) {
                throw new Error('Failed to create event');
            }
            
            res.redirect('/events');
            
        } catch (error) {
            console.error('Error in createEvent:', error);
            res.status(500).render('pages/error', {
                user: req.session.user,
                currentPage: 'error',
                message: 'Error creating event'
            });
        }
    }

    // Update event (admin/organizer only) - Fixed
    async updateEvent(req, res) {
        try {
            if (!req.session.user || (req.session.user.role !== 'admin' && req.session.user.role !== 'organizer')) {
                return res.status(403).render('pages/403', {
                    user: req.session.user,
                    currentPage: '403'
                });
            }
            
            const eventId = req.params.id;
            const eventData = {
                title: req.body.title,
                description: req.body.description,
                type: req.body.type,
                date: req.body.date,
                time: req.body.time,
                location: req.body.location,
                price: parseFloat(req.body.price) || 0,
                capacity: parseInt(req.body.capacity) || 0,
                image_url: req.body.image_url || null,
                images: req.body.images ? JSON.parse(req.body.images) : [],
                updated_at: new Date()
            };
            
            // Validate event exists and user has permission
            const existingEvent = await this.eventModel.findByIdAsync(eventId);
            if (!existingEvent || existingEvent.length === 0) {
                return res.status(404).render('pages/404', {
                    user: req.session.user,
                    currentPage: '404'
                });
            }
            
            // Check if user is organizer of this event or admin
            if (req.session.user.role !== 'admin' && existingEvent[0].organizer_id !== req.session.user.id) {
                return res.status(403).render('pages/403', {
                    user: req.session.user,
                    currentPage: '403'
                });
            }
            
            // Update event
            const result = await this.eventModel.updateAsync(eventId, eventData);
            
            if (!result) {
                throw new Error('Failed to update event');
            }
            
            res.redirect(`/event/${eventId}`);
            
        } catch (error) {
            console.error('Error in updateEvent:', error);
            res.status(500).render('pages/error', {
                user: req.session.user,
                currentPage: 'error',
                message: 'Error updating event'
            });
        }
    }

    // Delete event (admin only) - Fixed
    async deleteEvent(req, res) {
        try {
            if (!req.session.user || req.session.user.role !== 'admin') {
                return res.status(403).render('pages/403', {
                    user: req.session.user,
                    currentPage: '403'
                });
            }
            
            const eventId = req.params.id;
            
            // Delete event
            const result = await this.eventModel.deleteAsync(eventId);
            
            if (!result) {
                throw new Error('Failed to delete event');
            }
            
            res.redirect('/events');
            
        } catch (error) {
            console.error('Error in deleteEvent:', error);
            res.status(500).render('pages/error', {
                user: req.session.user,
                currentPage: 'error',
                message: 'Error deleting event'
            });
        }
    }

    // Get events by type - Fixed
    async getEventsByType(req, res) {
        try {
            const type = req.params.type;
            
            const events = await this.eventModel.getByTypeAsync(type);
            
            // Process events
            const processedEvents = events.map(event => {
                if (!event.image_url && event.images && event.images.length > 0) {
                    event.image_url = event.images[0];
                } else if (!event.image_url) {
                    // Set default image based on type
                    const defaultImages = {
                        wedding: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=250&fit=crop',
                        corporate: 'https://st.depositphotos.com/1056393/4876/i/450/depositphotos_48763103-stock-photo-speaker-at-business-conference-and.jpg',
                        birthday: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=250&fit=crop',
                        concert: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=250&fit=crop',
                        conference: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=250&fit=crop'
                    };
                    event.image_url = defaultImages[type] || 
                                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop';
                }
                return event;
            });
            
            res.render('pages/events', {
                user: req.session.user,
                events: processedEvents,
                filters: { type: type },
                currentPage: 'events'
            });
            
        } catch (error) {
            console.error('Error in getEventsByType:', error);
            res.render('pages/events', {
                user: req.session.user,
                events: [],
                filters: { type: req.params.type },
                currentPage: 'events',
                error: 'Failed to load events for this type'
            });
        }
    }

    // Helper method for API (NEW)
    async getEventsWithFilters(filters) {
        try {
            const events = await this.eventModel.getAllAsync(filters);
            
            // Process events and normalize images
            return events.map(event => {
                if (!event.image_url && event.images && event.images.length > 0) {
                    event.image_url = event.images[0];
                } else if (!event.image_url) {
                    // Set default image
                    const defaultImages = {
                        wedding: '/images/img1.jpg',
                        corporate: '/images/img2.jpg',
                        birthday: '/images/img3.jpg',
                        concert: '/images/img4.jpg',
                        conference: '/images/img5.jpg'
                    };
                    event.image_url = defaultImages[event.type] || '/images/img1.jpg';
                }

                // Normalize paths
                event.image_url = this.normalizeImagePath(event.image_url);
                if (event.images && Array.isArray(event.images)) {
                    event.images = event.images.map(img => this.normalizeImagePath(img));
                } else {
                    event.images = [];
                }

                // Add local fallback (expanded pool)
                try {
                    const imagePool = ['/images/img1.jpg','/images/img2.jpg','/images/img3.jpg','/images/img4.jpg','/images/img5.jpg','/images/img6.svg','/images/img7.svg','/images/img8.svg','/images/img9.svg','/images/photo2.jpg','/images/photo3.jpg','/images/photo4.jpg'];
                    const idx = Math.abs(Number(event.id) || 0) % imagePool.length;
                    event.localFallback = imagePool[idx];
                } catch (e) {
                    event.localFallback = '/images/img1.jpg';
                }

                // Keep lightweight for API
                return {
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    date: event.date,
                    time: event.time,
                    location: event.location,
                    price: event.price,
                    capacity: event.capacity,
                    image_url: event.image_url,
                    images: event.images,
                    localFallback: event.localFallback,
                    type: event.type
                };
            });
            
        } catch (error) {
            console.error('Error in getEventsWithFilters:', error);
            return [];
        }
    }
}

module.exports = EventController;