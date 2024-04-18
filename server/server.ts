import express from 'express';
import { Server } from 'socket.io';
import mysql from 'mysql';

const app = express();

const server = app.listen(4201, "0.0.0.0", () => {
  console.log("server is listening on port 4201");
});

let players = [];

const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200", // Встановіть URL вашого клієнта Angular
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});


// Параметри підключення до бази даних MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'monopoly',
  password: 'password',
  database: 'monopoly'
});

// Підключення до бази даних
connection.connect((err: any) => {
  if (err) {
    console.error('Помилка підключення до бази даних:', err);
    return;
  }
  console.log('Підключено до бази даних MySQL');
});

// Обробник події підключення нового клієнта до WebSocket сервера
io.sockets.on('connection', (socket: any) => {
  console.log('Клієнт підключений до WebSocket сервера');

  const newPlayerInfo = {id: socket.id, name: `Player ${socket.id}`, color: getRandomColor(), balance: 1000};
  players.push(newPlayerInfo);
  socket.broadcast.emit('placeNewPlayer', players);
  socket.emit('placeNewPlayer', players);

  socket.on('getBoardCells', () => {
    connection.query('SELECT * FROM board_cells', (err, results, fields) => {
      if (err) {
        console.error('Помилка запиту до бази даних:', err);
        return;
      }
      socket.emit('getBoardCells', results);
    });
  });

  socket.on('disconnect', () => {
    players.forEach((player, index) => {
      if (player.id === socket.id) {
        players.splice(index, 1);
      }
    });
    socket.broadcast.emit('placeNewPlayer', players);
    console.log('Клієнт відключений від WebSocket сервера');
  });
});

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}