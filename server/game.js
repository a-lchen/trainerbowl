const { GameStatus } = require('../config.js');

const questionModule = require('./questions.js')

const createRoom = (userID, roomID) => {
  return {
    roomID : roomID,
    stats: {userID: initStats()},
    users : [userID],
    packet : null,
    questionNumber : null,
    questionSource: {

    },
    questionStatus : {
      wordIndex : null,
      inPower : false,
      wordDelay : null,
      powerWords : [],
      questionWords : [],
    },
    state : GameStatus.LOBBY,
    interval : null,
    gameTick : 20,
  }
};


const joinRoom = (room, userID) => {
  room.users.push(userID);
  room.stats[userID] = initStats();
};

const enterGame = (room) => {
  console.log("entering a game");
  room.state = GameStatus.LOBBY;
};

const nextQuestion = (room) => {
  getQuestion(room.questionNumber, room.packet, (question) => {
    room.questionNumber += 1;
    room.questionSource = question;
    room.questionStatus.powerWords = question.Power.split(" ");
    room.questionStatus.questionWords = question.Question.split(" ");
    room.questionStatus.wordIndex = 0;
    room.questionStatus.wordDelay = 0;
    room.questionStatus.inPower = true;
    room.state = GameStatus.PLAYING;
  });
};


const initStats = () => {
  return {
    score : 0,
  }
};


module.exports = { nextQuestion, enterGame, createRoom, joinRoom };

