// controllers/bookingController.js

const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Service = require('../models/Service');

class BookingController {
    constructor(db) {
        this.bookingModel = new Booking(db);
        this.eventModel = new Event(db);
        this.serviceModel = new Service(db);
    }

    // Create new booking
    createBooking(req, res) {
        const userId = req.session.user.id;
        const { eventId, guestCount, services } = req.body;

        this.eventModel.findById(eventId, (err, eventResults) => {
            if (err || eventResults.length === 0) {
                return res.status(404).send('Event not found');
            }

            const event = eventResults[0];
            let totalAmount = Number(event.price) || 0;

            const serviceIds = Array.isArray(services)
                ? services.map(id => Number(id))
                : [];

            const completeBooking = (extraAmount = 0) => {
                totalAmount += extraAmount;

                const bookingData = {
                    user_id: userId,
                    event_id: eventId,
                    guest_count: Number(guestCount),
                    budget: totalAmount,
                    services: JSON.stringify(serviceIds)
                };

                this.bookingModel.create(bookingData, (err) => {
                    if (err) {
                        console.error("Error inserting booking:", err);
                        return res.status(500).send('Error creating booking');
                    }
                    res.redirect('/dashboard');
                });
            };

            if (serviceIds.length > 0) {
                this.serviceModel.calculateTotal(serviceIds, (err, results) => {
                    if (err) {
                        console.error("Error calculating services total:", err);
                        return res.status(500).send('Error calculating services total');
                    }
                    const serviceTotal = Number(results[0]?.total || 0);
                    completeBooking(serviceTotal);
                });
            } else {
                completeBooking();
            }
        });
    }

    // Get user bookings
    getUserBookings(req, res) {
        const userId = req.session.user.id;

        this.bookingModel.getByUser(userId, (err, bookings = []) => {
            if (err) {
                console.error("Error fetching user bookings:", err);
                return res.status(500).send("Error fetching bookings");
            }

            if (req.xhr || (req.headers.accept && req.headers.accept.includes('json'))) {
                return res.json(bookings);
            }

            return bookings;
        });
    }

    // Get dashboard stats and load page
    getDashboardData(req, res) {
        const userId = req.session.user.id;

        this.bookingModel.getByUser(userId, (err, bookings = []) => {
            if (err) {
                console.error("Error fetching bookings:", err);
                bookings = [];
            }

            this.bookingModel.getStats(userId, (err, statsResults = []) => {
                if (err) {
                    console.error("Error fetching stats:", err);
                    statsResults = [{ total_bookings: 0, confirmed_bookings: 0, total_spent: 0 }];
                }

                const stats = statsResults[0] || {};

                res.render('pages/dashboard', {
                    user: req.session.user,
                    bookings,
                    stats,
                    currentPage: 'dashboard'
                });
            });
        });
    }

    // Get booking details
    getBookingDetails(req, res) {
        const bookingId = req.params.id;
        const userId = req.session.user.id;

        this.bookingModel.findById(bookingId, (err, results) => {
            if (err || results.length === 0) {
                return res.status(404).send('Booking not found');
            }

            const booking = results[0];

            if (booking.user_id !== userId && req.session.user.role !== 'admin') {
                return res.status(403).send('Access denied');
            }

            this.eventModel.findById(booking.event_id, (err, eventResults = []) => {

                let serviceDetails = [];
                let serviceIds = [];

                try {
                    serviceIds = booking.services ? JSON.parse(booking.services) : [];
                } catch (e) {
                    serviceIds = [];
                }

                if (serviceIds.length > 0) {
                    this.serviceModel.getAll((err, allServices = []) => {
                        if (!err) {
                            serviceDetails = allServices.filter(s =>
                                serviceIds.includes(s.id)
                            );
                        }
                        renderBooking();
                    });
                } else {
                    renderBooking();
                }

                function renderBooking() {
                    res.render('pages/booking-details', {
                        user: req.session.user,
                        booking,
                        event: eventResults[0] || {},
                        services: serviceDetails,
                        currentPage: 'bookings'
                    });
                }
            });
        });
    }

    // Cancel booking
    cancelBooking(req, res) {
        const bookingId = req.params.id;
        const userId = req.session.user.id;

        this.bookingModel.findById(bookingId, (err, results) => {
            if (err || results.length === 0) {
                return res.status(404).send('Booking not found');
            }

            const booking = results[0];

            if (booking.user_id !== userId && req.session.user.role !== 'admin') {
                return res.status(403).send('Access denied');
            }

            this.bookingModel.updateStatus(bookingId, 'cancelled', (err) => {
                if (err) {
                    console.error("Error cancelling booking:", err);
                    return res.status(500).send('Error cancelling booking');
                }

                res.redirect('/dashboard');
            });
        });
    }

    // Update booking status (admin)
    updateBookingStatus(req, res) {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).send('Access denied');
        }

        const bookingId = req.params.id;
        const { status } = req.body;

        this.bookingModel.updateStatus(bookingId, status, (err) => {
            if (err) {
                console.error("Error updating booking status:", err);
                return res.status(500).send('Error updating booking status');
            }

            res.redirect('/admin/bookings');
        });
    }
}

module.exports = BookingController;
