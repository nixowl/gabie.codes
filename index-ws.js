const express = require('express');
const server = require('http').createServer();
const app = express();
const PORT = 3000;

app.get('/', function(req, res) {
  res.sendFile('index.html', {root: __dirname});
});

server.on('request', app);

server.listen(PORT, function () { console.log('Listening on ' + PORT); });

// Begin Websocket
const WebSocketServer = require('ws').Server;

// Attach websocket to express server
const wss = new WebSocketServer({ server: server });

// Callback function takes the ws library as an argument
wss.on('connection', function connection(ws) {

  // Currently connected clients
  const numClients = wss.clients.size;
  console.log('Clients connected: ', numClients);

  // Broadcast sends a message to everyone connected, function is defined at bottom of the file
  wss.broadcast(`Current visitors: ${numClients}`);

  // Send message to connected client when socket state equals open
  if (ws.readyState === ws.OPEN) {
    ws.send('Welcome!');
  }

  // Send broadcast when socket state equals 
  ws.on('close', function close() {
    wss.broadcast(`Current visitors: ${wss.clients.size}`);
    console.log('A client has disconnected');
  });

  ws.on('error', function error() {
    
  });
});

/**
 * Broadcast data to all connected clients
 * @param  {Object} data
 * @void
 */
wss.broadcast = function broadcast(data) {
  console.log('Broadcasting: ', data);
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};
/** End Websocket **/