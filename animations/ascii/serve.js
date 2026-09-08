// Dependency-free static server for the ASCII frontend.
const http = require('http')
const fs = require('fs')
const path = require('path')

const ROOT = __dirname
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
}

function serve(req, res) {
  try {
    const url = new URL(req.url, 'http://localhost')
    let p = path.normalize(decodeURIComponent(url.pathname))
    if (p.endsWith('/') || p === '.') p = path.join(p, 'index.html')
    const file = path.join(ROOT, p)
    if (!file.startsWith(ROOT + path.sep) && file !== ROOT) {
      res.writeHead(403, { 'Content-Type': 'text/plain' })
      res.end('403')
      return
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('404')
        return
      }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      })
      res.end(data)
    })
  } catch (err) {
    console.error(err.stack)
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('500')
  }
}

function listen(port, attempt) {
  const server = http.createServer(serve)
  server.on('error', err => {
    if (err.code === 'EADDRINUSE' && attempt < 10) {
      console.error(`port ${port} in use, trying ${port + 1}`)
      listen(port + 1, attempt + 1)
    } else {
      console.error(err.stack)
      process.exit(1)
    }
  })
  server.listen(port, '127.0.0.1', () => {
    console.log(`SUPERBOT.GG ascii frontend -> http://localhost:${port}`)
  })
}

listen(Number(process.env.PORT) || 5317, 0)
