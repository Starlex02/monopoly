import WebSocket, { WebSocketServer } from 'ws';
import mysql from 'mysql';

// Параметри підключення до бази даних MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'monopoly',
  password: 'password',
  database: 'monopoly'
});

// Підключення до бази даних
connection.connect((err) => {
  if (err) {
    console.error('Помилка підключення до бази даних:', err);
    return;
  }
  console.log('Підключено до бази даних MySQL');
});

// Створення WebSocket сервера
const wsServer = new WebSocketServer({ port: 4201 });

// Обробник події підключення нового клієнта до WebSocket сервера
wsServer.on('connection', (ws: WebSocket) => {
  console.log('Клієнт підключений до WebSocket сервера');

  // Обробник події при отриманні повідомлення від клієнта
  ws.on('message', (message: string) => {
    console.log(`Отримано повідомлення від клієнта: ${message}`);
    
    // Наприклад, виконати запит до бази даних MySQL
    connection.query('SELECT * FROM board_cells', (err, results, fields) => {
      if (err) {
        console.error('Помилка запиту до бази даних:', err);
        return;
      }
      console.log('Результати запиту:', results);
    });
  });

  // Обробник події відключення клієнта від WebSocket сервера
  ws.on('close', () => {
    console.log('Клієнт відключений від WebSocket сервера');
  });
});
