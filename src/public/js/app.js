const messageList = document.querySelector('ul');
const nicknameForm = document.querySelector('#nickname');
const messageForm = document.querySelector('#message');

const socket = new WebSocket(`ws://${window.location.host}`);

const makeMessage = (type, payload) => {
	const message = { type, payload };
	return JSON.stringify(message);
};

socket.addEventListener('open', () => {
	console.log('Connected to Server ✅');
});

socket.addEventListener('message', (message) => {
	const li = document.createElement('li');
	li.innerText = message.data;
	messageList.append(li);
});

socket.addEventListener('close', () => {
	console.log('Disconnected to Server ❌');
});

const handleNicknameSubmit = (e) => {
	e.preventDefault();
	const input = nicknameForm.querySelector('input');
	socket.send(makeMessage('nickname', input.value));
	input.value = '';
};

const handleMessageSubmit = (e) => {
	e.preventDefault();
	const input = messageForm.querySelector('input');
	socket.send(makeMessage('new_message', input.value));
	const li = document.createElement('li');
	li.innerText = `You: ${input.value}`;
	messageList.append(li);
	input.value = '';
};

nicknameForm.addEventListener('submit', handleNicknameSubmit);
messageForm.addEventListener('submit', handleMessageSubmit);
