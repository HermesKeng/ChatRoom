

const socket = io()
// Elements
var btn = document.getElementById("send-btn")
var share_LocBtn = document.getElementById("send-location")
var form = document.getElementById("message-form")
var input = document.getElementById("message-input")
const $messages = document.querySelector("#messages")
const $chatSideBar = document.querySelector("#sidebar")
let localCount = 0

// Template
const messageTemplate = document.getElementById("message-template").innerHTML
const locationMsgTemplate = document.getElementById("location-message-template").innerHTML
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML
// Options Parse the query string and deliver to server
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
const autoscroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    //how far to scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}
// use socket.on (eventname, callback) 
socket.on("message", (msg) => {
    const html = Mustache.render(messageTemplate, { username: msg.username, message: msg.text, createAt: moment(msg.createAt).format("hh:mm a") })
    $messages.insertAdjacentHTML('beforeEnd', html)
    autoscroll()
})

socket.on("locationMessage", (msg) => {
    console.log(msg)
    const html = Mustache.render(locationMsgTemplate, { username: msg.username, location: msg.url, createAt: moment(msg.createAt).format("hh:mm a") })
    $messages.insertAdjacentHTML('beforeEnd', html)
    autoscroll()
})
socket.on('roomData', ({ room, users }) => {
    console.log(room)
    const html = Mustache.render(sidebarTemplate, { room: room, users })
    $chatSideBar.innerHTML = html
})

btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!input.value) {
        return
    }
    //disable
    btn.setAttribute("disabled", "disabled")
    socket.emit("sendMessage", input.value, (error) => {
        btn.removeAttribute("disabled")
        input.value = ""
        input.focus()
        //enable
        if (error) {
            return console.log(error)
        }
        console.log("The message is delivered")

    })
})

share_LocBtn.addEventListener("click", () => {
    if (!"geolocation" in navigator) {
        console.log("Geolocation is not support through your browser")
    }
    share_LocBtn.setAttribute("disabled", "disabled")
    navigator.geolocation.getCurrentPosition((position) => {


        socket.emit("sendLocation", { latitude: position.coords.latitude, longitude: position.coords.longitude }, () => {
            console.log("Location shared ")
            share_LocBtn.removeAttribute("disabled")
        })
    })

})

socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
    console.log("successfully login")
})