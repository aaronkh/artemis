const express = require('express')
const cors = require('cors')

const app = express()
const sockServer = require('http').Server(app)
const io = require('socket.io')(sockServer, {origins: '*:*'})
app.use(express.json())

/* HTTP Methods 
 * 
 * app.get('/path', (req, res) => {
 *      // do stuff 
 *      res.send(200)
 *  })
 *
 * app.post('/path', (req, res) => {
 *      // do stuff 
 *      res.send(req.body)
 * })
 *
 * */

/* Socket.io logic
 *
 */
io.on('connection', sock => {
    // Do something with the new socket
    // socket.on('event', () => {
    //      socket.emit('event name', {data: 1})
    // })
    return true
})

io.listen(process.env.WSPORT || 5000)

app.listen(process.env.PORT || 8080, () => console.log('server started'))
