const socket = io();

// trvalé ID: kontrola, zda už je userId v paměti prohlížeče. Pokud ne, vytvoří se nové náhodné.
let myUserId = localStorage.getItem('rychlochat_user_id');
if (!myUserId) {
    myUserId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('rychlochat_user_id', myUserId);
}

let currentRoom = 'obecne';

const messagesDiv = document.getElementById('chat-messages');
const usernameInput = document.getElementById('username-input');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatHeader = document.getElementById('chat-header');
const roomItems = document.querySelectorAll('.room-item');
const clearCacheBtn = document.getElementById('clear-cache-btn');

// načtení přezdívky (když už usernameInput existuje)
const savedUsername = localStorage.getItem('rychlochat_username');
if (savedUsername) {
    usernameInput.value = savedUsername;
}

socket.emit('join_room', currentRoom);

function sendMessage() {
    const username = usernameInput.value.trim() || 'Anonym';
    const text = messageInput.value.trim();

    if (text !== '') {
        // uložení přezdívky do localStorage, aby se načetla při příštím načtení stránky
        localStorage.setItem('rychlochat_username', username);
        socket.emit('chat_message', {
            room: currentRoom,
            username: username,
            text: text,
            userId: myUserId // posílám trvalé userId, ne socket.id
        });
        messageInput.value = '';
    }
}

// smazání identity a restart stránky
clearCacheBtn.addEventListener('click', () => {
    if (confirm('Opravdu chceš smazat svou identitu a historii tvých zpráv v tomto prohlížeči?')) {
        localStorage.clear(); // vymaže kompletně celou localStorage
        // Pro Firefox - než se stránka obnoví, vymaže se text přímo z políčka na obrazovce
        usernameInput.value = '';
        location.reload();    // Obnoví stránku (F5)
    }
});

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

roomItems.forEach(item => {
    item.addEventListener('click', () => {
        const selectedRoom = item.getAttribute('data-room');
        if (selectedRoom === currentRoom) return;

        document.querySelector('.room-item.active').classList.remove('active');
        item.classList.add('active');
        messagesDiv.innerHTML = '';
        chatHeader.innerText = `Rychlochat 💬 (# ${selectedRoom})`;

        socket.emit('leave_room', currentRoom);
        currentRoom = selectedRoom;
        socket.emit('join_room', currentRoom);
    });
});

function formatTime(isoString) {
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// společná funkce pro přidávání zpráv
function appendMessage(data) {
    const messageEl = document.createElement('div');
    messageEl.classList.add('message');
    
    const timeFormatted = formatTime(data.timestamp);
    
    // porovnávání trvalého userId z databáze/live chatu s myUserId
    if (data.userId === myUserId) {
        messageEl.classList.add('my-message');
    }
    
    messageEl.innerHTML = `
        <div class="message-author"><strong>${data.username}</strong></div>
        <div class="message-text">${data.text}</div>
        <div class="message-time"><small>${timeFormatted}</small></div>
    `;
    
    messagesDiv.appendChild(messageEl);
}

socket.on('broadcast_message', (data) => {
    appendMessage(data);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on('room_history', (messages) => {
    messagesDiv.innerHTML = '';
    messages.forEach(msg => {
        appendMessage(msg); // předání zprávy stejně pro historii i live chat
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});