# Monopoly Game

This project was created as part of my graduation thesis. The main goals were to study and apply database technologies, write a game using WebSocket, and use the Angular framework. The motivation for this project was the desire to create my own analogue of the popular Monopoly game to be able to play with friends from a distance. The project was used exclusively for the defence of the diploma thesis.

## Description

This project presents an implementation of the classic Monopoly game using Angular for the front-end and Node.js with WebSocket for the back-end. The game features interactive gameplay with dynamic board updates, player tokens, and real-time communication between players. It allows players to roll dice, move tokens, buy properties, and manage their finances within the game.

## Demo

![GamePlay GIF](/demo/Gameplay.gif)

## Functionality

- Interactive whiteboard:
    + Dynamic display of properties: Players can interact with a game board that displays properties in real time, including their names, colours and ownership status.
    + Click actions: Clicking on a property reveals detailed information such as purchase price, rent, and the cost of buying and selling a branch.

- Player tokens:
    + Custom tokens: Each player can choose a unique token that represents them on the board. Tokens are automatically moved based on dice rolls.
    + Position tracking: The game tracks each player's position and updates it in real time, showing the current square, property or event.

- Real-time updates:
    + Integration with WebSocket: All player actions, such as dice rolls or property purchases, are instantly visible to all participants through the use of WebSocket.
    + Instant feedback: Any changes in the state of the game are immediately displayed on the screen of all players.

- Pop-up information:
    + Confirmation of actions: The game shows confirmation pop-ups for important decisions, such as buying a property or paying rent.

- Dice rolls:
    + Visual animation: The roll of the dice is accompanied by an animation that shows how the dice are rolled before showing the result.
    + Random results: The results of the rolls are completely random, simulating real dice rolls.
    + Turn execution: After a roll, the player's token automatically moves the corresponding number of squares, triggering the corresponding events.

- Player Management:
    + Financial overview: A constant update of the player's financial status, including balance and ownership, is displayed below his icon.
    + Move Timer: The timer ensures that players make decisions within a specified time, maintaining the pace of the game.
    + Bankruptcy handling: If a player does not have enough funds, the game forces them to sell branches. If this is not possible, the game ends for that player.

- Support for multiplayer games:
    + Session management: The game supports one session of up to 4 players.

- Game phases:
    + Active Game Phase: The main phase during which players take turns, roll dice, buy objects, and manage resources.
    + Endgame: The game enters the endgame phase when certain conditions are met, such as a player going bankrupt or completing a certain number of rounds, leading to a winner being declared.

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
npm run initdatabase
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
