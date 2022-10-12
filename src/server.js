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

wsSever.on("connection", (socket) => {
  socket.on("enter_room", (roomName, done) => {
    console.log(roomName);
    setTimeout(() => {
      // back에서 파라미터를 넘길수도 있음.
      done("hello from backend");
    }, 1000);
  });
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
