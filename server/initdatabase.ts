import mysql from 'mysql';
import config from './config';

const connection = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password
});

connection.connect(async (err: any) => {
    if (err) throw err;

    console.log('Підключено до бази даних MySQL');

    await createMonopolyDB();
    await useMonopolyDB();
    await createSessionsTableInMonopolyDB();

    const isGameSessionTableEmpty = await isTableEmpty('game_sessions');
    if (isGameSessionTableEmpty) {
        await insertIntoGameSessions();
    }
    
    await createCellsTableInMonopolyDB();

    const isBoardCellsTableEmpty = await isTableEmpty('board_cells');
    if (isBoardCellsTableEmpty) {
        await insertIntoBoardCells();
    }

    await createPlayersTableInMonopolyDB();
    await createPropertyOwnershipTableInMonopolyDB();

    connection.end();
});

async function createMonopolyDB() {
    connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database.database}\`;`, (err) => {
        if (err) throw err;
    });
}

async function useMonopolyDB() {
    connection.query(`USE \`${config.database.database}\`;`, (err) => {
        if (err) throw err;
    });
}

async function createSessionsTableInMonopolyDB() {
    connection.query(
        `
        CREATE TABLE IF NOT EXISTS game_sessions (
            session_id VARCHAR(20) PRIMARY KEY,
            turn_order TEXT
        );
        `,
        (err) => {
            if (err) throw err;
        });
}

async function insertIntoGameSessions() {
    connection.query(`INSERT INTO game_sessions VALUES (?,?);`, [1, ''], (err) => {
            if (err) throw err;
    });
}

async function createCellsTableInMonopolyDB() {
    connection.query(
        `
        CREATE TABLE IF NOT EXISTS board_cells (
            id INT PRIMARY KEY,
            field_order INT NOT NULL,
            type VARCHAR(255) NOT NULL,
            pos VARCHAR(255),
            name VARCHAR(255),
            group_id INT,
            \`group\` VARCHAR(255),
            cost INT,
            base_rent INT,
            rent_0 INT,
            rent_1 INT,
            rent_2 INT,
            rent_3 INT,
            rent_4 INT,
            rent_5 INT,
            buy_branch INT,
            sell_branch INT,
            image VARCHAR(45)
        );
        `,
        (err) => {
            if (err) throw err;
        });
}

async function insertIntoBoardCells() {
    const values = [
        [1, 1, 'start', null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'start'],

        [2, 2, 'monopoly', 'top', 'mn-1', 1, 'type-1', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-2'],
        [3, 3, 'chance', 'top', null, null, null, null, null, null, null, null, null, null, null, null, null, 'chance'],
        [4, 4, 'monopoly', 'top', 'mn-2', 1, 'type-1', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-4'],
        [5, 5, 'chance', 'top', null, null, null, null, null, null, null, null, null, null, null, null, null, 'chance'],
        [6, 6, 'monopoly', 'top', 'mn-3', 2, 'type-2', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-6'],
        [7, 7, 'monopoly', 'top', 'mn-4', 3, 'type-3', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-7'],
        [8, 8, 'chance', 'top', null, null, null, null, null, null, null, null, null, null, null, null, null, 'chance'],
        [9, 9, 'monopoly', 'top', 'mn-5', 3, 'type-3', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-9'],
        [10, 10, 'monopoly', 'top', 'mn-6', 3, 'type-3', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-10'],

        [11, 11, 'prison', null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'prison'],

        [12, 14, 'monopoly', 'rightSide', 'mn-7', 4, 'type-4', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-12'],
        [13, 16, 'monopoly', 'rightSide', 'mn-8', 5, 'type-4', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-13'],
        [14, 18, 'monopoly', 'rightSide', 'mn-9', 4, 'type-5', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-14'],
        [15, 20, 'monopoly', 'rightSide', 'mn-10', 4, 'type-4', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-15'],
        [16, 22, 'monopoly', 'rightSide', 'mn-11', 2, 'type-2', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-16'],
        [17, 24, 'monopoly', 'rightSide', 'mn-12', 6, 'type-6', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-17'],
        [18, 26, 'chance', 'rightSide', null, null, null, null, null, null, null, null, null, null, null, null, null, 'chance'],
        [19, 28, 'monopoly', 'rightSide', 'mn-13', 6, 'type-6', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-19'],
        [20, 30, 'monopoly', 'rightSide', 'mn-14', 6, 'type-6', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-20'],

        [21, 41, 'jackpot', null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'park'],

        [22, 40, 'monopoly', 'bottom', 'mn-15', 7, 'type-7', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-22'],
        [23, 39, 'chance', 'bottom', null, null, null, null, null, null, null, null, null, null, null, null, null, 'chance'],
        [24, 38, 'monopoly', 'bottom', 'mn-16', 7, 'type-7', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-24'],
        [25, 37, 'monopoly', 'bottom', 'mn-17', 7, 'type-7', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-25'],
        [26, 36, 'monopoly', 'bottom', 'mn-18', 2, 'type-2', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-26'],
        [27, 35, 'monopoly', 'bottom', 'mn-19', 8, 'type-8', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-27'],
        [28, 34, 'monopoly', 'bottom', 'mn-20', 8, 'type-8', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-28'],
        [29, 33, 'monopoly', 'bottom', 'mn-21', 5, 'type-5', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-29'],
        [30, 32, 'monopoly', 'bottom', 'mn-22', 8, 'type-8', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-30'],

        [31, 31, 'prison', null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'prison'],

        [32, 29, 'monopoly', 'leftSide', 'mn-23', 9, 'type-9', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-32'],
        [33, 27, 'monopoly', 'leftSide', 'mn-24', 9, 'type-9', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-33'],
        [34, 25, 'chance', 'leftSide', null, null, null, null, null, null, null, null, null, null, null, null, null, 'chance'],
        [35, 23, 'monopoly', 'leftSide', 'mn-25', 9, 'type-9', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-35'],
        [36, 21, 'monopoly', 'leftSide', 'mn-26', 2, 'type-2', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-36'],
        [37, 19, 'chance', 'leftSide', null, null, null, null, null, null, null, null, null, null, null, null, null, 'chance'],
        [38, 17, 'monopoly', 'leftSide', 'mn-27', 10, 'type-10', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-38'],
        [39, 15, 'chance', 'leftSide', null, null, null, null, null, null, null, null, null, null, null, null, null, 'chance'],
        [40, 12, 'monopoly', 'leftSide', 'mn-28', 10, 'type-10', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'cell-40'],

        [41, 13, 'empty', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ]
    for (let i = 0; i < values.length; i++) {
        connection.query(`INSERT INTO board_cells VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`, values[i], (err) => {
            if (err) throw err;
    });    
    }
}

async function createPlayersTableInMonopolyDB() {
    connection.query(
        `
        CREATE TABLE IF NOT EXISTS players (
            player_id VARCHAR(20) PRIMARY KEY,
            name VARCHAR(32) NOT NULL,
            session_id VARCHAR(20) NOT NULL,
            session_order TINYINT(1) NOT NULL,
            balance INT NOT NULL,
            cell_id INT NOT NULL,
            color VARCHAR(18) NOT NULL,
            active TINYINT(1) NOT NULL DEFAULT 1,
            CONSTRAINT fk_game_sessions FOREIGN KEY (session_id)
                REFERENCES game_sessions(session_id),
            CONSTRAINT fk_board_cells FOREIGN KEY (cell_id)
                REFERENCES board_cells(id)
        );
        `,
        (err) => {
            if (err) throw err;
        });
}

async function createPropertyOwnershipTableInMonopolyDB() {
    connection.query(
        `
        CREATE TABLE IF NOT EXISTS player_property_ownership (
            id INT PRIMARY KEY AUTO_INCREMENT,
            player_id VARCHAR(20) NOT NULL,
            cell_id INT NOT NULL,
            property_level ENUM ('base_rent', 'rent_0', 'rent_1', 'rent_2', 'rent_3', 'rent_4', 'rent_5'),
            CONSTRAINT fk_players FOREIGN KEY (player_id)
                REFERENCES players(player_id),
            CONSTRAINT fk_player_property_board_cells FOREIGN KEY (cell_id)
                REFERENCES board_cells(id)
        );
        `,
        (err) => {
            if (err) throw err;
        });
}

async function isTableEmpty(tableName: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        const query = `SELECT COUNT(*) AS count FROM ${tableName};`;
        connection.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results[0].count === 0);
        });
    });
}