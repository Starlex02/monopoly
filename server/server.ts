import express from 'express';
import { Server } from 'socket.io';
import mysql from 'mysql';
import cors from 'cors';

const app = express();
app.use(cors()); // Додайте цей рядок для налаштування CORS

const server = app.listen(4201, "0.0.0.0", () => {
  console.log("server is listening on port 4201");
});

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

  socket.on('getBoardCells', (message: any) => {
    connection.query('SELECT * FROM board_cells', (err, results, fields) => {
      if (err) {
        console.error('Помилка запиту до бази даних:', err);
        return;
      }
      socket.emit('getBoardCells', results);
    });
  });

  socket.on('disconnect', () => {
    console.log('Клієнт відключений від WebSocket сервера');
  });
});
