import { routes } from './routes';
import express from 'express';
import mysql from 'mysql';

const app = express();

// Параметри підключення до бази даних MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'monopoly',
  password: 'password',
  database: 'monopoly',
});

// Підключення до бази даних
connection.connect((err) => {
  if (err) {
    console.error('Помилка підключення до бази даних:', err.stack);
    return;
  }
  console.log('Підключено до бази даних з id', connection.threadId);
});

// Allow any method from any host and log requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    if('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        console.log(`${req.ip} ${req.method} ${req.url}`);
        next();
    }
});

// Handle POST requests that come in formatted as JSON
app.use(express.json())

// Використання маршрутів
app.use('/', routes);

// start our server on port 4201
app.listen(4201, '127.0.0.1', function() {
    console.log("Server now listening on 4201");
});
