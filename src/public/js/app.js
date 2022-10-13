// 브라우저 내장 라이브러리 WebSocket으로 만든것 시작
// 프론트 소켓 객체... 이걸로 이벤트 주고받음.
//const socket = new WebSocket(`ws://${window.location.host}`); // 브라우저 내장 소켓라이브러리
// //client eventhandler
// socket.addEventListener("open", () => {
//   console.log("Connected to Server ✅");
// });

// socket.addEventListener("message", (message) => {
//   const li = document.createElement("li");
//   li.innerText = message.data;
//   messageList.append(li);
// });

// socket.addEventListener("close", () => {
//   console.log("Disconnected from Server ❌");
// });
// function handleSubmit(event) {
//   event.preventDefault();
//   const input = messageForm.querySelector("input");
//   socket.send(makeMessages("new_message", input.value));
//   input.value = "";
// }
// function handleNickSubmit(event) {
//   event.preventDefault();
//   const input = nicknameForm.querySelector("input");
//   socket.send(makeMessages("nickname", input.value));
//   input.value = "";
// }
// 브라우저 내장 라이브러리 websocket으로 만든것 끝

// socket io version 시작
// 백엔드 socket io와 이벤트 주고받는 펑션
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#name input");
  socket.emit("nickname", input.value);
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room : ${roomName}`;
  const msgForm = room.querySelector("#msg");
  const nameForm = room.querySelector("#name");
  msgForm.addEventListener("submit", handleMessageSubmit);
  nameForm.addEventListener("submit", handleNicknameSubmit);
}

function addMessage(msg) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");

  // websocket의 socketsend // room이라는 event를 emit
  // websocket은 이벤트명이정해져있지만 socketio는 이벤트명을 정할수 이씀
  // websocket은 string을 보내지만 socketio는 object를 전송할수 있다.
  // 3번째 args로 fuction을 보내고 있음.(callback 용도? back에서 보내진 fuc을 호출할 수 있음.. 실행은 front에서 됨. callback fucc은 마지막 args여야함..)
  // agrs의 숫자는 원하는 만큼 보낼수 있는듯?
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (nickname) => {
  addMessage(`${nickname} joined`);
});

socket.on("bye", (nickname) => {
  addMessage(`${nickname} left ㅠㅠ`);
});

//socket.on("new_message", (msg) => {addmessage(msg)});
socket.on("new_message", addMessage);
