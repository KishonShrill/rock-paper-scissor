import { useEffect, useState } from 'react'
import io from 'socket.io-client'
const socket = io('localhost:3000')

function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [userID, setUserID] = useState('');
  const [recipient, setRecipient] = useState('');
  const [notification, setNotification] = useState('');

  // Function to handle sending a message
  const sendMessage = () => {
    // Add validation or other logic here before sending the message
    const newMessage = {
      id: Math.random().toString(36), // Generate a random ID for the message
      content: message,
      sender: 'User', // Replace 'User' with the actual sender's ID
      // recipient: recipient // Add recipient information here
    };

    socket.emit("send-message", newMessage, recipient); // Emit the new message object

    // Update the messages state with the new message
    setMessages(prevMessages => [...prevMessages, newMessage]);

    // Clear the message input field after sending
    setMessage('');
  };

  const joinRoom = () => {
    socket.emit('join-room', userID, recipient)
  }

  useEffect(() => {
    socket.on('connect', () => {
      console.log(socket.id)
      setUserID(socket.id)
    });

    socket.on("receive-message", newMessage => {
      setMessages(prevMessages => [...prevMessages, newMessage]); // Update messages state with received message
    });

    socket.on("joined-user", meemaw => {
      setNotification(`User ${meemaw} has joined`)
    })

    return () => {
      // Clean up event listeners
      socket.off('connect');
      socket.off('receive-message');
    };
  }, [socket]);
  
  return (
    <div>
      <h1>{userID}'s Messages</h1>
      {/* Display messages */}
      {messages.map(msg => (
        <div key={msg.id}>
          <h3>From: {msg.sender}</h3>
          <span>{msg.content}</span>
          {/* <p>To: {msg.recipient}</p> */}
        </div>
      ))}
      {/* Input fields for sending a new message */}
      <textarea
        placeholder="Type your message here..."
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="To:"
        value={recipient}
        onChange={e => setRecipient(e.target.value)}
      />
      <br />
      <button onClick={sendMessage}>Send</button>
      <button onClick={joinRoom}>Join</button>
      <p>{notification}</p>
    </div>
  )
}

export default Chat;
