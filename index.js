import http from 'http'
import path from 'path'
import express from 'express'

const app=express()
const server=http.createServer(app);

app.use(express.static(path.resolve('./public')))


server.listen(3000,()=>{console.log('HTTP server is running on port 3000')})
