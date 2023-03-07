// socket io version 시작
// 백엔드 socket io와 이벤트 주고받는 펑션
const socket = io();

// room div

// 2022-10-18, socketio chat프로그래 주석시작
const room = document.getElementById("room");
const msgForm = room.querySelector("form");

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
let myPeerConnection;
let myDataChannel;

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
      if (currentCamera.label == camera.label) {
        option.selected = true;
      }
      cameraSelect.appendChild(option);

      // // 카메라가 하나밖에 없어서 하나더 만듦.
      // const option2 = document.createElement("option");
      // option2.value = camera.deviceId + 1;
      // option2.innerText = camera.label + "test";
      // cameraSelect.appendChild(option2);
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

  // 카메라를 바꿀경우 바꾼 카메라 Track을 myStream을 다시 바꿔줘야함.
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    console.log(videoTrack);
    const videoSender = myPeerConnection
      .getSenders() // RTCRtpSender : Sender는 다른 Peer에 보내진 Media Stream Track을 컨트롤할 수 있음.
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack); // sender를 통해 Track변경가능
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("input", handleCameraChange);

//welcome(room name 고르기 기능 관련)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

//roomName 고르면 콜백 => getMedtia + RTCPeerConnection
async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

// roomName 제출 펑션
async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcome.querySelector("input");
  // getMedtia + RTCPeerConnection
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
  msgForm.addEventListener("submit", handleMessageSubmit);
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

//Socket codes
// RTC offer(createOffer() => setLocalDescription()) => socket sends the offer
socket.on("welcome", async () => {
  // Data Channel => offer가 new DataChannel 해줘야함.
  myDataChannel = myPeerConnection.createDataChannel("chat");
  myDataChannel.addEventListener("message", (event) => {
    //console.log(event.data);
    addMessage(event.data);
  });
  console.log("made data channel");

  // offer 생성
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);

  console.log("send the offer");

  //send offer to server and server would either to another peer.
  socket.emit("offer", offer, roomName);
});

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  myDataChannel.send(value);
  addMessage(value);
  input.value = "";
}

function addMessage(msg) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
}

// another peer RTC answer(createAnswer() => setLocalDescription()) => socket sends the answer
socket.on("offer", async (offer) => {
  // Data Channel => offer에서 생성한 DataChannel에 이벤트 등록
  myPeerConnection.addEventListener("datachannel", (event) => {
    myDataChannel = event.channel; // offer받는 쪽에서 channel을 정의해야함.
    // chat 보내려면 myDataChannel.send("~~~")
    myDataChannel.addEventListener("message", (event) => {
      //console.log(event.data);
      addMessage(event.data);
    });
  });
  //myPeerConnection이 생성되기 전이 offer event가 시행될 수 있으므로
  //먼저 myPeerConnection을 생성해줘야함!!
  console.log("receive the offer");

  //setRemoteDescription offer!
  myPeerConnection.setRemoteDescription(offer);

  // anwer 생성
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);

  // send answer to server and server would either to origin peer
  socket.emit("answer", answer, roomName);
  console.log("send the answer");
});

// origin peer receives RTC answer(set remoteDescription)
socket.on("answer", (answer) => {
  // origin peer setRemoteDescription(answer);
  console.log("receive the answer");
  myPeerConnection.setRemoteDescription(answer);
});

// WebRTC IceCandidate Event receiver!
socket.on("ice", (ice) => {
  console.log("receive candidate");
  myPeerConnection.addIceCandidate(ice);
});

// WebRTC code
// 보내는쪽 : getUserMedia() => addStream() => createOffer() => setLocalDescription(offer) => (receive answer) => setRemoteDescription(answer)
// 받는쪽 : (receive offer) => setRemoteDescription(offer) => getUserMedia() => addStream() => createAnswer() => setLocalDescription(answer)
function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    // 구글 무료 stun 서버(Peer의 네트워크 스위치 IP 제공용)
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  // WebRTC add IceCandidate Event handler
  myPeerConnection.addEventListener("icecandidate", handleIce);
  // WebRTC add another Peer's Stream Event handler
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

// WebRTC IceCandidate Event handler
function handleIce(data) {
  console.log("send candidate");
  socket.emit("ice", data.candidate, roomName);
}

// WebRTC add another Peer's Stream Event handler
function handleAddStream(data) {
  const peerFace = document.getElementById("peerFace");
  //console.log("Peer's Stream", data.stream);
  //console.log("My's Stream", myPeerConnection.stream);
  peerFace.srcObject = data.stream;
}
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

// room.hidden = true;

// let roomName;

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
