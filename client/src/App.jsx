// my app.jsx
import { useEffect, useState } from 'react'
import io from 'socket.io-client'
import './App.css'

function App() {
  const [start, setStart] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [hasHosted, setHasHosted] = useState(false)
  const [playerID, setPlayerID] = useState('')
  const [opponentID, setOpponentID] = useState('')
  const [roomToJoin, setRoomToJoin] = useState('')
  const [error, setError] = useState('')
  const socket = io('localhost:3000')


  //! Sockets being Sockets i guess
  useEffect(() => {
    socket.on('connect', () => {
      console.log(socket.id)
    })
    setIsDone(true)

    socket.on('room-not-valid', (message) => {
      setError(message)
      setRoomToJoin('')
    })

    socket.on('room-already-full', (message) => {
      setError(message)
    })

    socket.on('match-found', (players) => {
      setError("Match Found")
      console.log('An enemy has been found:', players);
      setOpponentID(players.player)
    })

    socket.on('oh-well', (message) => {
      console.log(message);
      setError(message)
    })

    return () => {
      // Clean up event listeners
      socket.off('connect')
      socket.off('room-not-found')
      socket.off('room-already-full')
      socket.off('match-found')
    };
  }, [socket])


  //! Generate random ID when component mounts
  useEffect(() => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    const charactersLength = characters.length
    for (let i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    setPlayerID(result)
  }, [])


  //! Game Mechanics
  function play() {
    if (!start) socket.emit('joined-user', playerID);
    setStart(true)
  }
  function letsGame() {
    socket.emit('ready', true)
  }
  function createRoom() {
    if (!hasHosted && start) {
      socket.emit('host-room', roomToJoin, playerID)
      console.log(`${playerID} has hosted a server...`)
      setHasHosted(true)
    }
  }
  function joinRoom() {
    socket.emit('join-room', roomToJoin, playerID)
  }
  function playerChoice(choice) {
    if (start && roomToJoin) {
      console.log(`You picked: ${choice}`);
      socket.emit('pickedItem', choice, playerID, roomToJoin);
    }
  }

  
  return (
    <>
      <h1>React Multiplayer Dashboard</h1>
      <p>Player ID: {playerID}</p>
      {isDone && <p>Socket connected succesfully...</p>}
      <div>
        <h2>Wanna play?</h2>
        <button onClick={() => play()}>Play</button>
        <button onClick={() => letsGame()}>Game</button>
      </div>
        <h2>Jankenpoi</h2>
        <button onClick={() => playerChoice('rock')}>Rock</button>
        <button onClick={() => playerChoice('paper')}>Paper</button>
        <button onClick={() => playerChoice('scissors')}>Scissors</button>
      <div>
        <h2>Server</h2>
        <button onClick={() => createRoom()}>Host</button>
        <input placeholder='Room to Join...' type="text" onChange={(event) => setRoomToJoin(event.target.value)}/>
        <button onClick={() => joinRoom()}>Join</button>
      </div>
      <p>{error}</p>
      <h4>{opponentID}</h4>
    </>
  )
}

export default App
