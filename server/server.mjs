// my server.mjs
import { createServer } from 'http'
import { Server } from "socket.io"

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  }
});

const MAX_VALUE_PER_KEY = 2;
let onlinePlayers = [];
const rooms = {};
const playersAndChoices = {};
let users = [];


// Function to add a player with initial value null
function addPlayer(player) {
  if (!playersAndChoices.hasOwnProperty(player)) {
    playersAndChoices[player] = null;
  } else {
    throw new Error(`Player '${player}' already exists.`);
  }
}
// Function to remove a player
function removePlayer(player) {
  if (playersAndChoices.hasOwnProperty(player)) {
    delete playersAndChoices[player];
  } else {
    throw new Error(`Player '${player}' does not exist.`);
  }
}
// Function to set a player's value
function setPlayerValue(player, value) {
  if (playersAndChoices.hasOwnProperty(player)) {
    playersAndChoices[player] = value;
  } else {
    throw new Error(`Player '${player}' does not exist.`);
  }
}
// Function to reset a player's value to null
function resetPlayerValue(player) {
  if (playersAndChoices.hasOwnProperty(player)) {
    playersAndChoices[player] = null;
  } else {
    throw new Error(`Player '${player}' does not exist.`);
  }
}


function createRoom(key, value) {
  if (rooms[key]) {
    // If the key exists, push the value to the existing array
    rooms[key].push(value);
  } else {
    // If the key doesn't exist, create a new array with the value
    rooms[key] = [value];
  }
}
// Function to compare player selections
function comparePlayerSelections(player1, player2) {
  const player1Selection = playersAndChoices[player1];
  const player2Selection = playersAndChoices[player2];

  if (player1Selection === player2Selection) {
    return true;
  } else if (
    (player1Selection === 'rock' && player2Selection === 'scissors') ||
    (player1Selection === 'paper' && player2Selection === 'rock') ||
    (player1Selection === 'scissors' && player2Selection === 'paper')
  ) {
    return true;
  } else {
    return false;
  }
}

// let i = 0;

io.on("connection", clientSocket => {
  clientSocket.on('joined-user', (user) => {
    const player = {
      user,
      id: clientSocket.id
    }
    users.push(player)
    console.log("Players and their socket ID:" ,users)

    console.log("Player joined the server: " + user)
    onlinePlayers.push(user)
    addPlayer(user)

    //TODO: remove later
    console.log({onlinePlayers})
    console.log("After adding player:", playersAndChoices);
  })
  clientSocket.on('pickedItem', (choice, player, room) => {
    if (i >= 1) {
      io.to(room).emit('oh-well', "I SHOULD APPEAR")
      console.log("WOAH!!!!!")
    }
    i++;
    console.log("A pick happened...")



    // console.log(`${player} picked: ${choice}`)
    // setPlayerValue(player, choice)
    // console.log("Updated choices:", playersAndChoices);

    // if (rooms.hasOwnProperty(room) && rooms[room].length === 2) {
    //   const [player1, player2] = rooms[room];
    //   if (playersAndChoices[player1] !== null && playersAndChoices[player2] !== null) {
    //     const result = comparePlayerSelections(player1, player2);
    //     clientSocket.to(player1).emit('result', result);
    //     clientSocket.to(player2).emit('result', !result);
    //     resetPlayerValue(player1);
    //     resetPlayerValue(player2);
    //   }
    // }
  })

  clientSocket.on('host-room', (room, user) => {
    createRoom(room, user)
    clientSocket.join(room)
    console.log(`${user} has made a room...`)
    console.log({rooms})
  })

  clientSocket.on('join-room', (roomToJoin, player) => {
    try {
      if (roomToJoin.length !== 10) {
        clientSocket.emit('room-not-valid', "Room does not exist...")
        throw new Error("Key and value must be exactly 10 characters long.")
      }
      if (rooms[roomToJoin].length >= MAX_VALUE_PER_KEY) {
        clientSocket.emit('room-already-full', `Maximum limit (${MAX_VALUE_PER_KEY}) reached for key '${roomToJoin}'`)
        throw new Error("Room is already full!!!")
      }

      // Join a room
      createRoom(roomToJoin, player) 
      clientSocket.join(roomToJoin)
      console.log(`${player} has made a room on ${roomToJoin}`)
      console.log({rooms})

      if (rooms[roomToJoin].length >= MAX_VALUE_PER_KEY) {
        const existingPlayer = rooms[roomToJoin][0];
        clientSocket.to(roomToJoin).emit('match-found', [existingPlayer, player]);
        console.log("I HAVE SUCCESSFULLY CONNECTED YAHOO")
      }
    } catch (error) {
      console.error(error)
    }
  })
});

httpServer.listen(3000, () => {
  console.log('Server is connected')
});