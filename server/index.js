const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const PORT = process.env.PORT || 3001;

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js');

const router = require('./router');

const app = express();
const server = http.createServer(app);

const io = socketio(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
        credentials: true
    }
});


io.on('connection', (socket) => {
    console.log("We have connected!");

    const sessionID = socket.id;

    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: sessionID, name, room });

        if (error) {
            return callback(error);
        }

        socket.emit('message', { user: 'admin', text: `Welcome to the ${user.room} room, ${user.name}!` });
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined BoobChat.` });

        socket.join(user.room);

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(sessionID);

        io.to(user.room).emit('message', { user: user.name, text: message });
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });


        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left the room.` });
        }
    });
});

app.use(router);
app.use(cors());

server.listen(PORT, () => console.log(`Server has started on port: ${PORT}`));