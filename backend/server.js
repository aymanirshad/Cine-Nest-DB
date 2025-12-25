const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./db');

const app = express();
const cors = require('cors');

app.use(cors()); // This allows ALL requests from frontend

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Setup
app.use(session({
    secret: 'semester_project_secret',
    resave: false,
    saveUninitialized: true
}));

const adminAuth = require('./middleware/adminAuth');

// EXPLICIT ROUTES FOR ADMIN PAGES (must come BEFORE route handlers)
app.get('/admin/dashboard', adminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/admin/manage_movies', adminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'manage_movies.html'));
});

app.get('/admin/reports', adminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reports.html'));
});

// Routes (Link the files for your teammates)
const authRoutes = require('./routes/auth');
const socialRoutes = require('./routes/social');
const movieRoutes = require('./routes/movies');
const adminRoutes = require('./routes/admin');

app.use('/', authRoutes);
app.use('/social', socialRoutes);
app.use('/', movieRoutes);
app.use('/', adminRoutes);

// Serve Static Files (Your HTML/CSS in 'public' folder)
// IMPORTANT: This must come AFTER route handlers so that explicit routes take precedence
app.use(express.static(path.join(__dirname, 'public')));

// Start Server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});