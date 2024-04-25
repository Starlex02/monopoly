const config = {
    database: {
        host: 'localhost',
        user: 'monopoly',
        password: 'password',
        database: 'monopoly'
    },
    server: {
        port: 4201
    },
    websocket: {
        cors: {
            origin: "http://localhost:4200",
            methods: ["GET", "POST"],
            allowedHeaders: ["my-custom-header"],
            credentials: true
        }
    }
};

export default config;
