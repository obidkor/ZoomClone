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
const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);

// host
const server = http.createServer(app);
// websocket server in http server
const wss = new WebSocket.Server({ server });

function handleConnection(socket) {
  console.log(socket);
}

wss.on("connection", handleConnection);

// port
server.listen(3000, handleListen);
