const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ayman23f-0724', // Your password
    database: 'dbproject_itr2',
    waitForConnections: true,
    connectionLimit: 10
});

// Fix: Pools don't use .connect(). 
// Instead, we try to get a connection to test if it works.
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
    } else {
        console.log('Connected to MySQL Database.');
        connection.release(); // Always release the connection back to the pool!
    }
});

module.exports = db;