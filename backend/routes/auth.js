const express = require('express');
const router = express.Router();
const db = require('../db');

// --- 1. signup route ---
router.post('/signup', (req, res) => {
    const { first_name, last_name, email, username, password, confirm_password } = req.body;

    // check passwords match
    if (password !== confirm_password) {
        return res.send('<script>alert("passwords do not match"); window.location.href="/signup.html";</script>');
    }

    // check special character
    const special_chars = /[!@#$%^&*(),.?":{}|<>]/;
    if (!special_chars.test(password)) {
        return res.send('<script>alert("password must contain a special character"); window.location.href="/signup.html";</script>');
    }

    db.getConnection((err, connection) => {
        if (err) return res.status(500).send("db connection error");

        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                return res.status(500).send("transaction error");
            }

            const sql_account = "INSERT INTO Account (username, password, role) VALUES (?, ?, 'User')";
            
            connection.query(sql_account, [username, password], (err, result) => {
                if (err) {
                    return connection.rollback(() => {
                        connection.release();
                        if (err.code === 'ER_DUP_ENTRY') return res.send('<script>alert("username taken"); window.location.href="/signup.html";</script>');
                        res.status(500).send("error creating account");
                    });
                }

                const new_id = result.insertId;
                const sql_user = "INSERT INTO User (account_id, first_name, last_name, email) VALUES (?, ?, ?, ?)";
                
                connection.query(sql_user, [new_id, first_name, last_name, email], (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            if (err.code === 'ER_DUP_ENTRY') return res.send('<script>alert("email already used"); window.location.href="/signup.html";</script>');
                            res.status(500).send("error creating profile");
                        });
                    }

                    connection.commit((err) => {
                        if (err) return connection.rollback(() => { connection.release(); res.status(500).send("commit error"); });
                        connection.release();
                        res.send('<script>alert("account created"); window.location.href="/login.html";</script>');
                    });
                });
            });
        });
    });
});

// --- 2. login route (FIXED) ---
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM Account WHERE username = ?";

    db.query(sql, [username], (err, results) => {
        if (err) return res.status(500).send("db error");
        if (results.length === 0) return res.send('<script>alert("user not found"); window.location.href="/login.html";</script>');

        const user = results[0];
        if (password !== user.password) return res.send('<script>alert("wrong password"); window.location.href="/login.html";</script>');

        // FIX: Force role to lowercase to avoid mismatches (Admin vs admin)
        // This ensures 'Admin', 'admin', or 'ADMIN' all work.
        const role_lower = user.role.toLowerCase(); 

        let id_query = role_lower === 'admin' ? "SELECT admin_id as specific_id FROM Admin WHERE account_id = ?" : "SELECT user_id as specific_id FROM User WHERE account_id = ?";

        db.query(id_query, [user.account_id], (err, id_results) => {
            const specific_id = (id_results && id_results.length > 0) ? id_results[0].specific_id : null;
            
            req.session.user = {
                accountId: user.account_id,
                id: specific_id,
                username: user.username,
                role: user.role // Keep original role string for display if needed
            };
            
            // FIX: Check normalized role here
            if (role_lower === 'admin') res.redirect('/dashboard.html');
            else res.redirect('/profile.html');
        });
    });
});

// --- 3. logout route ---
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

// --- 4. auth check ---
router.get('/api/auth-status', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

module.exports = router;