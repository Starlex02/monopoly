import WebSocket, { WebSocketServer } from 'ws';

const wsServer = new WebSocketServer({ port: 4201 });

wsServer.on('connection', (ws: WebSocket) => {
    console.log('Client connected');
    ws.on('message', (message: string) => {
        console.log(`Received message: ${message}`);
    });
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});