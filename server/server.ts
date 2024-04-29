import express from 'express';
import { Server } from 'socket.io';
import mysql from 'mysql';
import fs from 'fs';
import config from './config';

const app = express();

// Ініціалізація сервера
const server = app.listen(config.server.port, "0.0.0.0", () => {
  console.log("Сервер прослуховує порт 4201");
});

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

// Обробник події підключення нового клієнта до WebSocket сервера
io.sockets.on('connection', (socket: any) => {
  handleNewPlayerConnection(socket.id);

  // Ініціалізація дошки
  socket.on('getBoardCells', () => {
    initBoard(socket);
  });

  // Купівля поля
  socket.on('buyCell', (message: any) => {
    updatePlayerBalanceAndPlacePlayer(socket.id, () => {
      setPlayerPropertyOwnership(socket.id, () => {
          nextTurn();
      });
  });
  });

  socket.on('rentCell', (message: any) => {
    handleRentPayment(socket.id);
  });

  socket.on('getCash', (cash: any) => {
    handleGetCash(socket.id, cash, ()=> {placePlayer(), nextTurn()});
  });

  socket.on('payCash', (cash: any) => {
    handlePayCash(socket.id, cash, ()=> {
      placePlayer();
      nextTurn();
    });
  });

  socket.on('payOff', (cash: any) => {
    handlePayCash(socket.id, cash, ()=>{
      placePlayer();
    });
    sendPopup(socket, 'throwDice');
  });


  // Перехід до наступного гравця
  socket.on('nextTurn', (message: any) => {
    nextTurn();
  });

  // Запис нових координат користувача до бази
  socket.on('moveToken', (message: any) => {
    updatePlayerPosition(socket.id, message, 
      (newPosition: any) => {
        getPlayersAndUpdate(socket, newPosition);
      },
      (err: any) => {
        console.log('Помилка оновлення позиції гравця', err);
      }
    );
  });

  // Початок гри
  handleGameStart();

  // Вихід гравця
  socket.on('disconnect', () => {
    handleDisconnect(socket.id);
  });
});

function updatePlayerBalanceAndPlacePlayer(socketId: any, callback: any) {
  const updateQuery = `
      UPDATE players p 
      JOIN board_cells cell ON p.cell_id = cell.id 
      SET p.balance = p.balance - cell.cost 
      WHERE p.player_id = ? AND p.balance - cell.cost >= 0
  `;
  
  executeQuery(updateQuery, [socketId],
    () => {
      placePlayer();
      callback();
    },
    (err: any) => {
      console.error('Помилка оновлення балансу користувача:', err);
    }
  )
}

function setPlayerPropertyOwnership(socketId: any, callback: any) {
  const insertQuery = `
      INSERT INTO player_property_ownership (player_id, cell_id, property_level) 
      SELECT ?, p.cell_id, 'base_rent' 
      FROM players p 
      WHERE p.player_id = ?
  `;

  executeQuery(insertQuery, [socketId, socketId], 
    ()=> callback(),
    (err: any) => {
      console.error('Помилка оновлення власності гравця:', err);
    }
  )
}

function handleRentPayment(socketId: any) {
  updatePlayerBalance(socketId, () => {
      updatePropertyOwnerBalance(socketId, () => {
          placePlayer();
          nextTurn();
      }, (err: any) => {
          console.error('Помилка переводу знімання балансу власника властивості:', err);
      });
  }, (err: any) => {
      console.error('Помилка переводу знімання балансу гравця:', err);
  });
}

function updatePropertyOwnerBalance(playerId: any, onSuccess: Function, onError: Function) {
  const query = `
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
  `;
  executeQuery(query, [playerId],
    () => onSuccess(),
    (err: any) => {
      onError(err);
    }
  )
}

function updatePlayerBalance(playerId: any, onSuccess: Function, onError: Function) {
  const query = `
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
  `;
  
  executeQuery(query, [playerId],
    () => onSuccess(),
    (err: any) => {
      onError(err);
    }
  )
}

function getCurrentPosition(socketId: any, onSuccess: Function, onError: Function) {
  const query = 'SELECT cell_id FROM players WHERE player_id = ?';
  executeQuery(query, [socketId],
    (results: any) => {
      onSuccess(results);
    },
    (err: any) => {
      onError(err);
    }
  );
}

// Оновлення позиції гравця в базі даних
function updatePositionInDatabase(newPos: number, socketId: any, callback: Function, onError: Function) {
  const updateQuery = 'UPDATE players SET cell_id = ? WHERE player_id = ?';
  executeQuery(updateQuery, [newPos, socketId],
    () => {
      callback(newPos);
    },
    (err: any) => {
      onError(err);
    }
  );
}

// Функція для обробки переміщення токена гравця
function updatePlayerPosition(socketId: any, message: any, onSuccess: Function, onError: Function) {
  getCurrentPosition(socketId,
    (results: any) => {
      const currentPosition = results[0]['cell_id'];
      const diceNumber = message[0] + message[1];

      const newPos = currentPosition + diceNumber > 40 ? currentPosition + diceNumber - 40 : currentPosition + diceNumber;
      if (currentPosition + diceNumber > 40) {
        handleGetCash(socketId, 1000, placePlayer);
      }
      updatePositionInDatabase(newPos, socketId, 
        () => {
          onSuccess(newPos);
        }, 
        (err: any) => {
          onError(err);
        }
      );
    },
    (err: any) => {
      onError(err);
    }
  );
}

// Отримання даних гравців
function getPlayersAndUpdate(socket: any, newPosition: any) {
  getPlayersData(
    (results) => {
      io.emit('placeNewPlayer', results);
      handleCellType(newPosition, socket);
    },
    (err) => {
      console.error('Помилка отримання всіх гравців данної сесії:', err);
    }
  );
}

// Обробка клітини
function handleCellType(newPosition: any, socket: any) {
  const query = 'SELECT cell.type, pl_owner.player_id FROM board_cells cell LEFT JOIN player_property_ownership pl_owner on cell.id = pl_owner.cell_id WHERE cell.id = ?';
  executeQuery(query, [newPosition],
    (results: any) => {
      if (results[0]['type'] === 'monopoly' && !results[0]['player_id']) {
        sendPopup(socket, 'buyCell');
      } else if (results[0]['type'] === 'monopoly' && results[0]['player_id'] !== socket.id) {
        sendPopup(socket, 'rentCell');
      } else if(results[0]['type'] === 'chance'){
        sendPopup(socket, 'chance');
      } else if (results[0]['type'] === 'start') {
        handleGetCash(socket.id, 500, ()=> {placePlayer(), nextTurn()});
      } else if (results[0]['type'] === 'prison') {
        getTurnOrderFromDatabase(
          (turnOrder: any) => {
            let newTurnOrder = turnOrder.split(',').map((el: string) => {
              const [socketId, rest] = el.split(':');
              if (socketId === socket.id) {
                  return `${socketId}:${parseInt(rest) + turnOrder.split(',').length}`;
              } else {
                  return el;
              }
            }).join(',');

            updateTurnOrderInDatabase(newTurnOrder, nextTurn);
          }
        );
      } else {
        nextTurn();
      }
    },
    (err: any) => {
      console.error('Помилка отримання власності поля:', err);
    }
  );
}

function handleGameStart() {
  getPlayersData(
    (results: any) => {
      if (results.length === 4) {
        getTurnOrderFromDatabase(
          (turnOrder: string) => {
            const socketId = turnOrder.split(',')[0].split(':')[0];
            const targetSocket = io.sockets.sockets.get(socketId);
      
            if (targetSocket) {
              sendPopup(targetSocket, 'throwDice');
            } else {
              console.error(`Сокет з ID ${socketId} не знайдено`);
            }
          }
        );
      }
    },
    (err: any) => {
      console.error('Помилка отримання всіх гравців данної сесії:', err);
    }
  )
}

function handleDisconnect(socketId: string) {
  deletePlayerPropertyOwnership(socketId);
  deletePlayer(socketId);
  placePlayer();
  removePlayerFromTurnOrder(socketId);
  console.log('Клієнт відключений від WebSocket сервера');
}

function deletePlayer(socketId: string) {
  const query = 'DELETE FROM players WHERE player_id = ?';
  executeQuery(query, [socketId],
    () => {},
    (err: any) => {
      console.error('Помилка видалення гравця:', err);
    }
  );
}

function deletePlayerPropertyOwnership(socketId: string){
  const query = 'DELETE FROM player_property_ownership WHERE player_id = ?';
  executeQuery(query, [socketId],
    () => {},
    (err: any) => {
      console.error('Помилка видалення власності гравця:', err);
    }
  )
}

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

  const query = `INSERT INTO players SET ?`;

  executeQuery(query, playerData, 
    () => {
      placePlayer();

      addPlayerToTurnOrder(socketId);
    },
    (err: any) => {
      console.error('Помилка запиту до бази даних:', err);
    }
  );
}

function rotateTurnOrder(turnOrder: string): string {
  const turnOrderArr: any[] = turnOrder.split(',');
  const firstElement = turnOrderArr.shift();
  turnOrderArr.push(firstElement);
  return turnOrderArr.join(',');
}

function sendPopup (socket: any, action: string) {
  if (socket && action !== 'chance') {
    if (popupInfoData) {
        const popupData = popupInfoData[action];
        socket.emit('showPlayerInfo', popupData);
    } else {
        console.error('Дані popupInfo не завантажені');
    }
  } else if (socket && action === 'chance') {
    if (popupInfoData) {
      const popupData = popupInfoData[action];
      const chance = getRandomChance(popupData);
      socket.emit('showPlayerInfo', chance);
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
      let newTurnOrder = rotateTurnOrder(turnOrder);
      
      const socketId = newTurnOrder.split(',')[0].split(':')[0];

      // Знаходження сокету гравця
      const targetSocket = io.sockets.sockets.get(socketId);

      if (targetSocket) {
        if(parseInt(newTurnOrder.split(',')[0].split(':')[1]) > 0){
          sendPopup(targetSocket, 'throwDiceOrPayOff');
        } else {
          sendPopup(targetSocket, 'throwDice');
        }
      } else {
        console.error(`Сокет з ID ${socketId} не знайдено`);
      }

      newTurnOrder = newTurnOrder.split(',').map((el) => {
        if(parseInt(el.split(':')[1]) > 0){
          return `${el.split(':')[0]}:${parseInt(el.split(':')[1]) - 1}`;
        } else {
          return el
        }
      }).join(',');

      updateTurnOrderInDatabase(newTurnOrder);
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
      const updatedTurnOrder = turnOrder.split(',').filter((id: string) => {
        const removeSocketId = id.split(':')[0];
        return removeSocketId !== socketId;
      }).join(',');
    

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

function updateTurnOrderInDatabase(newTurnOrder: string, callback?: () => void) {
  executeQuery(
      'UPDATE game_sessions SET turn_order = ? WHERE session_id = ?', 
      [newTurnOrder, 1], 
      () => {
        if (callback) {
          callback();
      }
      }, 
      (err: any) => console.log('Помилка оновлення черговості ходів:', err)
  );
}

function addPlayerToTurnOrder(socketId: string) {
  getTurnOrderFromDatabase(
    (turnOrder: string) => {
      const updatedTurnOrder = turnOrder + (turnOrder ? ',' : '') + socketId + ':0';

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

function getRandomChance(popupData: any) {
  const randomIndex = Math.floor(Math.random() * popupData.length);
  return popupData[randomIndex];
}

function handleGetCash(socketId: any, cash: any, callback: () => void) {
  const updateQuery = `
      UPDATE players p SET p.balance = p.balance + ? 
      WHERE p.player_id = ?
  `;
  
  executeQuery(updateQuery, [cash, socketId],
    () => {
      callback();
    },
    (err: any) => {
      console.error('Помилка оновлення балансу користувача:', err);
    }
  )
}

function handlePayCash(socketId: any, cash: any, callback: () => void) {
  const updateQuery = `
      UPDATE players p 
      SET p.balance = p.balance - ? 
      WHERE p.player_id = ? AND p.balance - ? >= 0
  `;
  
  executeQuery(updateQuery, [cash, socketId, cash],
    () => {
      callback();
    },
    (err: any) => {
      console.error('Помилка оновлення балансу користувача:', err);
    }
  )
}

