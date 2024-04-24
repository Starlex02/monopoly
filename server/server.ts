import express from 'express';
import { Server } from 'socket.io';
import mysql from 'mysql';
import fs from 'fs';

const app = express();

// Ініціалізація сервера
const server = app.listen(4201, "0.0.0.0", () => {
  console.log("server is listening on port 4201");
});

// Ініціалізація доступів до websocket
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
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
  handleNewPlayerConnection(socket.id);

  // Ініціалізація дошки
  socket.on('getBoardCells', () => {
    connection.query('SELECT * FROM board_cells ORDER BY field_order', (err, results, fields) => {
      if (err) {
        console.error('Помилка запиту до бази даних:', err);
        return;
      }
      socket.emit('getBoardCells', results);
    });
  });

  // Запис нових координат користувача до бази
  socket.on('moveToken', (message: any) => {
    connection.query('SELECT cell_id FROM players WHERE player_id = ?', [socket.id], (err, results, fields) => {
      if (err) {
        console.error('Помилка оновлення запису у таблиці players:', err);
        return;
      }

      // Вираховування нової позиції з врахуванням нового кола
      const newPos = results[0]['cell_id'] + message > 40 ? results[0]['cell_id'] + message - 40  : results[0]['cell_id'] + message;

      // Запис нової позицій гравця
      connection.query('UPDATE players SET cell_id = ? WHERE player_id = ?', [newPos, socket.id], (err, results, fields) => {
        if (err) {
          console.error('Помилка оновлення запису у таблиці players:', err);
          return;
        }
        console.log(`Гравець з ID ${socket.id} передвинувся до поля ${results[0] + message}.`);

        // Обрання всіх гравців
        connection.query('SELECT * FROM players WHERE session_id = ?', [1], (err, results, fields) => {
          if (err) {
            console.error('Помилка отримання всіх гравців данної сесії:', err);
            return;
          }
          
          // Відправка оновленних даних гравців
          // TODO Оновлення відразу всіх гравців, краще оновлювати одного
          io.emit('placeNewPlayer', results);

          // Отримання порядок ходу з бази
          connection.query('SELECT turn_order FROM game_sessions WHERE session_id = ?', [1], (err, results, fields) => {
            if (err) {
              console.error('Помилка отримання всіх гравців данної сесії:', err);
              return;
            }

            // Отримати поточний порядок ходу
            let turnOrder = results[0].turn_order || '';
            turnOrder = turnOrder.split(',');

            const firstElement = turnOrder.shift();
    
            // Додавання збереженого першого елемента в кінець масиву
            turnOrder.push(firstElement);

            const socketId = turnOrder[0];

            turnOrder = turnOrder.join(',');

            // Оновлення порядку хочу
            connection.query('UPDATE game_sessions SET turn_order = ? WHERE session_id = ?', [turnOrder, 1], (err, results, fields) => {
              if (err) {
                console.error('Помилка оновлення запису у таблиці game_sessions:', err);
                return;
              }
            });
  
            // Знаходження сокету гравця
            const targetSocket = io.sockets.sockets.get(socketId);
        
            // Відправка popupInfo
            if (targetSocket) {
              fs.readFile('popupInfo.json', 'utf8', (err, data) => {
                if (err) {
                  console.error('Помилка читання файлу:', err);
                  return;
              }
          
              try {
                  // Розпарсимо JSON дані
                  const popupInfo = JSON.parse(data);
          
                  // Отримаємо дані для конкретної дії (throwDice)
                  const throwDiceData = popupInfo.throwDice;
          
                  // Викликаємо функцію, яка передає дані на клієнт
                  targetSocket.emit('showDice', throwDiceData);
              } catch (parseError) {
                  console.error('Помилка парсингу JSON:', parseError);
              }
              });

              // targetSocket.emit('showDice', socketId);
            } else {
              console.error(`Сокет з ID ${socketId} не знайдено`);
            }
          });
        });
      });
    });
  });


  // Отримання всіх гравців
  connection.query('SELECT * FROM players WHERE session_id = ?', [1], (err, results, fields) => {
    if (err) {
      console.error('Помилка отримання всіх гравців данної сесії:', err);
      return;
    }

    // Початок гри
    if (results.length === 4) {
      connection.query('SELECT turn_order FROM game_sessions WHERE session_id = ?', [1], (err, results, fields) => {
        if (err) {
          console.error('Помилка запиту до бази даних:', err);
          return;
        }
  
        // Отримати поточний порядок ходу
        let turnOrder = results[0].turn_order || '';
        
        const socketId = turnOrder.split(',')[0];
  
        const targetSocket = io.sockets.sockets.get(socketId);
  
        if (targetSocket) {
            fs.readFile('popupInfo.json', 'utf8', (err, data) => {
              if (err) {
                console.error('Помилка читання файлу:', err);
                return;
            }
        
            try {
                // Розпарсимо JSON дані
                const popupInfo = JSON.parse(data);
        
                // Отримаємо дані для конкретної дії (throwDice)
                const throwDiceData = popupInfo.throwDice;
        
                // Викликаємо функцію, яка передає дані на клієнт
                targetSocket.emit('showDice', throwDiceData);
            } catch (parseError) {
                console.error('Помилка парсингу JSON:', parseError);
            }
            });
        } else {
          console.error(`Сокет з ID ${socketId} не знайдено`);
        }
  
      });
    }
  });

  // Вихід гравця
  socket.on('disconnect', () => {
    connection.query(`DELETE FROM players WHERE player_id = '${socket.id}'`);

    connection.query('SELECT * FROM players WHERE session_id = ?', [1], (err, results, fields) => {
      if (err) {
        console.error('Помилка отримання всіх гравців данної сесії:', err);
        return;
      }
      
      socket.broadcast.emit('placeNewPlayer', results);
    });

    removePlayerFromTurnOrder(socket.id);

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

function handleNewPlayerConnection(socketId: string) {
  console.log('Клієнт підключений до WebSocket сервера');

  const playerData = {
    player_id: socketId,
    name: `Player ${socketId}`,
    session_id: 1,
    balance: 1000,
    cell_id: 1,
    color: getRandomColor()
  };

  const sql = `INSERT INTO players SET ?`;

  connection.query(sql, playerData, (err, results, fields) => {
    if (err) {
      console.error('Помилка запиту до бази даних:', err);
      return;
    }

    connection.query('SELECT * FROM players WHERE session_id = ?', [1], (err, results, fields) => {
      if (err) {
        console.error('Помилка отримання всіх гравців данної сесії:', err);
        return;
      }
      
      io.emit('placeNewPlayer', results);
    });

    addPlayerToTurnOrder(socketId);
  });
}

function addPlayerToTurnOrder(socketId: string) {
  // Отримати поточний порядок ходу з бази даних
  connection.query('SELECT turn_order FROM game_sessions WHERE session_id = ?', [1], (err, results, fields) => {
    if (err) {
      console.error('Помилка запиту до бази даних:', err);
      return;
    }

    // Отримати поточний порядок ходу
    let turnOrder = results[0].turn_order || '';

    // Додати новий ID користувача до порядку ходу
    turnOrder += (turnOrder ? ',' : '') + socketId;

    // Оновити запис у таблиці game_sessions з новим порядком ходу
    connection.query('UPDATE game_sessions SET turn_order = ? WHERE session_id = ?', [turnOrder, 1], (err, results, fields) => {
      if (err) {
        console.error('Помилка оновлення запису у таблиці game_sessions:', err);
        return;
      }
      console.log(`Гравець з ID ${socketId} доданий до порядку ходу.`);
    });
  });
}

function removePlayerFromTurnOrder(socketId: string) {
  // Отримати поточний порядок ходу з бази даних
  connection.query('SELECT turn_order FROM game_sessions WHERE session_id = ?', [1], (err, results, fields) => {
    if (err) {
      console.error('Помилка запиту до бази даних:', err);
      return;
    }

    // Отримати поточний порядок ходу
    let turnOrder = results[0].turn_order || '';

    // Видалити ID користувача з порядку ходу, якщо він є
    turnOrder = turnOrder.split(',').filter((id: string) => id !== socketId).join(',');

    // Оновити запис у таблиці game_sessions з оновленим порядком ходу
    connection.query('UPDATE game_sessions SET turn_order = ? WHERE session_id = ?', [turnOrder, 1], (err, results, fields) => {
      if (err) {
        console.error('Помилка оновлення запису у таблиці game_sessions:', err);
        return;
      }
      console.log(`Гравець з ID ${socketId} видалений з порядку ходу.`);
    });
  });
}

