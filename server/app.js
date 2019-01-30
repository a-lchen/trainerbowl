const game = require("./game");
const {GameState} = require('./../config');

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
    socket.join(data.roomID);
    socket.room = data.roomID;
    io.to(data.roomID).emit("playerJoin", {userID: userID})
  });

  socket.on("enterGame",() => {
    game.enterGame(rooms[socket.room])
  });

  socket.on("startGame", () => {
    console.log(socket.room);
    startGame(rooms[socket.room]);
    rooms[socket.room].packet = "2013 HSAPQ Tournament 33";
    rooms[socket.room].questionNumber = 0;
    game.nextQuestion(rooms[socket.room]);
    io.to(socket.room.roomID).emit("nextQuestionAck");
  });

  socket.on("nextQuestion", () => {
    const room = rooms[socket.room];
    console.log("doing nextQuestion")
    if (room.state === GameState.STOPPED) {
      console.log("stopped, so next question happening");

      game.nextQuestion(rooms[socket.room]);
      io.to(room.roomID).emit("nextQuestionAck");

    }
  });

  socket.on("buzz", () => {
    const room = rooms[socket.room];
    console.log(room);
    if (!room.gameStatus.buzzedUser && (room.state === GameState.AWAITING || room.state === GameState.PLAYING)) {
      room.gameStatus.buzzedUser = socket.userID;
      if (room.state === GameState.PLAYING){
        room.state = GameState.INTERRUPT
      }
      else {
        room.state = GameState.BUZZED;
      }
      socket.emit("buzzAck", {valid: true});
      io.to(room.roomID).emit("playerBuzz", {userID: socket.userID})
    } else {
      socket.emit("buzzAck", {valid: false})
    }
  });

  socket.on("answer", (data) => {
    const room = rooms[socket.room];
    if (game.processAnswer(data.answer, socket.userID, room)){
      io.to(room.roomID).emit("playerAnswer", {correct : true, answer: room.questionSource.answer.join(" ")});
      room.state = GameState.STOPPED
    }
    else {
      if (room.state === GameState.INTERRUPT) {
        room.state = GameState.PLAYING;
      }
      else if (room.state === GameState.BUZZED) {
        room.state = GameState.AWAITING;
      }
      else {
        console.log("erroring")
      }
      io.to(room.roomID).emit("playerAnswer", {correct : false})
    }
    room.gameStatus.buzzedUser = null;
  });

  socket.on("disconnect", () => {
    console.log("a user dced");
  })
});



const startGame = (room, socket) => {
  console.log("starting game");
  room.state = GameState.STOPPED;
  room.interval = setInterval(() => {gameStep(room)}, room.gameTick)
};


const gameStep = (room) => {
  // console.log("new step from roomID " + room.roomID);
  if (room.state === GameState.PLAYING) {
    console.log(room);
    console.log(room.questionStatus.wordIndex);
    console.log(room.questionStatus.powerWords.length);
    if (room.questionStatus.wordIndex >= room.questionStatus.questionWords.length && !room.questionStatus.inPower){
      // question ends
      room.state = GameState.STOPPED;
      io.to(room.roomID).emit("questionDone");
    }
    if (room.questionStatus.wordDelay === 0) {
      const word = room.questionStatus.inPower ? room.questionStatus.powerWords[room.questionStatus.wordIndex] : room.questionStatus.questionWords[room.questionStatus.wordIndex];
      console.log("emitting " + word);
      io.to(room.roomID).emit("gameUpdate", {word: word});
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




