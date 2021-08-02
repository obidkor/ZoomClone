import express from "express";

const app = express();

app.set("view engine","pug");  //view engine
app.set("views", __dirname + "/views"); // template
app.use("/public", express.static(__dirname + "/public"));  // public url(share file with users) which is the frontend file
app.get("/", (req,res) => res.render("home")); // only route handler =>> rendering home.
app.get("/*", (req,res) => res.redirect("/")); // force to backward to home

const handleListen = () => console.log(`Listening on http://localhost:3000`);
app.listen(3000, handleListen);