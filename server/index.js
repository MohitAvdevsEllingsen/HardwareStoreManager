import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'
import apiRoutes from './routes/api.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://krishna-mobile:Mohit_123@cluster0.2zjsb9i.mongodb.net/hardware_store?retryWrites=true&w=majority'

// Middleware
app.use(cors())
app.use(express.json())

// API Routes
app.use('/api', apiRoutes)

// Serve Web Client in production/free host
const webDistPath = path.join(__dirname, '../web/dist')
app.use(express.static(webDistPath))

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API Endpoint Not Found' })
  }
  res.sendFile(path.join(webDistPath, 'index.html'))
})

// Database Connection & Server Start
console.log('Connecting to MongoDB Atlas database...')

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas!')
    app.listen(PORT, () => {
      console.log(`🚀 Hardware Store Manager Server running on port ${PORT}`)
      console.log(`📡 Local API: http://localhost:${PORT}/api`)
    })
  })
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB Atlas:', err)
  })
