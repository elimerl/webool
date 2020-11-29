const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send("Hello world!")
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
const fs = require('fs')
fs.readFileSync('I wrote a LIVE text editor with real time collaboration and syntax highlighting ')
