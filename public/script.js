// public/script.js

// Initialize the Socket.IO connection
// By default, it will connect to the server that served the page (http://localhost:3000)
const socket = io(); 
const messagesBox = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');

// --- Socket.IO Event Handlers ---

// Handle the user finding a partner
socket.on('partner_found', (message) => {
    messagesBox.innerHTML = ''; // Clear waiting message
    appendSystemMessage(message, 'system-success');
    messageInput.disabled = false;
});

// Handle the user being in the waiting queue
socket.on('waiting', (message) => {
    messagesBox.innerHTML = '';
    appendSystemMessage(message, 'system-info');
    messageInput.disabled = true;
});

// Handle the server being full
socket.on('server_full', (message) => {
    messagesBox.innerHTML = '';
    appendSystemMessage(message, 'system-error');
    messageInput.disabled = true;
});

// Handle receiving a message from a stranger
socket.on('chat_message', (msg) => {
    appendMessage(`Stranger: ${msg}`, 'partner-message');
});

// Handle partner disconnecting abruptly
socket.on('partner_disconnected', (message) => {
    appendSystemMessage(message + " Searching for a new stranger...", 'system-warning');
    // The server has already put the user back in the queue
});

// Handle partner clicking "Next Stranger"
socket.on('partner_disconnected_by_user', (message) => {
    appendSystemMessage(message + " Connecting you to a new stranger...", 'system-warning');
    // The server has already put the user back in the queue
});

// --- Utility Functions ---

function appendMessage(text, className) {
    const newMessage = document.createElement('div');
    newMessage.classList.add('message', className);
    newMessage.textContent = text; 
    messagesBox.appendChild(newMessage);
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

function appendSystemMessage(text, className) {
    const systemMessage = document.createElement('div');
    systemMessage.classList.add('message', 'system-message', className);
    systemMessage.textContent = text; 
    messagesBox.appendChild(systemMessage);
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

// --- Action Functions ---

function sendMessage() {
    const messageText = messageInput.value.trim();
    
    if (messageText !== "") {
        // Send the message to the server
        socket.emit('chat_message', messageText);
        
        // Display the message locally
        appendMessage(`You: ${messageText}`, 'self-message');
        
        messageInput.value = ''; // Clear input field
    }
}

function nextStranger() {
    // 1. Clear the chat history from the screen
    messagesBox.innerHTML = '';
    
    // 2. Notify the server that the user wants to switch partners
    socket.emit('request_next_stranger');

    appendSystemMessage("Requesting new stranger...", 'system-info');
}

// Attach the functions to the button (assuming you updated the HTML with proper IDs)
document.getElementById('nextButton').onclick = nextStranger;
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});