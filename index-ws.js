const express = require('express');
const server = require('http').createServer();
const app = express();
const PORT = 3000;

app.get('/', function(req, res) {
    res.sendFile('index.html', {root: __dirname});
});

server.on('request', app);
server.listen(PORT, function () { console.log('Listening on ' + PORT); });




/** Begin websocket */
const WebSocketServer = require('ws').Server;

// Attach websocket to express server
const wss = new WebSocketServer({ server: server });

process.on('SIGINT', () => {
    console.log('sigint');
    wss.clients.forEach(function each(client) {
        client.close();
    });
    server.close(() => {
        shutdownDB();
    })
})
// Callback function takes the ws library as an argument
wss.on('connection', function connection(ws) {
  const numClients = wss.clients.size;
  console.log('Clients connected: ', numClients);

  wss.broadcast(`Current visitors: ${numClients}`);

  if (ws.readyState === ws.OPEN) {
    ws.send('Welcome!');
  }

  db.run(`INSERT INTO visitors (count, time)
    VALUES(${numClients}, datetime('now'))
  `);

  ws.on('close', function close() {
    wss.broadcast(`Current visitors: ${wss.clients.size}`);
    console.log('A client has disconnected');
  });

});

wss.broadcast = function broadcast(data) {
  console.log('Broadcasting: ', data);
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

/* End Websocket */
/* Begin database */
const sqlite = require('sqlite3');
const db = new sqlite.Database(':memory:');

db.serialize(() => {
    db.run(`
        CREATE TABLE visitors (
            count INTEGER,
            time TEXT
        )
    `)
});

function getCounts() {
    db.each("SELECT * FROM visitors", (err, row) => {
        console.log(row);
    });
}

function shutdownDB() {
    console.log('Shutting down db');

    getCounts();
    db.close();

}