require('dotenv').config();
const app = require('./src/app');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

// Crear servidor HTTP
const server = http.createServer(app);

// Configurar Socket.io para pujas en tiempo real
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Manejo de conexiones WebSocket
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Unirse a una sala de subasta específica
  socket.on('join-auction', (auctionId) => {
    socket.join(`auction-${auctionId}`);
    console.log(`Cliente ${socket.id} se unió a auction-${auctionId}`);
  });

  // Salir de una sala de subasta
  socket.on('leave-auction', (auctionId) => {
    socket.leave(`auction-${auctionId}`);
    console.log(`Cliente ${socket.id} salió de auction-${auctionId}`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Hacer io accesible en toda la aplicación
app.set('io', io);

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`WebSocket habilitado para tiempo real`);
  console.log(`Ambiente: ${process.env.NODE_ENV}`);
});

module.exports = { server, io };