const users = []

// addUser
const addUser = ({ id, username, room }) => {
    //Clean the data

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase();

    // validate the data error prevention 
    if (!username || !room) {
        return { error: "Invalid Input (Username or room is required)" }
    }

    //Check for existing users
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if (existingUser) {
        return {
            error: "Username is in use in the room"
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user }
}


// removeUser
const removeUser = ((id) => {
    const removeIndex = users.findIndex((user) => user.id === id)
    console.log(removeIndex)
    if (removeIndex !== -1) {
        return users.splice(removeIndex, 1)[0]
    }
})

const getUser = ((id) => {
    if (!id) return
    return users.find((user) => user.id === id)
})

const getUsersInRoom = ((room) => {
    if (room === undefined) return
    let roomUsers = []
    room = room.trim().toLowerCase()
    if (!room) {
        return []
    }

    return users.filter((user) => user.room === room)
})

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}