const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io") //1
const Filter = require("bad-words")
const { generateMessage, generateLocationMessage } = require("./utils/messages")
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/user')


const app = express()
const server = http.createServer(app)
// 2. configure socketio
const io = socketio(server)
// 3. Set up the static path & port
const publicDirectoryPath = path.join(__dirname, '../public')
const port = process.env.PORT || 3000

app.use(express.static(publicDirectoryPath))
let count = 0
// 4. when client connect, do something for them
io.on('connection', (socket) => {
    console.log("New Websocket Connection Established")
    // socket.emit(eventname, variable)


    socket.on('join', (options, callback) => {
        //socket.join: join in and pass through the chat room
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage("Admin", "Welcome"))
        socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
        // socket.emit
        // io.emit
        // socket.broadcast.emit
        // new one: io.to(roomid).emit (emit an event to the specific room)
        // socket.broadcast.to(roomid).emit (emit an event to everyone except for the client in the specific room)

    })
    socket.on('sendMessage', (msg, callback) => {
        const filter = new Filter()
        user = getUser(socket.id)

        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback()
    })

    socket.on('disconnect', () => {
        user = removeUser(socket.id)

        if (!user) {
            return console.log("this user not in the room")
        }

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        io.to(user.room).emit("message", generateMessage("Admin", `${user.username} leaves the room`))
    })
    socket.on('sendLocation', (location, callback) => {
        user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback("ACK")
    })
    /*socket.on('increment', () => {
        count++;
        //only one connection
        //socket.emit('countUpdated', count)
        //below is like the broadcast function to deliver message to other connection
        io.emit('countUpdated', count)
    })*/
})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})