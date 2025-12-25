const express = require("express");
const router = express.Router();
const db = require("../db");
const adminAuth = require("../middleware/adminAuth");



/*const adminAuth = (req, res, next) => {
    // Check if the "Safe" has a user in it
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        next(); // You are an admin, proceed!
    } else {
        res.status(403).json({ error: "Access Denied: Admins only" });
    }
}; */


// ===============================
//  GET ALL USERS
// ===============================
router.get("/admin/users", adminAuth, (req, res) => { 
    const sql = `
        SELECT 
            u.user_id, 
            a.account_id,  
            a.username, 
            u.first_name, 
            u.last_name, 
            u.email,
            a.role
        FROM User u
        JOIN Account a ON u.account_id = a.account_id;
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error", details: err });
        res.json(results);
    });
});


// ===============================
//  BAN/DEACTIVATE USER
// ===============================
router.put("/admin/users/ban/:accountId", adminAuth, (req, res) => {
    const { accountId } = req.params;

    const sql = `UPDATE Account SET role = 'Banned' WHERE account_id = ?`;

    db.query(sql, [accountId], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error", details: err });

        // log action
        const logSql = `INSERT INTO AuditLog (admin_id, action, target_table) VALUES (?, ?, ?)`;
        db.query(logSql, [req.session.user.account_id, `Banned user account_id ${accountId}`, "User"]);

        res.json({ message: "User banned successfully" });
    });
});


// ===============================
//  UNBAN USER
// ===============================
router.put("/admin/users/unban/:accountId", adminAuth, (req, res) => {
    const { accountId } = req.params;

    const sql = `UPDATE Account SET role = 'User' WHERE account_id = ?`;

    db.query(sql, [accountId], (err) => {
        if (err) return res.status(500).json({ error: "Database error", details: err });

        db.query(
            `INSERT INTO AuditLog (admin_id, action, target_table) VALUES (?, ?, ?)`,
            [req.session.user.account_id, `Unbanned user account_id ${accountId}`, "User"]
        );

        res.json({ message: "User unbanned successfully" });
    });
});


// ===============================
//  DELETE USER (Admin Level)
// ===============================
router.delete("/admin/users/:accountId", adminAuth, (req, res) => {
    const { accountId } = req.params;

    const sql = `DELETE FROM Account WHERE account_id = ?`;

    db.query(sql, [accountId], (err) => {
        if (err) return res.status(500).json({ error: "Database error", details: err });

        db.query(
            `INSERT INTO AuditLog (admin_id, action, target_table) VALUES (?, ?, ?)`,
            [req.session.user.account_id, `Deleted user ${accountId}`, "Account"]
        );

        res.json({ message: "User deleted successfully" });
    });
});


// ===============================
//  GET ALL MOVIES
// ===============================
router.get("/admin/movies", adminAuth, (req, res) => {
    const sql = `
        SELECT 
            m.movie_id, m.title, m.synopsis, m.release_year, m.poster,
            GROUP_CONCAT(g.genre_name SEPARATOR ', ') AS genres
        FROM Movie m
        LEFT JOIN MovieGenre mg ON m.movie_id = mg.movie_id
        LEFT JOIN Genre g ON mg.genre_id = g.genre_id
        GROUP BY m.movie_id;
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});


// ===============================
//  ADD MOVIE
// ===============================
router.post("/admin/movies", adminAuth, (req, res) => {
    const { title, synopsis, release_year, poster } = req.body;

    const sql = `INSERT INTO Movie (title, synopsis, release_year, poster) VALUES (?, ?, ?, ?)`;

    db.query(sql, [title, synopsis, release_year, poster], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        db.query(
            `INSERT INTO AuditLog (admin_id, action, target_table) VALUES (?, ?, ?)`,
            [req.session.user.account_id, `Added movie ${title}`, "Movie"]
        );

        res.json({ message: "Movie added", movie_id: result.insertId });
    });
});


// ===============================
//  UPDATE MOVIE
// ===============================
router.put("/admin/movies/:movieId", adminAuth, (req, res) => {
    const { movieId } = req.params;
    const { title, synopsis, release_year, poster } = req.body;

    const sql = `
        UPDATE Movie 
        SET title=?, synopsis=?, release_year=?, poster=? 
        WHERE movie_id=?`;

    db.query(sql, [title, synopsis, release_year, poster, movieId], (err) => {
        if (err) return res.status(500).json({ error: err });

        db.query(
            `INSERT INTO AuditLog (admin_id, action, target_table) VALUES (?, ?, ?)`,
            [req.session.user.account_id, `Updated movie ${movieId}`, "Movie"]
        );

        res.json({ message: "Movie updated" });
    });
});


// ===============================
//  DELETE MOVIE
// ===============================
router.delete("/admin/movies/:movieId", adminAuth, (req, res) => {
    const { movieId } = req.params;

    const sql = `DELETE FROM Movie WHERE movie_id = ?`;

    db.query(sql, [movieId], (err) => {
        if (err) return res.status(500).json({ error: err });

        db.query(
            `INSERT INTO AuditLog (admin_id, action, target_table) VALUES (?, ?, ?)`,
            [req.session.user.account_id, `Deleted movie ${movieId}`, "Movie"]
        );

        res.json({ message: "Movie deleted" });
    });
});


// ===============================
//  GET ALL REVIEWS
// ===============================
router.get("/admin/reviews", adminAuth, (req, res) => {
    const sql = `
        SELECT 
            r.review_id, r.rating, r.review_text, r.review_datetime,
            u.username, m.title AS movie
        FROM Review r
        JOIN User u ON r.user_id = u.user_id
        JOIN Account a ON u.account_id = a.account_id
        JOIN Movie m ON r.movie_id = m.movie_id;
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});


// ===============================
//  DELETE REVIEW
// ===============================
router.delete("/admin/reviews/:reviewId", adminAuth, (req, res) => {
    const { reviewId } = req.params;

    const sql = `DELETE FROM Review WHERE review_id = ?`;

    db.query(sql, [reviewId], (err) => {
        if (err) return res.status(500).json({ error: err });

        db.query(
            `INSERT INTO AuditLog (admin_id, action, target_table) VALUES (?, ?, ?)`,
            [req.session.user.account_id, `Deleted Review ${reviewId}`, "Review"]
        );

        res.json({ message: "Review deleted" });
    });
});


// ===============================
//  GET RESTRICTED WORDS
// ===============================
router.get("/admin/restricted", adminAuth, (req, res) => {
    db.query(`SELECT * FROM RestrictedWord`, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});


// ===============================
//  ADD RESTRICTED WORD
// ===============================
router.post("/admin/restricted", adminAuth, (req, res) => {
    const { word } = req.body;

    const sql = `INSERT INTO RestrictedWord (word, admin_id) VALUES (?, ?)`;

    db.query(sql, [word, req.session.user.account_id], (err) => {
        if (err) return res.status(500).json({ error: err });

        db.query(
            `INSERT INTO AuditLog (admin_id, action, target_table) VALUES (?, ?, ?)`,
            [req.session.user.account_id, `Added restricted word: ${word}`, "RestrictedWord"]
        );

        res.json({ message: "Restricted word added" });
    });
});


// ===============================
//  DELETE RESTRICTED WORD
// ===============================
router.delete("/admin/restricted/:wordId", adminAuth, (req, res) => {
    const { wordId } = req.params;

    const sql = `DELETE FROM RestrictedWord WHERE word_id = ?`;

    db.query(sql, [wordId], (err) => {
        if (err) return res.status(500).json({ error: err });

        db.query(
            `INSERT INTO AuditLog (admin_id, action, target_table) VALUES (?, ?, ?)`,
            [req.session.user.account_id, `Removed restricted word ID ${wordId}`, "RestrictedWord"]
        );

        res.json({ message: "Restricted word removed" });
    });
});


// ===============================
//  GET ALL REPORTS
// ===============================
router.get("/admin/reports/history", adminAuth, (req, res) => { 
    db.query(`SELECT * FROM report`, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});


// ===============================
//  EXPORT REPORT 
// ===============================
router.post("/admin/reports/export", adminAuth, (req, res) => {
    const { report_type, format } = req.body;

    db.query(
        `INSERT INTO report (report_type, reason, generation_date, status, export_format, admin_id)
         VALUES (?, 'Requested by admin', NOW(), 'Completed', ?, ?)`,
        [report_type, format, req.session.user.account_id],
        (err) => {
            if (err) return res.status(500).json({ error: err });

            res.json({ message: "Report exported successfully" });
        }
    );
});


// ===============================
//  DASHBOARD OVERVIEW STATS
//  Returns numbers used on `dashboard.html` cards and small stats
// ===============================
router.get('/admin/overview', adminAuth, (req, res) => {
    const queries = {
        totalUsers: `SELECT COUNT(*) AS count FROM Account WHERE role != 'Banned'`,
        totalMovies: `SELECT COUNT(*) AS count FROM Movie`,
        totalReviews: `SELECT COUNT(*) AS count FROM Review`,
        pendingFlags: `SELECT COUNT(*) AS count FROM Flag WHERE status = 'Pending'`,
        avgRating: `SELECT IFNULL(ROUND(AVG(rating),1),0) AS avg FROM Review`,
        totalGenres: `SELECT COUNT(DISTINCT genre_id) AS count FROM Genre`,
        newSignups24h: `SELECT COUNT(*) AS count FROM Account WHERE creation_datetime >= (NOW() - INTERVAL 1 DAY)`,
        reviews24h: `SELECT COUNT(*) AS count FROM Review WHERE review_datetime >= (NOW() - INTERVAL 1 DAY)`,
        events24h: `SELECT COUNT(*) AS count FROM Event WHERE creation_datetime >= (NOW() - INTERVAL 1 DAY)`,
        messages24h: `SELECT COUNT(*) AS count FROM Message WHERE message_datetime >= (NOW() - INTERVAL 1 DAY)`
    };

    // Run queries in parallel-friendly fashion (sequential here for simplicity)
    db.query(queries.totalUsers, (err, usersRes) => {
        if (err) return res.status(500).json({ error: err });
        db.query(queries.totalMovies, (err, moviesRes) => {
            if (err) return res.status(500).json({ error: err });
            db.query(queries.totalReviews, (err, reviewsRes) => {
                if (err) return res.status(500).json({ error: err });
                db.query(queries.pendingFlags, (err, flagsRes) => {
                    if (err) return res.status(500).json({ error: err });
                    db.query(queries.avgRating, (err, avgRes) => {
                        if (err) return res.status(500).json({ error: err });
                        db.query(queries.totalGenres, (err, genresRes) => {
                            if (err) return res.status(500).json({ error: err });
                            db.query(queries.newSignups24h, (err, signupsRes) => {
                                if (err) return res.status(500).json({ error: err });
                                db.query(queries.reviews24h, (err, r24Res) => {
                                    if (err) return res.status(500).json({ error: err });
                                    db.query(queries.events24h, (err, e24Res) => {
                                        if (err) return res.status(500).json({ error: err });
                                        db.query(queries.messages24h, (err, m24Res) => {
                                            if (err) return res.status(500).json({ error: err });

                                            res.json({
                                                totalUsers: usersRes[0].count || 0,
                                                totalMovies: moviesRes[0].count || 0,
                                                totalReviews: reviewsRes[0].count || 0,
                                                pendingFlags: flagsRes[0].count || 0,
                                                avgRating: (avgRes && avgRes[0] && avgRes[0].avg) ? avgRes[0].avg : 0,
                                                totalGenres: genresRes[0].count || 0,
                                                newSignups24h: signupsRes[0].count || 0,
                                                reviews24h: r24Res[0].count || 0,
                                                events24h: e24Res[0].count || 0,
                                                messages24h: m24Res[0].count || 0
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});


// ===============================
//  FLAGGED CONTENT ROUTES
//  Provides list/detail and moderation actions for flagged items used by the moderation panel
// ===============================
router.get('/admin/flags', adminAuth, (req, res) => {
    const sql = `
        SELECT 
            f.flag_id, f.content_type, f.content_id, f.reason, f.status, f.created_at,
            a.username AS reporter_name
        FROM Flag f
        LEFT JOIN User u ON f.reporter_id = u.user_id
        LEFT JOIN Account a ON u.account_id = a.account_id
        ORDER BY f.created_at DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

router.get('/admin/flags/:flagId', adminAuth, (req, res) => {
    const { flagId } = req.params;
    const sql = `SELECT * FROM Flag WHERE flag_id = ?`;
    db.query(sql, [flagId], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (!results || results.length === 0) return res.status(404).json({ error: 'Flag not found' });
        res.json(results[0]);
    });
});

// Mark flag as resolved (no content removal)
router.put('/admin/flags/:flagId/resolve', adminAuth, (req, res) => {
    const { flagId } = req.params;
    const sql = `UPDATE Flag SET status = 'Resolved', resolved_by = ?, resolved_at = NOW() WHERE flag_id = ?`;
    db.query(sql, [req.session.user.account_id, flagId], (err) => {
        if (err) return res.status(500).json({ error: err });

        db.query(
            `INSERT INTO AuditLog (admin_id, action, target_table) VALUES (?, ?, ?)`,
            [req.session.user.account_id, `Resolved flag ${flagId}`, 'Flag']
        );

        res.json({ message: 'Flag resolved' });
    });
});

// Remove flagged content (deletes the referenced content) and mark flag resolved
router.delete('/admin/flags/:flagId/remove', adminAuth, (req, res) => {
    const { flagId } = req.params;

    db.query(`SELECT * FROM Flag WHERE flag_id = ?`, [flagId], (err, flags) => {
        if (err) return res.status(500).json({ error: err });
        if (!flags || flags.length === 0) return res.status(404).json({ error: 'Flag not found' });

        const flag = flags[0];
        const { content_type, content_id } = flag;

        // Decide how to remove depending on content_type
        let deleteSql;
        if (content_type === 'Review') deleteSql = `DELETE FROM Review WHERE review_id = ?`;
        else if (content_type === 'Post') deleteSql = `DELETE FROM Post WHERE post_id = ?`;
        else if (content_type === 'Comment') deleteSql = `DELETE FROM Comment WHERE comment_id = ?`;
        else deleteSql = null;

        if (!deleteSql) {
            // Unknown content type — still mark flag resolved and log
            db.query(`UPDATE Flag SET status='Resolved', resolved_by=?, resolved_at=NOW() WHERE flag_id = ?`, [req.session.user.account_id, flagId]);
            db.query(`INSERT INTO AuditLog (admin_id, action, target_table) VALUES (?, ?, ?)`, [req.session.user.account_id, `Resolved flag ${flagId} (unknown content type)`, 'Flag']);
            return res.status(400).json({ error: 'Unknown content type; flag marked resolved' });
        }

        db.query(deleteSql, [content_id], (err) => {
            if (err) return res.status(500).json({ error: err });

            db.query(`UPDATE Flag SET status='Removed', resolved_by=?, resolved_at=NOW() WHERE flag_id = ?`, [req.session.user.account_id, flagId]);

            db.query(`INSERT INTO AuditLog (admin_id, action, target_table) VALUES (?, ?, ?)`, [req.session.user.account_id, `Removed content ${content_type} ${content_id} due to flag ${flagId}`, content_type]);

            res.json({ message: 'Content removed and flag updated' });
        });
    });
});


// ===============================
router.get("/admin/audit", adminAuth, (req, res) => {
    db.query(`SELECT * FROM AuditLog ORDER BY log_id DESC`, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// ===============================
//  GET ALL GENRES
// ===============================
router.get("/admin/genres", adminAuth, (req, res) => {
    db.query("SELECT * FROM Genre", (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// ===============================
//  ADD GENRE
// ===============================
router.post("/admin/genres", adminAuth, (req, res) => {
    const { genre_name } = req.body;
    db.query("INSERT INTO Genre (genre_name) VALUES (?)", [genre_name], (err) => {
        if (err) return res.status(500).json({ error: err });
        // Audit Log
        db.query(`INSERT INTO AuditLog (admin_id, action, target_table) VALUES (?, ?, ?)`, 
        [req.session.user.account_id, `Added Genre ${genre_name}`, "Genre"]);
        
        res.json({ message: "Genre added" });
    });
});

// ===============================
//  DELETE GENRE
// ===============================
router.delete("/admin/genres/:id", adminAuth, (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM Genre WHERE genre_id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        // Audit Log
        db.query(`INSERT INTO AuditLog (admin_id, action, target_table) VALUES (?, ?, ?)`, 
        [req.session.user.account_id, `Deleted Genre ID ${id}`, "Genre"]);
        
        res.json({ message: "Genre deleted" });
    });
});


// ===============================
//  REPORT: MOST WATCHED MOVIES (From History Table)
// ===============================
router.get("/admin/reports/most-watched", adminAuth, (req, res) => {
    const sql = `
        SELECT m.title, COUNT(h.user_id) as count, 
               (SELECT genre_name FROM Genre g JOIN MovieGenre mg ON g.genre_id = mg.genre_id WHERE mg.movie_id = m.movie_id LIMIT 1) as genre
        FROM Movie m
        JOIN History h ON m.movie_id = h.movie_id
        GROUP BY m.movie_id
        ORDER BY count DESC
        LIMIT 10;
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// ===============================
//  REPORT: HIGHEST RATED (From Review Table)
// ===============================
router.get("/admin/reports/top-rated", adminAuth, (req, res) => {
    const sql = `
        SELECT m.title, ROUND(AVG(r.rating), 1) as avg_rating, COUNT(r.review_id) as total_reviews
        FROM Movie m
        JOIN Review r ON m.movie_id = r.movie_id
        GROUP BY m.movie_id
        ORDER BY avg_rating DESC, total_reviews DESC
        LIMIT 10;
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// ===============================
//  REPORT: MOST ACTIVE USERS (Activity Score)
// ===============================
router.get("/admin/reports/active-users", adminAuth, (req, res) => {
    // Calculates a score: Posts + Comments + Reviews
    const sql = `
        SELECT u.username,
            (SELECT COUNT(*) FROM Post p WHERE p.user_id = u.user_id) as posts,
            (SELECT COUNT(*) FROM Comment c WHERE c.user_id = u.user_id) as comments,
            (SELECT COUNT(*) FROM Review r WHERE r.user_id = u.user_id) as reviews,
            (
                (SELECT COUNT(*) FROM Post p WHERE p.user_id = u.user_id) +
                (SELECT COUNT(*) FROM Comment c WHERE c.user_id = u.user_id) +
                (SELECT COUNT(*) FROM Review r WHERE r.user_id = u.user_id)
            ) as total_activity
        FROM User u
        JOIN Account a ON u.account_id = a.account_id
        ORDER BY total_activity DESC
        LIMIT 10;
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});


// =====================================================
module.exports = router;
