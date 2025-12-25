const express = require('express');
const router = express.Router();
const db = require('../db');

// ==========================================
// PUBLIC MOVIE ROUTES (Read-Only)
// ==========================================

// 1. Trending
router.get('/api/movies/trending', (req, res) => {
    const sql = `
        SELECT m.movie_id, m.title, m.poster, m.release_year, 
               COUNT(DISTINCT w.user_id) as view_count, 
               ROUND(IFNULL(AVG(r.rating), 0), 1) as avg_rating 
        FROM Movie m 
        LEFT JOIN Watchlist w ON m.movie_id = w.movie_id AND w.watch_status = 'Completed' 
        LEFT JOIN Review r ON m.movie_id = r.movie_id 
        WHERE m.movie_id NOT IN (11, 16, 17) 
        GROUP BY m.movie_id 
        ORDER BY view_count DESC, avg_rating DESC LIMIT 6`;
    db.query(sql, (err, results) => { 
        if (err) return res.status(500).json({error:err.message}); 
        res.json(results); 
    });
});

// 2. Top Rated
router.get('/api/movies/top-rated', (req, res) => {
    const sql = `
        SELECT m.movie_id, m.title, m.poster, m.release_year, 
               COUNT(DISTINCT w.user_id) as view_count, 
               ROUND(IFNULL(AVG(r.rating), 0), 1) as avg_rating 
        FROM Movie m 
        LEFT JOIN Review r ON m.movie_id = r.movie_id 
        LEFT JOIN Watchlist w ON m.movie_id = w.movie_id AND w.watch_status = 'Completed' 
        WHERE m.movie_id NOT IN (11, 16, 17) 
        GROUP BY m.movie_id 
        ORDER BY avg_rating DESC, view_count DESC LIMIT 6`;
    db.query(sql, (err, results) => { 
        if (err) return res.status(500).json({error:err.message}); 
        res.json(results); 
    });
});

// 3. Slider Movies
router.get('/api/movies/slider', (req, res) => {
    const sql = `SELECT * FROM Movie WHERE movie_id IN (11, 16, 17) ORDER BY FIELD(movie_id, 11, 16, 17)`;
    db.query(sql, (err, results) => { 
        if (err) return res.status(500).json({error:err.message}); 
        res.json(results); 
    });
});

// 4. Browse / Search
router.get('/api/movies', (req, res) => {
    const { search, genre, rating, year } = req.query;
    let sql = `
        SELECT m.*, ROUND(IFNULL(AVG(r.rating), 0), 1) as avg_rating, 
               GROUP_CONCAT(g.genre_name) as genre_name 
        FROM Movie m 
        LEFT JOIN Review r ON m.movie_id = r.movie_id 
        LEFT JOIN MovieGenre mg ON m.movie_id = mg.movie_id 
        LEFT JOIN Genre g ON mg.genre_id = g.genre_id 
        WHERE 1=1`;
    
    let params = [];
    if (search) { sql += ` AND m.title LIKE ?`; params.push(`%${search}%`); }
    if (genre) { sql += ` AND g.genre_name = ?`; params.push(genre); }
    if (year) { sql += ` AND m.release_year = ?`; params.push(year); }
    
    sql += ` GROUP BY m.movie_id`;
    
    if (rating) { sql += ` HAVING avg_rating >= ?`; params.push(rating); }
    
    sql += ` ORDER BY m.release_year DESC`;
    
    db.query(sql, params, (err, results) => { 
        if (err) return res.status(500).json({error:err.message}); 
        res.json(results); 
    });
});

// 5. Single Movie Details
router.get('/api/movies/:id', (req, res) => {
    const sql = `
        SELECT m.*, GROUP_CONCAT(DISTINCT g.genre_name SEPARATOR ', ') as genres, 
               ROUND(IFNULL(AVG(r.rating), 0), 1) as avg_rating 
        FROM Movie m 
        LEFT JOIN MovieGenre mg ON m.movie_id = mg.movie_id 
        LEFT JOIN Genre g ON mg.genre_id = g.genre_id 
        LEFT JOIN Review r ON m.movie_id = r.movie_id 
        WHERE m.movie_id = ? 
        GROUP BY m.movie_id`;
    db.query(sql, [req.params.id], (err, results) => { 
        if (err) return res.status(500).json({error:err.message}); 
        if(results.length===0) return res.status(404).json({error:"Not Found"}); 
        res.json(results[0]); 
    });
});

// 6. Get Reviews (FIXED: Added JOIN to Account table for username)
router.get('/api/movies/:id/reviews', (req, res) => {
    const sql = `
        SELECT r.*, a.username 
        FROM Review r 
        JOIN User u ON r.user_id = u.user_id 
        JOIN Account a ON u.account_id = a.account_id
        WHERE r.movie_id = ? 
        ORDER BY r.review_datetime DESC`;
    
    db.query(sql, [req.params.id], (err, results) => { 
        if (err) {
            console.error("Reviews Error:", err);
            return res.status(500).json({error:err.message}); 
        }
        res.json(results); 
    });
});

module.exports = router;