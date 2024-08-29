# Monopoly Game

## Description

This project presents an implementation of the classic Monopoly game using Angular for the front-end and Node.js with WebSocket for the back-end. The game features interactive gameplay with dynamic board updates, player tokens, and real-time communication between players. It allows players to roll dice, move tokens, buy properties, and manage their finances within the game.

## Functionality

- Interactive Board: Players can see and interact with the game board, including properties and their owners.
- Player Tokens: Tokens are dynamically placed on the board according to players' positions.
- Real-Time Updates: The game uses WebSocket for real-time communication, updating the board and player actions instantly.
- Popup Information: Detailed information about properties and actions are displayed in popups.
- Dice Rolling: Players can roll dice to determine their moves, with the results shown visually.
- Player Management: Player information is managed and displayed, including their balance and timer.

## Project Setup

1. Clone the repository:

```
git clone https://github.com/Starlex02/monopoly.git
```

2. Navigate to the project directory:

```
cd monopoly
```

3. Install dependencies:

For the front-end (Angular):

```
npm install
```

For the back-end (Node.js):

```
cd server
npm install
```

For the database (MySQL):

[Install MySQL Community Downloads](https://dev.mysql.com/downloads/installer/) and run.

Change the configuration file:

- Open server/config.ts.
- Replace the values of the fields in the host, user, password, database sections with your database connection data:

```
node initdatabase.ts
```

4. Run the development server:

```
npm run server
```

5. Open the game:

Visit http://localhost:4200 in your browser to join the game session. Ensure that at least 4 players join the session before starting the game.

## Technologies Used

- Angular: For building the front-end of the application, including components, services, and real-time updates.
- Node.js: For creating the back-end server and managing WebSocket connections.
- Socket.IO: For real-time communication between the server and clients.
- MySQL: For managing game data and player information.
- TypeScript: For type-safe development in Angular and Node.js.
- CSS: For styling the game board and UI components.
- HTML: For structuring the game's interface, including the board layout, player cards, popups, and dice.

## Link to the Author

[LinkedIn](https://www.linkedin.com/in/dmytro-chumak/)
