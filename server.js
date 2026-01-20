// server.js - FULL UPDATED AND MERGED

const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// ==================== DATABASE CONNECT & INIT ====================

let db;
function connectToDatabase() {
    db = mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'event_management',
        port: process.env.DB_PORT || 3306
    });

    db.connect(err => {
        if (err) {
            console.error('❌ Database connection failed:', err.message);
            setTimeout(connectToDatabase, 5000);
            return;
        }
        console.log('✅ Connected to MySQL database');
        initializeDatabase();
    });

    db.on('error', err => {
        console.error('Database error:', err.message);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('Reconnecting to database...');
            connectToDatabase();
        }
    });
}

function initializeDatabase() {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('user', 'organizer', 'admin') DEFAULT 'user',
            full_name VARCHAR(100),
            phone VARCHAR(20),
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    const createEventsTable = `
        CREATE TABLE IF NOT EXISTS events (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            type ENUM('wedding', 'corporate', 'birthday', 'concert', 'conference', 'other') NOT NULL,
            date DATE NOT NULL,
            time TIME NOT NULL,
            location VARCHAR(255) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            capacity INT,
            image_url VARCHAR(500),
            organizer_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL
        )
    `;
    const createBookingsTable = `
        CREATE TABLE IF NOT EXISTS bookings (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            event_id INT NOT NULL,
            guest_count INT NOT NULL,
            budget DECIMAL(10,2) NOT NULL,
            services TEXT,
            status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
        )
    `;

    db.query(createUsersTable, err => {
        if (err) return console.error('Error creating users table:', err.message);
        db.query(createEventsTable, err => {
            if (err) return console.error('Error creating events table:', err.message);
            db.query(createBookingsTable, err => {
                if (err) return console.error('Error creating bookings table:', err.message);
                console.log('✅ All tables are ready');
                checkAndInsertSampleData();
            });
        });
    });
}

function checkAndInsertSampleData() {
    db.query('SELECT COUNT(*) as count FROM users', (err, results) => {
        if (err) return console.error(err);
        if (results[0].count === 0) insertSampleData();
    });
}

async function insertSampleData() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const users = [
        ['admin', 'admin@eventpro.com', hashedPassword, 'admin', 'Administrator', '+1234567890'],
        ['john_doe', 'john@example.com', hashedPassword, 'user', 'John Doe', '+1555123456'],
        ['pratik', 'pratikausarmal160@gmail.com', hashedPassword, 'user', 'Pratik', '+919876543210'],
        ['event_org', 'organizer@example.com', hashedPassword, 'organizer', 'Event Organizer', '+1555987654']
    ];
    users.forEach(user => {
        db.query(
            'INSERT IGNORE INTO users (username, email, password, role, full_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
            user,
            err => { if (err) console.error('Insert sample user error:', err.message); }
        );
    });
}

connectToDatabase();

// ==================== MIDDLEWARE ====================

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// ✅ Required for Render / reverse proxy
app.set("trust proxy", 1);

app.use(session({
    name: "event.sid",
    secret: process.env.SESSION_SECRET || "event-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true,
        secure: true,      // Render uses HTTPS
        sameSite: "none"   // Required for cross-site cookies on cloud
    }
}));

app.use((req, res, next) => {
    req.db = db;
    next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ==================== AUTH MIDDLEWARE ====================

const requireAuth = (req, res, next) => {
    // For JSON/AJAX requests, return 401 instead of redirecting to login so fetch calls receive a proper status
    if (!req.session.user) {
        if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        return res.redirect('/login');
    }
    next();
};
const requireAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send('Access denied');
    }
    next();
};

// ==================== ROUTES: PUBLIC ====================

app.get('/', (req, res) => {
    const query = 'SELECT * FROM events WHERE date >= CURDATE() ORDER BY date ASC LIMIT 6';
    db.query(query, (err, events) => {
        if (err) events = [];
        res.render('pages/index', { user: req.session.user, events, currentPage: 'home' });
    });
});

app.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.render('pages/login', { user: null, error: null, success: null, currentPage: 'login' });
});

app.get('/register', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.render('pages/register', { user: null, error: null, success: null, currentPage: 'register' });
});

// ==================== AUTH HANDLERS ====================

app.post('/auth/register', async (req, res) => {
    const { username, email, password, confirmPassword, fullName, phone, role, terms } = req.body;
    const errors = [];
    if (!terms) errors.push('You must agree to the Terms & Conditions');
    if (!fullName || !username || !email || !password || !confirmPassword) errors.push('All fields required');
    if (password !== confirmPassword) errors.push('Passwords do not match');
    if (password.length < 6) errors.push('Password must be at least 6 characters');
    if (!email.includes('@')) errors.push('Invalid email');
    if (errors.length) return res.render('pages/register', { user: null, error: errors[0], success: null, currentPage: 'register' });

    db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], async (err, results) => {
        if (err) return res.render('pages/register', { user: null, error: 'DB error', success: null, currentPage: 'register' });
        if (results.length > 0) return res.render('pages/register', { user: null, error: 'User exists', success: null, currentPage: 'register' });

        const hashed = await bcrypt.hash(password, 10);
        const userRole = role === 'organizer' ? 'organizer' : 'user';
        db.query(
            'INSERT INTO users (username, email, password, role, full_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, hashed, userRole, fullName, phone],
            (err, result) => {
                if (err) return res.render('pages/register', { user: null, error: 'DB insert error', success: null, currentPage: 'register' });
                req.session.user = { id: result.insertId, username, email, role: userRole, full_name: fullName };
                res.redirect('/dashboard');
            });
    });
});

app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.render('pages/login', { user: null, error: 'Email and password required', success: null, currentPage: 'login' });
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err || results.length === 0) return res.render('pages/login', { user: null, error: 'Invalid credentials', success: null, currentPage: 'login' });
        const user = results[0];
        if (!(await bcrypt.compare(password, user.password))) {
            return res.render('pages/login', { user: null, error: 'Invalid credentials', success: null, currentPage: 'login' });
        }
        req.session.user = { id: user.id, username: user.username, email: user.email, role: user.role, full_name: user.full_name };
        res.redirect('/dashboard');
    });
});

// ==================== EVENTS PAGES ====================

app.get('/events', (req, res) => {
    const { type, date, min_price, max_price, search } = req.query;
    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];
    if (type && type !== 'all') { query += ' AND type = ?'; params.push(type); }
    if (date) { query += ' AND date = ?'; params.push(date); }
    if (min_price) { query += ' AND price >= ?'; params.push(min_price); }
    if (max_price) { query += ' AND price <= ?'; params.push(max_price); }
    if (search) { query += ' AND (title LIKE ? OR description LIKE ? OR location LIKE ?)'; const sq = `%${search}%`; params.push(sq,sq,sq); }
    query += ' ORDER BY date ASC';

    db.query(query, params, (err, events) => {
        if (err) events = [];
        res.render('pages/events', { user: req.session.user, events, filters: req.query, currentPage: 'events' });
    });
});

app.get('/event/:id', (req, res) => {
    db.query('SELECT * FROM events WHERE id = ?', [req.params.id], (err, results) => {
        if (err || results.length === 0) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(404).json({ success: false, message: 'Event not found' });
            }
            return res.status(404).render('pages/404', { user: req.session.user, currentPage: '404' });
        }

        const event = results[0];
        // If JSON requested (AJAX), return JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({ success: true, data: event });
        }

        // Default: render page
        res.render('pages/event-details', { user: req.session.user, event, currentPage: 'event-details' });
    });
});

// ==================== DASHBOARD & BOOKINGS ====================

app.get('/dashboard', requireAuth, (req, res) => {
    if (!db || db.state === 'disconnected') return res.render('pages/dashboard', { user: req.session.user, bookings: [], stats: { total_bookings:0, confirmed_bookings:0, total_spent:0 }, currentPage:'dashboard' });

    const bookingsQuery = `
        SELECT b.*, e.title AS event_title, e.date AS event_date, e.location AS event_location, e.image_url
        FROM bookings b JOIN events e ON b.event_id = e.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
        LIMIT 5
    `;
    db.query(bookingsQuery, [req.session.user.id], (err, bookings) => {
        if (err) { bookings = []; console.error(err); }
        const statsQuery = `
            SELECT COUNT(*) AS total_bookings,
            SUM(CASE WHEN status='confirmed' THEN 1 ELSE 0 END) AS confirmed_bookings,
            COALESCE(SUM(budget),0) AS total_spent
            FROM bookings WHERE user_id = ?
        `;
        db.query(statsQuery, [req.session.user.id], (err, statsResults) => {
            if (err) { statsResults = [{ total_bookings:0, confirmed_bookings:0, total_spent:0 }]; console.error(err); }
            res.render('pages/dashboard', {
                user: req.session.user,
                bookings,
                stats: statsResults[0],
                currentPage: 'dashboard'
            });
        });
    });
});

//calendar model (API to return booked dates)
app.get('/api/booked-dates', requireAuth, (req, res) => {
    console.log(`[API] /api/booked-dates requested by user ${req.session && req.session.user ? req.session.user.id : 'unknown'}`);
    const sql = `
        SELECT DISTINCT e.date AS event_date
        FROM bookings b
        JOIN events e ON b.event_id = e.id
        WHERE b.status != 'cancelled'
        ORDER BY e.date ASC
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching booked dates:', err);
            return res.status(500).json({ success: false, message: 'Error fetching booked dates' });
        }
        const dates = results.map(r => {
            const d = r.event_date;
            const str = (d instanceof Date) ? d.toISOString().split('T')[0] : d;
            return {
                title: 'Booked',
                start: str,
                allDay: true
            };
        });
        console.log(`[API] returning ${dates.length} booked date objects`);
        res.json(dates);
    });
});


// ==================== BOOKING CREATE ====================

app.post('/booking/create', requireAuth, (req, res) => {
    const { eventId, guestCount, specialRequests } = req.body;
    const userId = req.session.user.id;

    // Basic validation
    if (!eventId || !guestCount) {
        if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
            return res.status(400).json({ success: false, message: 'Missing eventId or guestCount' });
        }
        return res.status(400).send('Missing eventId or guestCount');
    }

    db.query('SELECT price FROM events WHERE id = ?', [eventId], (err, results) => {
        if (err) {
            console.error('Error fetching event price:', err);
            if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            return res.status(500).send('Database error');
        }
        if (!results || results.length === 0) {
            if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
                return res.status(404).json({ success: false, message: 'Event not found' });
            }
            return res.status(404).send('Event not found');
        }

        const guests = Math.max(1, parseInt(guestCount, 10) || 1);
        const totalBudget = results[0].price * guests;
        const sql = 'INSERT INTO bookings (user_id, event_id, guest_count, budget, services) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [userId, eventId, guests, totalBudget, JSON.stringify(specialRequests||[])], (err, result) => {
            if (err) {
                console.error('Error inserting booking:', err);
                if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
                    return res.status(500).json({ success: false, message: 'Error creating booking' });
                }
                return res.status(500).send('Error creating booking');
            }

            // If client expects JSON (AJAX), return JSON response
            if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
                return res.status(201).json({ success: true, bookingId: result.insertId, message: 'Booking created' });
            }

            // Fallback to original behavior for form submits
            return res.redirect('/dashboard');
        });
    });
});

// … rest of your routes (my bookings, profile, logout, admin etc.) …
// ==================== MY BOOKINGS ====================

app.get('/my-bookings', requireAuth, (req, res) => {
    if (!db || db.state === 'disconnected') {
        return res.render('pages/my-bookings', {
            user: req.session.user,
            bookings: [],
            currentPage: 'my-bookings'
        });
    }

    const query = `
        SELECT b.*, e.title AS event_title, e.date AS event_date, e.location AS event_location, e.image_url
        FROM bookings b
        JOIN events e ON b.event_id = e.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
    `;
    db.query(query, [req.session.user.id], (err, bookings) => {
        if (err) {
            console.error('Error fetching bookings:', err);
            bookings = [];
        }
        
        res.render('pages/my-bookings', {
            user: req.session.user,
            bookings,
            currentPage: 'my-bookings'
        });
    });
});


// book event 

app.get('/book-event', requireAuth, (req, res) => {
    res.render('pages/book-event', {
        user: req.session.user,
        currentPage: 'book-event'
    });
});

//payment route
app.get('/payments', requireAuth, (req, res) => {
    res.render('pages/payments', {
        user: req.session.user,
        currentPage: 'payments'
    });
});

//notification route
app.get('/notifications', requireAuth, (req, res) => {
    res.render('pages/notifications', {
        user: req.session.user,
        currentPage: 'notifications'
    });
});

//profile setting

app.get('/profile-settings', requireAuth, (req, res) => {
    res.render('pages/profile-settings', {
        user: req.session.user,
        currentPage: 'profile-settings'
    });
});

// ==================== PROFILE ====================

app.get('/profile', requireAuth, (req, res) => {
    if (!db || db.state === 'disconnected') {
        return res.render('pages/profile', {
            user: req.session.user,
            profile: {},
            currentPage: 'profile',
            successMessage: null
        });
    }

    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [req.session.user.id], (err, results) => {
        if (err || results.length === 0) {
            return res.redirect('/dashboard');
        }

        res.render('pages/profile', {
            user: req.session.user,
            profile: results[0],
            currentPage: 'profile',
            successMessage: null,
            error: null
        });
    });
});

app.post('/profile/update', requireAuth, (req, res) => {
    const { full_name, phone, address } = req.body;
    const userId = req.session.user.id;

    if (!db || db.state === 'disconnected') {
        return res.render('pages/profile', {
            user: req.session.user,
            profile: { full_name, phone, address },
            currentPage: 'profile',
            successMessage: null,
            error: 'Database connection failed'
        });
    }

    const query = 'UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?';
    db.query(query, [full_name, phone || '', address || '', userId], (err) => {
        if (err) {
            console.error('Profile update error:', err);
            return res.render('pages/profile', {
                user: req.session.user,
                profile: { full_name, phone, address },
                currentPage: 'profile',
                successMessage: null,
                error: 'Error updating profile'
            });
        }

        req.session.user.full_name = full_name;

        db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
            if (err || results.length === 0) results = [{}];
            res.render('pages/profile', {
                user: req.session.user,
                profile: results[0],
                currentPage: 'profile',
                successMessage: 'Profile updated successfully!',
                error: null
            });
        });
    });
});

// ==================== LOGOUT ====================

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) console.error('Logout error:', err);
        res.redirect('/');
    });
});

// ==================== ADMIN PANEL ====================

app.get('/admin', requireAdmin, (req, res) => {
    const queries = {
        users: 'SELECT COUNT(*) AS count FROM users',
        events: 'SELECT COUNT(*) AS count FROM events',
        bookings: 'SELECT COUNT(*) AS count FROM bookings',
        revenue: 'SELECT COALESCE(SUM(budget), 0) AS total FROM bookings WHERE status = "confirmed"'
    };

    Promise.all([
        new Promise(resolve => db.query(queries.users, (err, r) => resolve(r[0].count))),
        new Promise(resolve => db.query(queries.events, (err, r) => resolve(r[0].count))),
        new Promise(resolve => db.query(queries.bookings, (err, r) => resolve(r[0].count))),
        new Promise(resolve => db.query(queries.revenue, (err, r) => resolve(r[0].total)))
    ]).then(([userCount, eventCount, bookingCount, revenue]) => {
        res.render('admin/dashboard', {
            user: req.session.user,
            stats: { userCount, eventCount, bookingCount, revenue },
            currentPage: 'admin'
        });
    }).catch(err => {
        console.error('Admin panel error:', err);
        res.status(500).send('Error loading admin panel');
    });
});

// ==================== STATIC PAGES ====================

app.get('/about', (req, res) => {
    res.render('pages/about', {
        user: req.session.user,
        currentPage: 'about'
    });
});

app.get('/contact', (req, res) => {
    res.render('pages/contact', {
        user: req.session.user,
        currentPage: 'contact',
        successMessage: null
    });
});

app.get('/gallery', (req, res) => {
    res.render('pages/gallery', {
        user: req.session.user,
        currentPage: 'gallery'
    });
});

// ==================== ERROR HANDLING ====================

app.use((req, res) => {
    res.status(404).render('pages/404', {
        user: req.session.user,
        currentPage: '404'
    });
});

app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).render('pages/500', {
        user: req.session.user,
        currentPage: '500',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`
    🚀 Server running on http://localhost:${PORT}
    📍 Dashboard: http://localhost:${PORT}/dashboard
    📍 Login: http://localhost:${PORT}/login
    📍 Register: http://localhost:${PORT}/register
    `);
});
