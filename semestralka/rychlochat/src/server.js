const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io'); 
// import funkcí z database.js
const db = require('./database'); 

const app = express();
const server = http.createServer(app); 
const io = new Server(server); 

const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log(`🔌 Nový uživatel se připojil! ID: ${socket.id}`);

    // Uživatel vstoupil do místnosti
    socket.on('join_room', (roomName) => {
        socket.join(roomName);
        console.log(`👤 Uživatel [${socket.id}] vstoupil do: ${roomName}`);

        // načtení historie zpráv z databáze pro tuto místnost
        db.getRoomMessages(roomName, (err, rows) => {
            if (err) {
                console.error('Chyba při načítání historie:', err.message);
                return;
            }
            // pošlu historii pouze tomuto jednomu připojenému socketu
            socket.emit('room_history', rows);
        });
    });

    socket.on('leave_room', (roomName) => {
        socket.leave(roomName);
        console.log(`👤 Uživatel [${socket.id}] opustil: ${roomName}`);
    });

    socket.on('chat_message', (data) => {
        const timestamp = new Date().toISOString();

        // předání data.userId do databáze
        db.saveMessage(data.room, data.username, data.text, timestamp, data.userId, (err) => {
            if (err) {
                console.error('Chyba při ukládání zprávy:', err.message);
                return;
            }

            const messageToSend = {
                room: data.room,
                username: data.username,
                text: data.text,
                userId: data.userId, // rozesílání trvalého userId místo socket.id
                timestamp: timestamp
            };

            io.to(data.room).emit('broadcast_message', messageToSend);
        });
    });

    socket.on('disconnect', () => {
        console.log(`❌ Uživatel ${socket.id} se odpojil.`);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Rychlochat běží na http://localhost:${PORT}`);
});