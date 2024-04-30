// my server.mjs
import { createServer } from 'http'
import { Server } from "socket.io"

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  }
});

// const MAX_VALUE_PER_KEY = 2;
// let onlinePlayers = [];
// const rooms = {};
// const playersAndChoices = {};
let users = [];
let i = 0;

io.on("connection", socket => {
  console.log(socket.id)
  socket.on("send-message", (message, room) => {
    if (room === "") {
    // io.emit("receive-message", message)
    socket.broadcast.emit("receive-message", message)
    } else {
      socket.to(room).emit("receive-message", message)
    }
  })

  socket.on('join-room', (user, room) => {
    socket.join(room)
    users.push(user)
    console.log(users.length)
    if (i >= 1) {
      socket.to(room).emit('joined-user', "Let's GOOO")
      console.log(users[0] + " : " +  users[1])
    }
    i++;
  })
})

httpServer.listen(3000, () => {
  console.log('Server is connected')
});