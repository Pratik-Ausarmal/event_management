
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
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


const requireOrganizer = (req, res, next) => {
    if (!req.session.user || (req.session.user.role !== 'organizer' && req.session.user.role !== 'admin')) {
        return res.status(403).send('Access denied');
    }
    next();
};

// Check if user owns resource or is admin
const requireOwnership = (modelName, paramName = 'id') => {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        
        if (req.session.user.role === 'admin') {
            return next();
        }
        
        // Check ownership logic would go here
        // This is a simplified version
        next();
    };
};

// Set user in response locals for templates
const setUserLocals = (req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
};

module.exports = {
    requireAuth,
    requireAdmin,
    requireOrganizer,
    requireOwnership,
    setUserLocals
};