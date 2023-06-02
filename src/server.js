import http from 'http';
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';
import express from 'express';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
	cors: {
		origin: ['https://admin.socket.io'],
		credentials: true,
	},
});

instrument(wsServer, {
	auth: false,
});

const getPublicRooms = () => {
	const { sids, rooms } = wsServer.sockets.adapter;
	const publicRoomList = [];
	rooms.forEach((_, key) => {
		if (sids.get(key) === undefined) publicRoomList.push(key);
	});

	return publicRoomList;
};

const getUserCounts = (roomName) => wsServer.sockets.adapter.rooms.get(roomName)?.size;

wsServer.on('connection', (socket) => {
	socket['nickname'] = 'Anonymous';
	socket.onAny((event) => {
		console.log(wsServer.sockets.adapter);

		console.log(`Socket Event : ${event}`);
	});
	socket.on('enter_room', (nickname, roomName, done) => {
		socket['nickname'] = nickname;
		socket.join(roomName);
		done(getUserCounts(roomName));
		socket.to(roomName).emit('welcome', socket.nickname, getUserCounts(roomName));
		wsServer.sockets.emit('room_change', getPublicRooms());
	});
	socket.on('disconnecting', () => {
		socket.rooms.forEach((room) => socket.to(room).emit('bye', socket.nickname, getUserCounts(room) - 1));
	});
	socket.on('disconnect', () => {
		wsServer.sockets.emit('room_change', getPublicRooms());
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
