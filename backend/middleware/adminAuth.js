// middleware/adminAuth.js
module.exports = function (req, res, next) {
    // Determine if this is an API request or a page request
    const isApiRequest = req.xhr || 
                         (req.headers.accept && req.headers.accept.indexOf('application/json') > -1) ||
                         req.path.includes('/api/');
    
    if (!req.session || !req.session.user) {
        // if API request, return JSON
        if (isApiRequest) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        // if page request, redirect to login
        return res.redirect('/log_sign-option.html');
    }
    
    // Check if user role is Admin (not 'admin' - case matters in DB)
    if (req.session.user.role !== 'Admin') {
        if (isApiRequest) {
            return res.status(403).json({ success: false, message: 'Admin only' });
        }
        return res.redirect('/log_sign-option.html');
    }
    next();
};
