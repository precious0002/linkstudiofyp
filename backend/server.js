const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")

const app = express()
app.use(cors())

// for frontend files
const path = require("path");

app.use(express.static(path.join(__dirname)));
// loads homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const server = http.createServer(app)

const io = new Server(server, { 
    cors: {
        origin: "*"
    }
})

const rooms = {};

// Listen for when a user connects to the server
io.on("connection", (socket) => {

    console.log("User connected:", socket.id)

    // When a user joins a room, adds the user to the room
    socket.on("join-room", ({ roomId, username }) => {

        // counts how many users are in the room
        const room = io.sockets.adapter.rooms.get(roomId);
        const count = room ? room.size : 0;

         // limit to 4 users
         if (count >= 4) {
            socket.emit("room-full");
            return;
         }

        socket.join(roomId);
      
        if (!rooms[roomId]) {
          rooms[roomId] = [];
        }

        // displays usernames
        rooms[roomId].push(username);

        io.to(roomId).emit("room-info", {
            roomId: roomId,
            userCount: count,
            users: rooms[roomId]
        });
    })

// When a user draws send drawing to other users in the same room
socket.on("drawing", (data) => {
    socket.to(data.roomId).emit("drawing", data)
})

// When a user clears the canvas
socket.on("clear", (roomId) => {
    socket.to(roomId).emit("clear")
})

})

// Starts the server on port 3001
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log("Server running on port" + PORT);
});

