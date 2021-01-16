const express = require('express')
const cors = require('cors')

const app = express()
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

app.listen(process.env.PORT || 8080, () => console.log('server started'))
