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

// 백엔드 socket io와 이벤트 주고받는 펑션
const socket = io();
