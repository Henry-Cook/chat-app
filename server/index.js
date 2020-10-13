const express = require("express");
const socketio = require("socket.io");
const http = require("http");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users.js");

const PORT = process.env.PORT || 5000;

const router = require("./router");
const { callbackify } = require("util");

const app = express();

// We add these to enable Socket.io
const server = http.createServer(app);
const io = socketio(server);

// All of the web socket actions will be managed in this function below.
io.on("connection", (socket) => {
  // This is the main method that will do an action when the connection is
  // made on the front end. This method "Catches" that connection.
  socket.on("join", ({ name, room }, callBack) => {
    // These lines add a user to a specific room.
    // This next line looks for the room the user wants to join
    const user = addUser({ id: socket.id, name, room });

    // Error handling if the room does not exist
    // if (error) return callBack(error);

    // This will provide a generic message to the user when they join a room
    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to the room ${user.room}`,
    });

    // This provides a message to everyone in the room that a user has joined the room
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    // This is a socket.io method that actually does the joining
    socket.join(user.room);
  });

  // This method will listen for user generated messages, it's different from the others because
  // will will emit initially from the front end not the backend, and then emit again back to the front end.
  socket.on("sendMessage", (message, callback) => {
    // This grabs which user is submitting the message
    const user = getUser(socket.id);

    // This send the message from that user to the front end.
    io.to(user.room).emit(message, { user: user.name, text: message });
  });

  // This is handles the user leaving the chat and ends the connection.
  socket.on("disconnect", () => {
    console.log("User Has left");
  });
});

app.use(router);

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
