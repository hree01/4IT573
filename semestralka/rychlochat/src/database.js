const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// cesta, kam se soubor s databází uloží
const dbPath = path.join(__dirname, '../chat.db');

// připojení k databázi (pokud soubor neexistuje, SQLite ho automaticky vytvoří)
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Chyba při připojování k SQLite databázi:', err.message);
    } else {
        console.log('📦 Úspěšně připojeno k SQLite databázi (soubor chat.db).');
    }
});

// inicializace tabulek – spustí se při startu aplikace
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room TEXT NOT NULL,
            username TEXT NOT NULL,
            text TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            userId TEXT
        )
    `);
});

// funkce pro uložení nové zprávy
function saveMessage(room, username, text, timestamp, userId, callback) {
    const sql = `INSERT INTO messages (room, username, text, timestamp, userId) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [room, username, text, timestamp, userId], function(err) {
        if (callback) callback(err, this.lastID);
    });
}

// načtení historie zpráv z konkrétní místnosti
function getRoomMessages(room, callback) {
    const sql = `SELECT * FROM messages WHERE room = ? ORDER BY id ASC LIMIT 50`;
    db.all(sql, [room], (err, rows) => {
        callback(err, rows);
    });
}

// export funkcí, aby je mohl server.js používat
module.exports = {
    saveMessage,
    getRoomMessages
};