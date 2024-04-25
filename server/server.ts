import express from 'express';
import { Server } from 'socket.io';
import mysql from 'mysql';
import fs from 'fs';
import config from './config';

const app = express();

// Ініціалізація сервера
const server = app.listen(config.server.port, "0.0.0.0");

// Ініціалізація доступів до websocket
const io = new Server(server, config.websocket);

// Параметри підключення до бази даних MySQL
const connection = mysql.createConnection(config.database);

// Підключення до бази даних
connection.connect((err: any) => {
  if (err) {
    console.error('Помилка підключення до бази даних:', err);
    return;
  }
  console.log('Підключено до бази даних MySQL');
});

let popupInfoData: any = null;

loadPopupInfo(() => {
  console.log('Дані popupInfo успішно завантажено');
});

function loadPopupInfo(callback: () => void) {
  fs.readFile('popupInfo.json', 'utf8', (err, data) => {
      if (err) {
          console.error('Помилка читання файлу:', err);
          return;
      }

      try {
          // Розпарсимо JSON дані та збережемо їх у глобальній змінній
          popupInfoData = JSON.parse(data);
          callback(); // Викликати зворотний виклик після завершення завантаження
      } catch (parseError) {
          console.error('Помилка парсингу JSON:', parseError);
      }
  });
}

// Обробник події підключення нового клієнта до WebSocket сервера
io.sockets.on('connection', (socket: any) => {
  handleNewPlayerConnection(socket.id);

  // Ініціалізація дошки
  socket.on('getBoardCells', () => {
    initBoard(socket);
  });

  // Купівля поля
  socket.on('buyCell', (message: any) => {
    connection.query('UPDATE players p JOIN board_cells cell ON p.cell_id = cell.id SET p.balance = p.balance - cell.cost WHERE p.player_id = ? AND p.balance - cell.cost >= 0', [socket.id], (err, results, fields) => {
      if (err) {
        console.error('Помилка оновлення балансу користувача:', err);
        return;
      }

      placePlayer();

      connection.query("INSERT INTO player_property_ownership (player_id, cell_id, property_level) SELECT ?, p.cell_id, 'base_rent' FROM players p WHERE p.player_id = ?", [socket.id, socket.id], (err, results, fields) => {
        if (err) {
          console.error('Помилка оновлення власності гравця:', err);
          return;
        }

        // initBoard(socket);

        nextTurn();
      });
    });
  });

  socket.on('rentCell', (message: any) => {
    connection.query(`
    UPDATE players AS p
    JOIN player_property_ownership AS ppo ON p.cell_id = ppo.cell_id
    JOIN board_cells AS bc ON ppo.cell_id = bc.id
    SET p.balance = (
        CASE
            WHEN p.balance - (
                CASE ppo.property_level
                    WHEN 'base_rent' THEN bc.base_rent
                    WHEN 'rent_0' THEN bc.rent_0
                    WHEN 'rent_1' THEN bc.rent_1
                    WHEN 'rent_2' THEN bc.rent_2
                    WHEN 'rent_3' THEN bc.rent_3
                    WHEN 'rent_4' THEN bc.rent_4
                    WHEN 'rent_5' THEN bc.rent_5
                    ELSE 0
                END
            ) < 0 THEN 0
            ELSE p.balance - (
                CASE ppo.property_level
                    WHEN 'base_rent' THEN bc.base_rent
                    WHEN 'rent_0' THEN bc.rent_0
                    WHEN 'rent_1' THEN bc.rent_1
                    WHEN 'rent_2' THEN bc.rent_2
                    WHEN 'rent_3' THEN bc.rent_3
                    WHEN 'rent_4' THEN bc.rent_4
                    WHEN 'rent_5' THEN bc.rent_5
                    ELSE 0
                END
            )
        END
    )
    WHERE p.player_id = ?;
    `, [socket.id], (err, results, fields) => {
        if (err) {
          console.error('Помилка переводу знімання балансу:', err);
          return;
        }
      });

      connection.query(`
      UPDATE players AS p1
      JOIN player_property_ownership AS ppo ON p1.cell_id = ppo.cell_id
      JOIN board_cells AS bc ON ppo.cell_id = bc.id
      JOIN players AS p2 ON ppo.player_id = p2.player_id
      SET p2.balance = p2.balance + (
          CASE ppo.property_level
              WHEN 'base_rent' THEN bc.base_rent
              WHEN 'rent_0' THEN bc.rent_0
              WHEN 'rent_1' THEN bc.rent_1
              WHEN 'rent_2' THEN bc.rent_2
              WHEN 'rent_3' THEN bc.rent_3
              WHEN 'rent_4' THEN bc.rent_4
              WHEN 'rent_5' THEN bc.rent_5
              ELSE 0
          END
      )
      WHERE p1.player_id = ?;
      `, [socket.id], (err, results, fields) => {
          if (err) {
            console.error('Помилка переводу знімання балансу:', err);
            return;
          }
        });

    placePlayer();

    nextTurn();
  });

  // Перехід до наступного гравця
  socket.on('nextTurn', (message: any) => {
    nextTurn();
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
        console.log(`Гравець з ID ${socket.id} передвинувся до поля ${newPos}.`);

        // Обрання всіх гравців
        connection.query('SELECT * FROM players WHERE session_id = ?', [1], (err, results, fields) => {
          if (err) {
            console.error('Помилка отримання всіх гравців данної сесії:', err);
            return;
          }
          
          // Відправка оновленних даних гравців
          // TODO Оновлення відразу всіх гравців, краще оновлювати одного
          io.emit('placeNewPlayer', results);

          connection.query('SELECT cell.type, pl_owner.player_id FROM board_cells cell LEFT JOIN player_property_ownership pl_owner on cell.id = pl_owner.cell_id WHERE cell.id = ?', [newPos], (err, results, fields) => {
            if (err) {
              console.error('Помилка отримання власності поля:', err);
              return;
            }

            if(results[0]['type'] === 'monopoly' && !results[0]['player_id']) {
              if (popupInfoData) {
                const buyCellData = popupInfoData.buyCell;
                socket.emit('showPlayerInfo', buyCellData);
              } else {
                  console.error('Дані popupInfo не завантажені');
              }
            } else if (results[0]['type'] == 'monopoly' && results[0]['player_id'] !== socket.id) {
              if (popupInfoData) {
                const rentCellData = popupInfoData.rentCell;
                socket.emit('showPlayerInfo', rentCellData);
              } else {
                  console.error('Дані popupInfo не завантажені');
              }
            } else if (results[0]['type'] !== 'monopoly') {
              nextTurn();
            } else {
              nextTurn();
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
          if (popupInfoData) {
            const throwDiceData = popupInfoData.throwDice;
            targetSocket.emit('showPlayerInfo', throwDiceData);
          } else {
              console.error('Дані popupInfo не завантажені');
          }
        } else {
          console.error(`Сокет з ID ${socketId} не знайдено`);
        }
  
      });
    }
  });

  // Вихід гравця
  socket.on('disconnect', () => {
    connection.query(`DELETE FROM player_property_ownership WHERE player_id = '${socket.id}'`);

    connection.query(`DELETE FROM players WHERE player_id = '${socket.id}'`);

    placePlayer();

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

    placePlayer();

    addPlayerToTurnOrder(socketId);
  });
}

function rotateTurnOrder(turnOrder: string): string {
  const turnOrderArr: any[] = turnOrder.split(',');
  const firstElement = turnOrderArr.shift();
  turnOrderArr.push(firstElement);
  return turnOrderArr.join(',');
}

function sendPopup (socket: any) {
  if (socket) {
      // Перевірити, чи дані popupInfo вже були завантажені
      if (popupInfoData) {
          const throwDiceData = popupInfoData.throwDice;
          socket.emit('showPlayerInfo', throwDiceData);
      } else {
          console.error('Дані popupInfo не завантажені');
      }
  } else {
      console.error(`Сокет не знайдено`);
  }
}

function nextTurn (){
  getTurnOrderFromDatabase(
    (turnOrder: string) => {
      const newTurnOrder = rotateTurnOrder(turnOrder);
      
      updateTurnOrderInDatabase(newTurnOrder);
      
      const socketId = newTurnOrder.split(',')[0];

      // Знаходження сокету гравця
      const targetSocket = io.sockets.sockets.get(socketId);

      sendPopup(targetSocket);
    }
  );
}

function getBoardData(successCallback: (results: any) => void, errorCallback: (err: any) => void) {
  const query = `
    SELECT 
      cell.*,
      players.color AS owner_color,
      CASE 
          WHEN player_owner.property_level = 'base_rent' THEN cell.base_rent
          WHEN player_owner.property_level = 'rent_0' THEN cell.rent_0
          WHEN player_owner.property_level = 'rent_1' THEN cell.rent_1
          WHEN player_owner.property_level = 'rent_2' THEN cell.rent_2
          WHEN player_owner.property_level = 'rent_3' THEN cell.rent_3
          WHEN player_owner.property_level = 'rent_4' THEN cell.rent_4
          WHEN player_owner.property_level = 'rent_5' THEN cell.rent_5
          ELSE 0 
      END AS rent
    FROM 
        board_cells AS cell
    LEFT JOIN 
        player_property_ownership AS player_owner ON cell.id = player_owner.cell_id
    LEFT JOIN 
        players ON player_owner.player_id = players.player_id
    ORDER BY 
        cell.field_order;
  `;

  executeQuery(query, [], successCallback, errorCallback);
}

function initBoard (socket: any) {
  getBoardData(
    (results: any) => {
      socket.emit('getBoardCells', results);
    },
    (err: any) => {
      console.error('Помилка отримання даних дошки:', err);
    }
  );
}

function getPlayersData(successCallback: (results: any) => void, errorCallback: (err: any) => void) {
  const query = `
    SELECT 
      * 
    FROM 
      players 
    WHERE session_id = ?
  `;

  executeQuery(query, [1], successCallback, errorCallback);
}

function placePlayer() {
  getPlayersData(
    (results: any) => {
      io.emit('placeNewPlayer', results);
    },
    (err: any) => {
      console.error('Помилка отримання гравців:', err)
    }
  );
}

function removePlayerFromTurnOrder(socketId: string) {
  getTurnOrderFromDatabase(
    (turnOrder: string) => {
      const updatedTurnOrder = turnOrder.split(',').filter((id: string) => id !== socketId).join(',');

      updateTurnOrderInDatabase(updatedTurnOrder);
    }
  );
}

function getTurnOrderFromDatabase(callback: (turnOrder: string) => void) {
  executeQuery(
    'SELECT turn_order FROM game_sessions WHERE session_id = ?', 
    [1], 
    (results: any) => {
        const turnOrder = results[0].turn_order || '';
        callback(turnOrder);
    },
    (err: any) => {
      console.log('Помилка отримання черговості ходу: ', err)
    }
  );
}

function updateTurnOrderInDatabase(newTurnOrder: string) {
  executeQuery(
      'UPDATE game_sessions SET turn_order = ? WHERE session_id = ?', 
      [newTurnOrder, 1], 
      () => {}, 
      (err: any) => console.log('Помилка оновлення черговості ходів:', err)
  );
}

function addPlayerToTurnOrder(socketId: string) {
  getTurnOrderFromDatabase(
    (turnOrder: string) => {
      const updatedTurnOrder = turnOrder + (turnOrder ? ',' : '') + socketId;

      updateTurnOrderInDatabase(updatedTurnOrder);
    }
  );
}

function executeQuery(sqlQuery: string, params: any, successCallback: any, errorCallback: any) {
  connection.query(sqlQuery, params, (err, results, fields) => {
      if (err) {
          errorCallback(err);
          return;
      }
      successCallback(results);
  });
}