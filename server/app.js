const game = require("./game");
const {GameStatus} = require('./../config');

const express = require("express");
const path = require("path");

const app = express();
const api = require("./api");
// const questionModule = require('./questions')
const http = require("http").Server(app);
const io = require("socket.io")(http);

const publicPath = path.resolve(__dirname, "..", "client", "dist");


// Holding of game variables

let rooms = {};

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
    const userID = Math.random().toString(36).substring(7);
    socket.userID = userID;
    console.log(data.roomID);
    if (data.roomID in rooms) {
      game.joinRoom(rooms[data.roomID], data.userID)
    }
    else {
      console.log("creating a room with room id");
      console.log(data.roomID);
      console.log("your user id is " + userID);
      let newRoom = game.createRoom(userID, data.roomID)
      rooms[data.roomID] = newRoom;
    }
    socket.join(data.roomID)
    socket.room = data.roomID;
  });

  socket.on("enterGame",() => {
    game.enterGame(rooms[socket.room])
  });

  socket.on("startGame", () => {
    console.log(socket.room);
    startGame(rooms[socket.room])
    // game.updatePacket(rooms[socket.room], "2013 HSAPQ Tournament 33");
    // game.updateQuestionNumber(rooms[socket.room], 1);

    rooms[socket.room].packet = "2013 HSAPQ Tournament 33";
    rooms[socket.room].questionNumber = 0;
  });

  socket.on("nextQuestion", () => {
    if (rooms[socket.room].state === GameStatus.STOPPED) {
      game.nextQuestion(rooms[socket.room]);
    }
  });

  socket.on("disconnect", () => {
    console.log("a user dced");
  })
});



const startGame = (room, socket) => {
  console.log("starting game");
  room.state = GameStatus.STOPPED;
  room.interval = setInterval(() => {gameStep(room)}, room.gameTick)
};


const gameStep = (room) => {
  console.log("new step from roomID " + room.roomID);
  if (room.state === GameStatus.PLAYING) {
    console.log(room);
    console.log(room.questionStatus.wordIndex);
    console.log(room.questionStatus.powerWords.length);
    if (room.questionStatus.wordIndex >= room.questionStatus.questionWords.length && !room.questionStatus.inPower){
      // question ends
      room.state = GameStatus.STOPPED;
    }
    if (room.questionStatus.wordDelay === 0) {
      const word = room.questionStatus.inPower ? room.questionStatus.powerWords[room.questionStatus.wordIndex] : room.questionStatus.questionWords[room.questionStatus.wordIndex];
      console.log("emitting " + word)
      io.to(room.roomID).emit("gameUpdate", word);
      room.questionStatus.wordIndex += 1;
      room.questionStatus.wordDelay = word.length;
    }
    else {
      room.questionStatus.wordDelay -= 1;
    }

    if (room.questionStatus.wordIndex >= room.questionStatus.powerWords.length && room.questionStatus.inPower) {
      // go to question
      room.questionStatus.inPower = false;
      room.questionStatus.wordIndex = 0
    }
  }
};




