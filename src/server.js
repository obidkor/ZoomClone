import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io";
import express from "express";

//express settings
const app = express();
app.set("view engine", "pug"); //view engine
app.set("views", __dirname + "/views"); // template
app.use("/public", express.static(__dirname + "/public")); // public url(share file with users) which is the frontend file
app.get("/", (req, res) => res.render("home")); // only route handler =>> rendering home.
app.get("/*", (req, res) => res.redirect("/")); // force to backward to home

// host
const httpServer = http.createServer(app);
const wsSever = SocketIO(httpServer);
//connection
wsSever.on("connection", (socket) => {
  // socket io 구독 이벤트는 여기에 작성해준다.

  socket["nickname"] = "Anon";

  // onAny : 모든 이벤트에서 공통으로 실행
  socket.onAny((events) => {
    console.log(`Socket events : ${events}`);
  });

  socket.on("enter_room", (roomName, showRoom) => {
    //최초 room은 connection되면 자동으로 생김.
    //console.log(socket.id); // socket.id : 현재 그룹 id
    //console.log(`beform join:`, socket.rooms); // socket.rooms그룹이 어떤게 있는가

    // socket.join : socket끼리 그룹짓기(room 개념) : join하면 기존에 없으면 새로생기고 있는거면 거기에 그룹화됨.
    // join(1,2,3,4) : 여러개 방에 동시에 입장도 가능
    console.log(socket.nickname);
    socket.join(roomName);
    showRoom();
    socket.to(roomName).emit("welcome", socket.nickname); // roomname에 들어있는 모든 socketid에 noti
    //socket.leave(string roomname) : 방 떠나기
    //socket.to(string roomname).emit(이벤트명) : 방전체에 이벤트 생성하기 chaining 이라 to().to()...이런식으로 가능 ==> 나를 제외한 room사람들에게 broadcast
    //socket.to(socketid).emit(이벤트): private 이벤트를 보낼수도 있음.
  });

  // disconnecting은 socketio 내장 이벤트명이다..
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nickname);
    });
  });

  // message보내는 이벤트
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done(); //화면에 appendchild
  });

  //nickname save 이벤트
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname)); // socket에 닉네임 저장
});

// http protocol
const handleListen = () => console.log(`Listening on http://localhost:4000`);
// port
// app.listen(3000, handleListen);
httpServer.listen(4000, handleListen);

// 2022-10-12, socketio 임포트를 위해 주석처리

// // websocket server in http server
//// host
//const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// function handleConnection(socket) {
//   console.log(socket);
// }
// //users
// const sockets = [];

// //server eventhandler
// wss.on("connection", (socket) => {
//   //add userslist
//   sockets.push(socket);
//   socket["nickname"] = "Anonymous";
//   console.log("Connected to Browser ✅");
//   //socket eventhandler
//   socket.on("close", () => {
//     console.log("Disconnect from the Browser ❌");
//   });
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg.toString());
//     switch (message.type) {
//       case "new_message":
//         //server message to client
//         sockets.forEach((aSocket) => {
//           aSocket.send(`${socket.nickname} : ${message.payload.toString()}`);
//         });
//         break;
//       case "nickname":
//         console.log(
//           `${socket.nickname} sets nick to ${message.payload.toString()} `
//         );
//         socket["nickname"] = message.payload.toString();
//     }
//   });
// });

//git 명령어
// git add .
// git commit -m "comment"
// git push -u origin master
// run 명령어
// npm run dev
// socketio 명령어
//http://localhost:4000/socket.io/socket.io.js
