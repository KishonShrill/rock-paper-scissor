const clientSocket = io("http://localhost:3000")

clientSocket.on("connect", (response) => {
  console.log(response)
});

clientSocket.on('message', (data) => {
  console.log(data)

  clientSocket.emit("message", 'Hello there broski!')
})