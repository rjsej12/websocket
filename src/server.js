import http from 'http';
import SocketIO from 'socket.io';
import express from 'express';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on('connection', (socket) => {
	socket['nickname'] = 'Anonymous';
	socket.onAny((event) => {
		console.log(`Socket Event : ${event}`);
	});
	socket.on('enter_room', (nickname, roomName, done) => {
		socket['nickname'] = nickname;
		socket.join(roomName);
		done();
		socket.to(roomName).emit('welcome', socket.nickname);
	});
	socket.on('disconnecting', () => {
		socket.rooms.forEach((room) => socket.to(room).emit('bye', socket.nickname));
	});
	socket.on('new_message', (msg, roomName, done) => {
		socket.to(roomName).emit('new_message', `${socket.nickname}: ${msg}`);
		done();
	});
});

// const sockets = [];
// const wss = new WebSocket.Server({ server });
// wss.on('connection', (socket) => {
// 	sockets.push(socket);
// 	socket['nickname'] = 'Anonymous';
// 	console.log('Connected to Browser ✅');
// 	socket.on('close', () => console.log('Disconnected from the Browser ❌'));
// 	socket.on('message', (msg) => {
// 		const message = JSON.parse(msg);
// 		switch (message.type) {
// 			case 'new_message':
// 				sockets.forEach((aSocket) => {
// 					aSocket.send(`${socket.nickname}: ${message.payload}`);
// 				});
// 			case 'nickname':
// 				socket['nickname'] = message.payload;
// 		}
// 	});
// });

httpServer.listen(3000, handleListen);
