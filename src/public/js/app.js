const socket = io();

const welcome = document.getElementById('welcome');
const welcomeForm = welcome.querySelector('form');
const room = document.getElementById('room');

room.hidden = true;

let roomName;

const addMessage = (message) => {
	const ul = room.querySelector('ul');
	const li = document.createElement('li');
	li.innerText = message;
	ul.appendChild(li);
};

const handleMessaeSubmit = (e) => {
	e.preventDefault();
	const messageInput = room.querySelector('#message input');
	const value = messageInput.value;
	socket.emit('new_message', value, roomName, () => {
		addMessage(`You : ${value}`);
	});
	messageInput.value = '';
};

const showRoom = () => {
	welcome.hidden = true;
	room.hidden = false;
	const h3 = room.querySelector('h3');
	h3.innerText = `Room ${roomName}`;
	const messageForm = room.querySelector('#message');
	messageForm.addEventListener('submit', handleMessaeSubmit);
};

const handleRoomSubmit = (e) => {
	e.preventDefault();
	const nicknameInput = welcomeForm.querySelector('#nickname');
	const roomNameInput = welcomeForm.querySelector('#roomname');
	socket.emit('enter_room', nicknameInput.value, roomNameInput.value, showRoom);
	roomName = roomNameInput.value;
	roomNameInput.value = '';
};

welcomeForm.addEventListener('submit', handleRoomSubmit);

socket.on('welcome', (user) => {
	addMessage(`${user} arrived!`);
});

socket.on('bye', (left) => {
	addMessage(`${left} left ㅠㅠ`);
});

socket.on('new_message', (msg) => addMessage(msg));
