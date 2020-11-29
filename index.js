const os = require('os');
const pty = require('node-pty');
const { stdout, stdin } = require('process');
const shell = 'zsh';
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const { Socket, Server } = require('socket.io');
/**
 * @type {import 'socket.io'.Server}
 */
const io = require('socket.io')(server)
const fs = require('fs');
const port = 3000
const path = require('path')
const serveIndex = require('serve-index')
const mime = require('mime-types')
const isBinary = require('is-binary-buffer');
const morgan = require('morgan')
const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env
});
app.use(express.json())
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', { stream: fs.createWriteStream('./log.txt') }))
io.of('/edit').on('connection', (/** @type {Socket} */socket) => {
    socket.on('edit', (msg) => {
        fs.writeFileSync(path.join(process.env.HOME, msg.path.replace('/files', '')), msg.content)
    })
    socket.on('editing', (p) => {
        fs.watch(path.join(process.env.HOME, p.replace('/files', '')), (event, filename) => {
            if (event === 'change') {
                socket.emit('changed')
            }
        })
    })
});
// Handle requests for the raw file
app.use('/raw', (req, res, next) => {
    const p = path.join(process.env.HOME, decodeURIComponent(req.url))
    if (req.method === 'GET') {
        if (fs.existsSync(p)) {
            if (fs.statSync(p).isDirectory()) {
                res.status(400).send("Cannot request a directory")
            } else {
                res.status(200).send(fs.readFileSync(p))
            }
        } else {
            res.status(404).send('The file could not be found.')
        }

    }
})
// Handle requests for the editor
app.use('/files', (req, res, next) => {
    const p = path.join(process.env.HOME, decodeURIComponent(req.url))
    if (req.method === 'GET') {
        if (fs.existsSync(p)) {
            if (fs.statSync(p).isDirectory()) {
                next()
            } else {
                if (!isBinary(fs.readFileSync(p))) {
                    let language;
                    Object.keys(require('./languages.json')).forEach(lang => {
                        if (require('./languages.json')[lang].extensions.includes('.' + p.split('.').pop())) {
                            language = lang;
                        }
                    })
                    res.status(200).send(fs.readFileSync(__dirname + '/editor.htm', 'utf-8').replace(/{{FileName}}/g, path.basename(p)).replace(/{{FileLang}}/g, language).replace(/`{{LoadTypings}}`/g, (language === 'javascript' || language === 'typescript') ? fs.readFileSync('./monaco.js') : ''))
                } else {
                    res.status(200).sendFile(p)
                }

            }
        } else {
            res.status(404).send('The file could not be found.')
        }
    }

})

// Handle directory listings
app.use('/files', serveIndex(process.env.HOME))
// Handle favicons
app.use('/', express.static(__dirname + '/favicon/'))
// Handle live terminal
io.on('connection', (/** @type {Socket} */socket) => {
    socket.on('resize', (msg) => {
        ptyProcess.resize(msg.cols, msg.rows)

    })
    socket.on('key', (key) => {
        ptyProcess.write(key)
    })

    ptyProcess.onData((data) => {
        socket.emit('data', data)
    });
});
// Send index.html when requested
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.htm')
});
// Listen on port
server.listen(port, () => {
    console.log(`View terminal at http://localhost:${port}`)
})