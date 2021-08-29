import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug"); //view engine
app.set("views", __dirname + "/views"); // template
app.use("/public", express.static(__dirname + "/public")); // public url(share file with users) which is the frontend file
app.get("/", (req, res) => res.render("home")); // only route handler =>> rendering home.
app.get("/*", (req, res) => res.redirect("/")); // force to backward to home

// http protocol
const handleListen = () => console.log(`Listening on http://localhost:4000`);
// app.listen(3000, handleListen);

// host
const server = http.createServer(app);
// websocket server in http server
const wss = new WebSocket.Server({ server });

function handleConnection(socket) {
  console.log(socket);
}

//users
const sockets = [];

//server eventhandler
wss.on("connection", (socket) => {
  //add userslist
  sockets.push(socket);
  socket["nickname"] = "Anonymous";
  console.log("Connected to Browser ✅");
  //socket eventhandler
  socket.on("close", () => {
    console.log("Disconnect from the Browser ❌");
  });
  socket.on("message", (msg) => {
    const message = JSON.parse(msg.toString());
    switch (message.type) {
      case "new_message":
        //server message to client
        sockets.forEach((aSocket) => {
          aSocket.send(`${socket.nickname} : ${message.payload.toString()}`);
        });
        break;
      case "nickname":
        socket["nickname"] = message.payload.toString();
    }
  });
});

// port
server.listen(4000, handleListen);
