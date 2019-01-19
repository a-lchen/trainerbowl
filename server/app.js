const express = require("express");
const path = require("path");

const app = express();
const api = require("./api");
const questionModule = require('./questions')
const http = require("http").Server(app);
const io = require("socket.io")(http);

const publicPath = path.resolve(__dirname, "..", "client", "dist");


// Holding of game variables

let games = {};

app.use("/api", api );
app.use(express.static(publicPath));

app.get(["/room/:roomId"], (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

http.listen(3000, () => {
  console.log(`Listening on port 3000 and looking in the folder ${publicPath}`);
});

// Websocket shenanigans

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("joinRoom", (data) => {
    console.log(data.roomID);
    if (data.roomID in games) {
      joinRoom(data.roomID, data.user)
    }
    else {
      console.log("error, room that you're trying to join doesn't exist")
    }
  });

  socket.on("createRoom", (data) => {
    console.log("creating a room with room id");
    console.log(data.roomID);
    createRoom(data.userID, data.roomID)

  });

  socket.on("disconnect", () => {
    console.log("a user dced");
  })
});



