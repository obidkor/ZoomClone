// socket io version 시작
// 백엔드 socket io와 이벤트 주고받는 펑션
const socket = io();

//video 화면
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");

//call div
const call = document.getElementById("call");
//call은 처음에 히든이다.
call.hidden = true;

// audio + video = stream / settings
let myStream;
let muted = false;
let cameraOff = false;
let roomName;

// mediaDevices.enumerateDevices() 장비리스트에서 카메라 장비리스트 가져오기(input)
async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      // 현재 카메라가 선택된 경우
      if (currentCamera.label == cameara.label) {
        option.selected = true;
      }
      cameraSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

//user의 userMedia string
async function getMedia(deviceId) {
  // 초기 media 설정
  const initialConstraints = {
    audio: true,
    video: { facingMode: "user" },
  };
  // camera id 잇을 경우 media설정
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    // usermedia를 stream에 넣어준다.
    myStream = await navigator.mediaDevices.getUserMedia(
      // deviceID 유무에 따라 media설정을 다르게 넣어준다.
      deviceId ? cameraConstraints : initialConstraints
    );
    //stream을 video element에 넣어준다.
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

// Audio Tracks 가지고 와서 enable
function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "UnMute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}
// Video Tracks 가지고 와서 enable
function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

//camera selectiong을 변경할 경우
async function handleCameraChange() {
  await getMedia(cameraSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("input", handleCameraChange);

//welcome(room name 고르기 기능 관련)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

//roomName 고르면 콜백 => 카메라 켜기 funciton
function startMedia() {
  welcome.hidden = true;
  call.hidden = false;
  getMedia();
}

// roomName 제출 펑션
function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcome.querySelector("input");
  socket.emit("join_room", input.value, startMedia);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

//Socket code
socket.on("welcome", () => {
  console.log("someone joined");
});

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

// 2022-10-18, socketio chat프로그래 주석시작
// const welcome = document.getElementById("welcome");
// const form = welcome.querySelector("form");
// const room = document.getElementById("room");

// room.hidden = true;

// let roomName;

// function handleMessageSubmit(event) {
//   event.preventDefault();
//   const input = room.querySelector("#msg input");
//   const value = input.value;
//   socket.emit("new_message", value, roomName, () => {
//     addMessage(`You: ${value}`);
//   });
//   input.value = "";
// }

// function handleNicknameSubmit(event) {
//   event.preventDefault();
//   const input = room.querySelector("#name input");
//   socket.emit("nickname", input.value);
// }

// function showRoom() {
//   welcome.hidden = true;
//   room.hidden = false;
//   const h3 = room.querySelector("h3");
//   h3.innerText = `Room : ${roomName}`;
//   const msgForm = room.querySelector("#msg");
//   const nameForm = room.querySelector("#name");
//   msgForm.addEventListener("submit", handleMessageSubmit);
//   nameForm.addEventListener("submit", handleNicknameSubmit);
// }

// function addMessage(msg) {
//   const ul = room.querySelector("ul");
//   const li = document.createElement("li");
//   li.innerText = msg;
//   ul.appendChild(li);
// }

// function handleRoomSubmit(event) {
//   event.preventDefault();
//   const input = form.querySelector("input");

//   // websocket의 socketsend // room이라는 event를 emit
//   // websocket은 이벤트명이정해져있지만 socketio는 이벤트명을 정할수 이씀
//   // websocket은 string을 보내지만 socketio는 object를 전송할수 있다.
//   // 3번째 args로 fuction을 보내고 있음.(callback 용도? back에서 보내진 fuc을 호출할 수 있음.. 실행은 front에서 됨. callback fucc은 마지막 args여야함..)
//   // agrs의 숫자는 원하는 만큼 보낼수 있는듯?
//   socket.emit("enter_room", input.value, showRoom);
//   roomName = input.value;
//   input.value = "";
// }

// form.addEventListener("submit", handleRoomSubmit);

// socket.on("welcome", (nickname, newCount) => {
//   const h3 = room.querySelector("h3");
//   h3.innerText = `Room : ${roomName} (${newCount})`;
//   addMessage(`${nickname} joined`);
// });

// socket.on("bye", (nickname, newCount) => {
//   const h3 = room.querySelector("h3");
//   h3.innerText = `Room : ${roomName} (${newCount})`;
//   addMessage(`${nickname} left ㅠㅠ`);
// });

// //socket.on("new_message", (msg) => {addmessage(msg)});
// socket.on("new_message", addMessage);

// // room count event
// socket.on("room_change", (rooms) => {
//   const roomList = welcome.querySelector("ul");
//   roomList.innerHTML = "";
//   if (rooms.length === 0) {
//     return;
//   }
//   rooms.forEach((room) => {
//     const li = document.createElement("li");
//     li.innerText = room;
//     roomList.append(li);
//   });
// });
// 2022-10-18, socketio chat프로그래 주석끝
