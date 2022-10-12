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

function backendDone(msg) {
  // back에서 넘어온 파라미터를 실행
  console.log(`The backend says: `, msg);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");

  // websocket의 socketsend // room이라는 event를 emit
  // websocket은 이벤트명이정해져있지만 socketio는 이벤트명을 정할수 이씀
  // websocket은 string을 보내지만 socketio는 object를 전송할수 있다.
  // 3번째 args로 fuction을 보내고 있음.(callback 용도? back에서 보내진 fuc을 호출할 수 있음.. 실행은 front에서 됨. callback fucc은 마지막 args여야함..)
  // agrs의 숫자는 원하는 만큼 보낼수 있는듯?
  socket.emit("enter_room", input.value, backendDone);
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
