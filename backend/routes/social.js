const express = require('express');
const router = express.Router();
const db = require('../db'); 

const getUserId = (req) => {
    if (req.session && req.session.user) {
        return req.session.user.id;
    }
    return null;
};
const getAccountId = (req) => req.session?.user?.accountId;

// ===============================
// 1. FRIENDS & REQUESTS
// ===============================
router.get('/friends', (req, res) => {
    const userId = getUserId(req);
    const sql = `
        SELECT A.account_id, U.first_name, U.last_name, A.username
        FROM Friendship F
        JOIN User U ON U.user_id = CASE WHEN F.sender_id = ? THEN F.receiver_id ELSE F.sender_id END
        JOIN Account A ON A.account_id = U.account_id
        WHERE (F.sender_id = ? OR F.receiver_id = ?) AND F.status = 'Accepted'
    `;
    db.query(sql, [userId, userId, userId, userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.get('/friend-requests', (req, res) => {
    const userId = getUserId(req);
    const sql = `
        SELECT A.account_id, U.first_name, U.last_name
        FROM Friendship F
        JOIN User U ON U.user_id = F.sender_id
        JOIN Account A ON A.account_id = U.account_id
        WHERE F.receiver_id = ? AND F.status = 'Pending'
    `;
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.post('/friend-requests/accept/:id', (req, res) => {
    const myId = getUserId(req);
    const friendAccountId = req.params.id;
    db.query(`SELECT user_id FROM User WHERE account_id = ?`, [friendAccountId], (err, results) => {
        if(err || results.length === 0) return res.status(500).json({error: "User not found"});
        const friendUserId = results[0].user_id;
        const updateSql = `UPDATE Friendship SET status = 'Accepted' WHERE sender_id = ? AND receiver_id = ?`;
        db.query(updateSql, [friendUserId, myId], (err) => res.json({ success: true }));
    });
});

router.post('/friend-requests/decline/:id', (req, res) => {
    const myId = getUserId(req);
    const friendAccountId = req.params.id;
    db.query(`SELECT user_id FROM User WHERE account_id = ?`, [friendAccountId], (err, results) => {
        if(err || results.length === 0) return res.status(500).json({error: "User not found"});
        const friendUserId = results[0].user_id;
        const deleteSql = `DELETE FROM Friendship WHERE sender_id = ? AND receiver_id = ?`;
        db.query(deleteSql, [friendUserId, myId], (err) => res.json({ success: true }));
    });
});

// ===============================
// 2. HISTORY & WATCHLIST
// ===============================
router.get('/history', (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.json([]);
    const sql = `
        SELECT M.title, M.poster, M.movie_id, W.last_update as watched_date
        FROM Watchlist W 
        JOIN Movie M ON W.movie_id = M.movie_id
        WHERE W.user_id = ? AND W.watch_status = 'Completed'
        ORDER BY W.last_update DESC
    `;
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.get('/watchlist', (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.json([]);
    const sql = `
        SELECT M.movie_id, M.title, M.poster, W.watch_status 
        FROM Watchlist W 
        JOIN Movie M ON W.movie_id = M.movie_id
        WHERE W.user_id = ?
        ORDER BY W.last_update DESC
    `;
    db.query(sql, [userId], (err, results) => res.json(results || []));
});

router.post('/watchlist/status', (req, res) => {
    const userId = getUserId(req);
    const { movie_id, status } = req.body; 
    if (!userId) return res.status(401).json({ error: "Not logged in" });

    const sql = `
        INSERT INTO Watchlist (user_id, movie_id, watch_status, last_update) 
        VALUES (?, ?, ?, NOW()) 
        ON DUPLICATE KEY UPDATE watch_status = VALUES(watch_status), last_update = NOW()
    `;
    db.query(sql, [userId, movie_id, status], (err) => res.json({ message: "Status updated" }));
});

// ===============================
// 3. REVIEWS (FIXED)
// ===============================

// GET My Reviews
router.get('/reviews', (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.json([]);
    
    // FIX: Changed R.comment to R.review_text (Your DB column name)
    const sql = `
        SELECT R.review_id, M.movie_id, M.title, M.poster, R.rating, R.review_text as comment, R.review_datetime
        FROM Review R JOIN Movie M ON R.movie_id = M.movie_id
        WHERE R.user_id = ? ORDER BY R.review_datetime DESC
    `;
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("My Reviews Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// POST Review (Uses Stored Procedure: AddReview)
router.post('/reviews', (req, res) => {
    const userId = getUserId(req);
    const { movie_id, rating, comment } = req.body;
    
    if (!userId) return res.status(401).json({ error: "Not logged in" });

    // Using the stored procedure you created
    db.query(`CALL AddReview(?, ?, ?, ?)`, [userId, movie_id, rating, comment], (err) => {
        if(err) return res.status(500).json({ error: err.message });
        res.json({ message: "Review Saved!" });
    });
});

// DELETE Review
router.delete('/reviews/:id', (req, res) => {
    const userId = getUserId(req);
    const reviewId = req.params.id;
    
    if (!userId) return res.status(401).json({ error: "Not logged in" });

    db.query(`DELETE FROM Review WHERE review_id = ? AND user_id = ?`, [reviewId, userId], (err) => {
        if(err) return res.status(500).json({ error: err.message });
        res.json({ message: "Review Deleted" });
    });
});

// ===============================
// 4. MESSAGES
// ===============================
router.get('/messages/:friendId', (req, res) => {
    const myId = getUserId(req);
    const friendAccountId = req.params.friendId;
    db.query(`SELECT user_id FROM User WHERE account_id = ?`, [friendAccountId], (err, results) => {
        if(err || results.length === 0) return res.json([]); 
        const friendUserId = results[0].user_id;
        const sql = `
            SELECT content as text, sender_id 
            FROM Message
            WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
            ORDER BY message_datetime ASC
        `;
        db.query(sql, [myId, friendUserId, friendUserId, myId], (err, msgs) => {
            if(err) return res.json([]);
            const mapped = msgs.map(msg => ({
                text: msg.text,
                type: msg.sender_id == myId ? 'outgoing' : 'incoming'
            }));
            res.json(mapped);
        });
    });
});

router.post('/messages', (req, res) => {
    const myId = getUserId(req);
    const { receiverId, text } = req.body; 
    db.query(`SELECT user_id FROM User WHERE account_id = ?`, [receiverId], (err, results) => {
        if(err || results.length === 0) return res.status(500).json({error: "User not found"});
        const friendUserId = results[0].user_id;
        const sql = `INSERT INTO Message (sender_id, receiver_id, content, message_datetime, read_status) VALUES (?, ?, ?, NOW(), 0)`;
        db.query(sql, [myId, friendUserId, text], (err) => res.json({ success: true }));
    });
});

// ===============================
// 5. PROFILE & GENRES
// ===============================
router.get('/profile', (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Not logged in" });

    const userSql = `SELECT U.first_name, U.last_name, U.email, A.username FROM User U JOIN Account A ON U.account_id = A.account_id WHERE U.user_id = ?`;
    const statsSql = `
        SELECT 
            (SELECT COUNT(*) FROM Watchlist WHERE user_id = ? AND watch_status = 'Completed') as historyCount,
            (SELECT COUNT(*) FROM Friendship WHERE (sender_id = ? OR receiver_id = ?) AND status='Accepted') as friendCount,
            (SELECT COUNT(*) FROM Review WHERE user_id = ?) as reviewCount
    `;
    const genreSql = `SELECT genre_id FROM UserFavGenre WHERE user_id = ?`;

    db.query(userSql, [userId], (err, userRes) => {
        if(err || userRes.length === 0) return res.status(404).json({error: "User not found"});
        db.query(statsSql, [userId, userId, userId, userId], (err2, statsRes) => {
            db.query(genreSql, [userId], (err3, genreRes) => {
                res.json({
                    user: userRes[0],
                    stats: statsRes[0],
                    favGenres: genreRes.map(g => g.genre_id)
                });
            });
        });
    });
});

router.post('/genres', (req, res) => {
    const userId = getUserId(req);
    const { genre_ids } = req.body; 
    db.query(`DELETE FROM UserFavGenre WHERE user_id = ?`, [userId], (err) => {
        if(err) return res.status(500).json({error: "DB Error"});
        if(!genre_ids || genre_ids.length === 0) return res.json({message: "Preferences cleared"});
        
        const values = genre_ids.map(gid => [userId, gid]);
        db.query(`INSERT INTO UserFavGenre (user_id, genre_id) VALUES ?`, [values], (err) => {
            res.json({message: "Preferences Saved!"});
        });
    });
});

router.get('/recommendations', (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.json([]); 

    const checkSql = `SELECT COUNT(*) as count FROM UserFavGenre WHERE user_id = ?`;
    db.query(checkSql, [userId], (err, result) => {
        if(err) return res.json([]); 
        const hasPrefs = result[0].count > 0;
        let sql;
        let params = [];

        if (hasPrefs) {
            sql = `
                SELECT DISTINCT M.movie_id, M.title, M.poster 
                FROM Movie M
                JOIN MovieGenre MG ON M.movie_id = MG.movie_id
                JOIN UserFavGenre UP ON MG.genre_id = UP.genre_id
                WHERE UP.user_id = ?
                AND M.movie_id NOT IN (SELECT IFNULL(movie_id, 0) FROM Watchlist WHERE user_id = ? AND watch_status = 'Completed')
                ORDER BY RAND() LIMIT 10
            `;
            params = [userId, userId];
        } else {
            sql = `
                SELECT M.movie_id, M.title, M.poster FROM Movie M
                WHERE M.movie_id NOT IN (SELECT IFNULL(movie_id, 0) FROM Watchlist WHERE user_id = ? AND watch_status = 'Completed')
                ORDER BY RAND() LIMIT 10
            `;
            params = [userId];
        }
        db.query(sql, params, (err, results) => res.json(results || []));
    });
});

// ===============================
// 6. NOTIFICATIONS
// ===============================
router.get('/notifications', (req, res) => {
    const accountId = getAccountId(req);
    if (!accountId) return res.json([]);

    const sql = `
        SELECT content, notification_type, creation_datetime, read_status 
        FROM Notification 
        WHERE recipient_account_id = ? 
        ORDER BY creation_datetime DESC
    `;
    db.query(sql, [accountId], (err, results) => {
        if (err) return res.json([]); 
        res.json(results);
    });
});

// ===============================
// 7. EVENTS
// ===============================
router.get('/events', (req, res) => {
    const sql = `
        SELECT 
            E.event_id, 
            E.title, 
            CONCAT(U.first_name, ' ', U.last_name) as host_name, 
            E.event_datetime, 
            E.capacity, 
            E.description 
        FROM Event E
        LEFT JOIN User U ON E.host_id = U.user_id
        WHERE E.event_datetime >= NOW() 
        ORDER BY E.event_datetime ASC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.json([]); 
        res.json(results);
    });
});

router.post('/events/join', (req, res) => {
    const userId = getUserId(req);
    const { event_id } = req.body;
    if (!userId) return res.status(401).json({ error: "Not logged in" });
    const sql = `INSERT IGNORE INTO EventParticipation (event_id, participant_id) VALUES (?, ?)`;
    db.query(sql, [event_id, userId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Joined successfully" });
    });
});

router.post('/events', (req, res) => {
    const hostId = getUserId(req);
    const { title, movie_id, description, event_datetime, capacity } = req.body;
    if (!hostId) return res.status(401).json({ error: "Not logged in" });
    const sql = `
        INSERT INTO Event (title, movie_id, host_id, description, event_datetime, capacity, creation_datetime)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    db.query(sql, [title, movie_id || null, hostId, description, event_datetime, capacity], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Event created successfully" });
    });
});

router.get('/events/:id', (req, res) => {
    const eventId = req.params.id;
    const sql = `
        SELECT 
            E.*, 
            M.title as movie_title,
            CONCAT(U.first_name, ' ', U.last_name) as host_name,
            (SELECT COUNT(*) FROM EventParticipation WHERE event_id = E.event_id) as participant_count
        FROM Event E
        LEFT JOIN User U ON E.host_id = U.user_id
        LEFT JOIN Movie M ON E.movie_id = M.movie_id
        WHERE E.event_id = ?
    `;
    db.query(sql, [eventId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: "Event not found" });
        res.json(results[0]);
    });
});

router.get('/events/:id/participants', (req, res) => {
    const eventId = req.params.id;
    const sql = `
        SELECT U.first_name, U.last_name 
        FROM EventParticipation EP
        JOIN User U ON EP.participant_id = U.user_id
        WHERE EP.event_id = ?
    `;
    db.query(sql, [eventId], (err, results) => {
        if (err) return res.json([]);
        res.json(results);
    });
});

// ===============================
// 8. DISCUSSION BOARD
// ===============================
router.get('/posts/:movieId', (req, res) => {
    const movieId = req.params.movieId;
    const sql = `
        SELECT p.*, u.username, COUNT(pl.user_id) as like_count
        FROM Post p
        JOIN User u ON p.user_id = u.user_id
        LEFT JOIN PostLike pl ON p.post_id = pl.post_id
        WHERE p.movie_id = ?
        GROUP BY p.post_id
        ORDER BY p.post_datetime DESC
    `;
    db.query(sql, [movieId], (err, results) => res.json(results || []));
});

router.post('/posts', (req, res) => {
    const { movie_id, content } = req.body;
    const user_id = getUserId(req);
    const sql = `INSERT INTO Post (user_id, movie_id, content, post_datetime) VALUES (?, ?, ?, NOW())`;
    db.query(sql, [user_id, movie_id, content], (err) => res.json({ message: "Post created" }));
});

router.post('/posts/:id/like', (req, res) => {
    const postId = req.params.id;
    const userId = getUserId(req);
    const sql = "INSERT IGNORE INTO PostLike (user_id, post_id) VALUES (?, ?)";
    db.query(sql, [userId, postId], (err) => res.json({ message: "Liked" }));
});

router.get('/posts/:id/comments', (req, res) => {
    const postId = req.params.id;
    const sql = `
        SELECT c.*, u.username 
        FROM Comment c JOIN User u ON c.user_id = u.user_id
        WHERE c.post_id = ? ORDER BY c.comment_datetime ASC
    `;
    db.query(sql, [postId], (err, results) => res.json(results || []));
});

router.post('/comments', (req, res) => {
    const { post_id, content } = req.body;
    const user_id = getUserId(req);
    const sql = "INSERT INTO Comment (post_id, user_id, content, comment_datetime) VALUES (?, ?, ?, NOW())";
    db.query(sql, [post_id, user_id, content], (err) => res.json({ message: "Comment added" }));
});

module.exports = router;