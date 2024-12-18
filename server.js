const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, '317Final.db');

// Open SQLite Database
let db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to the SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`);
    }
});

app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, 'public')));


app.post('/register', (req, res) => {
    const { email, password } = req.body;

    const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
    db.run(query, [email, password], function(err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(400).json({ message: 'Email already registered.' });
            }
            console.error('Error registering user:', err.message);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        res.status(201).json({ message: 'User registered successfully!' });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.get(query, [email, password], (err, user) => {
        if (err) {
            console.error('Error logging in:', err.message);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        res.status(200).json({ message: 'Login successful!' });
    });
});


app.get("/api/session", (req, res) => {
    res.json({ loggedIn: !!req.session.user });
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
