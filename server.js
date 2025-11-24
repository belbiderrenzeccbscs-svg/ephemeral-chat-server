// server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS for development flexibility
const io = new Server(server, {
    cors: {
        origin: "*", // Allows connections from any origin (be specific in production)
        methods: ["GET", "POST"]
    }
});

const MAX_USERS = 200;
let connectedUsers = 0;

// Data structures for managing chat partners and the queue
let waitingQueue = []; 
// Map stores the paired user's ID: Key is User Socket ID, Value is Partner Socket ID
let activePairs = new Map(); 

// Serve static files (your HTML, CSS, JS) from the 'public' folder
app.use(express.static('public'));

// --- Core Server Functions for Pairing ---

function attemptPairing(socket) {
    if (waitingQueue.length > 0) {
        // Partner is waiting! Shift them out of the queue.
        const partnerSocket = waitingQueue.shift(); 

        // 1. Establish the pair (store connection in both directions)
        activePairs.set(socket.id, partnerSocket.id);
        activePairs.set(partnerSocket.id, socket.id);

        // 2. Notify both clients that a partner has been found
        socket.emit('partner_found', 'You are now chatting with a stranger.');
        partnerSocket.emit('partner_found', 'You are now chatting with a stranger.');
        
        console.log(`Paired ${socket.id} with ${partnerSocket.id}`);
    } else {
        // No one waiting, add this user to the queue
        waitingQueue.push(socket);
        socket.emit('waiting', 'Please wait, searching for a stranger...');
        console.log(`${socket.id} added to waiting queue.`);
    }
}

function handleNextStranger(socket) {
    // 1. Find the current partner and initiate disconnect
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
        const partnerSocket = io.sockets.sockets.get(partnerId);
        if (partnerSocket) {
            // Tell the partner their chat has ended
            partnerSocket.emit('partner_disconnected_by_user', 'Your partner disconnected and left the chat.');
            
            // Remove the partner from the pairing map
            activePairs.delete(partnerId);
            
            // Put the newly single partner back into the queue
            attemptPairing(partnerSocket); 
        }
        // Remove the current user from the pairing map
        activePairs.delete(socket.id);
    }
    
    // 2. Put the requesting user into the pairing process for a new chat
    attemptPairing(socket);
}

// --- Socket.IO Connection Handler ---

io.on('connection', (socket) => {
    
    // 1. **USER LIMIT CHECK**
    if (connectedUsers >= MAX_USERS) {
        socket.emit('server_full', 'The maximum number of 200 users has been reached. Please try again later.');
        socket.disconnect(true); 
        console.log(`Connection refused for ${socket.id}: Server full.`);
        return; // Stop processing this connection
    }

    connectedUsers++;
    console.log(`User connected: ${socket.id}. Current users: ${connectedUsers}`);
    
    // 2. **Initial Pairing**
    attemptPairing(socket);
    
    // 3. **Handle Incoming Messages**
    socket.on('chat_message', (msg) => {
        const partnerId = activePairs.get(socket.id);
        if (partnerId) {
            // Forward the message to the partner
            socket.to(partnerId).emit('chat_message', msg);
        }
    });

    // 4. **Handle 'Next Stranger' Request**
    socket.on('request_next_stranger', () => {
        handleNextStranger(socket);
    });
    
    // 5. **Handle Disconnection**
    socket.on('disconnect', () => {
        connectedUsers--;
        console.log(`User disconnected: ${socket.id}. Current users: ${connectedUsers}`);
        
        // Find and process the partner
        const partnerId = activePairs.get(socket.id);
        if (partnerId) {
            const partnerSocket = io.sockets.sockets.get(partnerId);
            if (partnerSocket) {
                // Notify partner and try to find them a new chat
                partnerSocket.emit('partner_disconnected', 'Your partner unexpectedly left the chat.');
                activePairs.delete(partnerId);
                attemptPairing(partnerSocket);
            }
            activePairs.delete(socket.id);
        }
        
        // Remove user from the waiting queue if they were there
        waitingQueue = waitingQueue.filter(s => s.id !== socket.id);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});