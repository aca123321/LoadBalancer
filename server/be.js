const express = require('express')
const app = express()
const port = process.argv[2] || 3000

app.get('/', (req, res) => {
  console.log(`\nReceived request from ${req.headers['x-forwarded-for'] || req.socket.remoteAddress }`)
  console.log(`${req.method} / ${req.protocol}`)
  console.log(`Host: ${req.hostname}`)
  console.log(`${req.header('user-agent')}`)
  console.log(`Accept: ${req.header('accept')}`)
  res.send({port})
})

app.get('/health-check', (req, res) => {
  res.send()
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})