EPHEMERAL CHAT SERVER

A real-time anonymous chat application built for connecting and messaging with other users.

ABOUT

Ephemeral Chat Server is a web-based chat application inspired by anonymous chat platforms. Users can connect with other people, communicate through real-time messaging, and maintain a public user identity without relying on personal information.

The project was built as a hands-on software development project to explore real-time communication, server-side development, user identification, and client-server interaction.

FEATURES

- Anonymous user-to-user chatting
- Real-time messaging
- Server-generated unique public user IDs
- User discovery through public IDs
- Public profile information
- Message synchronization
- Message IDs and duplicate-message prevention
- Reconnection handling
- Responsive web interface

TECH STACK

Frontend
- HTML
- CSS
- JavaScript

BACKEND

- Node.js
- WebSocket-based communication

HOW IT WORKS

1. A user connects to the application.
2. The server assigns the user a unique public ID.
3. Users can discover other users using their public ID.
4. A conversation can be opened between users.
5. Messages are sent through the server and synchronized between connected clients.
6. The application handles reconnection and message synchronization when a connection is restored.

PROJECT STRUCTURE

ephemeral-chat-server/
├── public/
│   ├── ...
├── server.js
├── package.json
├── package-lock.json
└── .gitignore

RUNNING LOCALLY

1. Clone the repository

git clone https://github.com/belbiderrenzeccbscs-svg/ephemeral-chat-server.git

2. Navigate to the project

cd ephemeral-chat-server

3. Install dependencies

npm install

4. Start the server

node server.js

The server runs locally on port "7700".

PROJECT STATUS

This project is currently under development. Features and implementation details may change as the application continues to be improved.

WHAT I LEARNED

Working on this project helped me practice:

- Building a client-server application
- Real-time communication
- WebSocket messaging
- Managing user sessions and identities
- Handling message synchronization
- Working with JavaScript and Node.js
- Debugging real-time application behavior

AUTHOR
Renz Belbider

Computer Science Student & Frontend Developer

GitHub: https://GitHub.com/belbiderrenzeccbscs-svg
