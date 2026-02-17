const express = require('express');
const http = require('http');
// ✅ 'Server' is imported correctly here, and only here.
const { Server } = require("socket.io"); 
const connectDB = require('./db');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

connectDB();

app.use(cors());
app.use(express.json());

// --- WebSocket Connection Logic ---
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
}); // Allow us to accept JSON data in the body

// Define a simple test route
app.get('/', (req, res) => res.send('API is running...'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/sos', require('./routes/sos'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/queries', require('./routes/queries'));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server (including WebSocket) started on port ${PORT}`));